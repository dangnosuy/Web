from flask import Flask, request, send_file, render_template, jsonify, send_from_directory
import asyncio
import edge_tts
import random
import os
from db_config import get_connection
from datetime import datetime

app = Flask(__name__)

VOICE_MAP = {
    "vi": {"male": "vi-VN-NamMinhNeural", "female": "vi-VN-HoaiMyNeural"},
    "en": {"male": "en-US-GuyNeural", "female": "en-US-AriaNeural"},
    "pt": {"male": "pt-BR-AntonioNeural", "female": "pt-BR-FranciscaNeural"},
    "ko": {"male": "ko-KR-SunHiNeural", "female": "ko-KR-SunHiNeural"},
    "zh": {"male": "zh-CN-YunxiNeural", "female": "zh-CN-XiaoxiaoNeural"},
    "ja": {"female": "ja-JP-NanamiNeural"},
    "it": {"female": "it-IT-IsabellaNeural"},
    "es": {"male": "es-ES-AlvaroNeural", "female": "es-ES-ElviraNeural"},
    "fr": {"male": "fr-FR-HenriNeural", "female": "fr-FR-DeniseNeural"},
    "en-kd": {"male": "en-GB-RyanNeural", "female": "en-GB-LibbyNeural"},
}

@app.route("/tts", methods=["POST"])
def tts():
    data = request.json
    text = data.get("text")
    language = data.get("language")
    gender = data.get("gender")
    username = data.get("username")

    voice = VOICE_MAP.get(language, {}).get(gender)
    if not voice:
        return "Invalid voice selection", 400

    os.makedirs("outputs/audio", exist_ok=True)
    output_file = f"outputs/audio/{random.randint(1, 1000000)}.mp3"

    async def generate_and_insert():
        # Tạo file âm thanh
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)

        # Ghi vào DB
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
            INSERT INTO history (username, input_text, conversion_type, result)
            VALUES (%s, %s, %s, %s)
        """
        values = (username, text, "tts", output_file)
        cursor.execute(sql, values)
        conn.commit()

        # Lấy timestamp của dòng vừa insert
        cursor.execute("SELECT timestamp FROM history WHERE id = LAST_INSERT_ID()")
        timestamp = cursor.fetchone()[0]

        cursor.close()
        conn.close()

        return {
            "username": username,
            "input_text": text,
            "conversion_type": "tts",
            "result": output_file,
            "timestamp": int(timestamp.timestamp() * 1000)
        }

    result = asyncio.run(generate_and_insert())
    return jsonify(result)

@app.route("/")
def index():
    return render_template("texttospeech.html")


# API to get history
@app.route('/api/history', methods=['GET'])
def get_history():
    username = request.args.get('username')
    conn= get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM history WHERE username=%s ORDER BY timestamp DESC", (username,))
    history = cursor.fetchall()
    # Convert timestamp to milliseconds
    for item in history:
        if isinstance(item['timestamp'], datetime):
            item['timestamp'] = int(item['timestamp'].timestamp() * 1000)  # milliseconds

    return jsonify(history)

# API to get audio file
@app.route('/outputs/audio/<filename>')
def serve_audio(filename):
    return send_from_directory('outputs/audio', filename)

if __name__ == "__main__":
    app.run(debug=True)
