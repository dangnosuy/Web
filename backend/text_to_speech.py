from flask import Flask, request, send_file, render_template, jsonify, send_from_directory
import asyncio, pymysql
import edge_tts
import random
import os
from flask_cors import CORS
import datetime
app = Flask(__name__)
CORS(app)
# Kết nối đến database
connection = pymysql.connect(
    host='localhost',
    user='dangnosuy',
    password='dangnosuy',
    database='texttoeverything',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

# Tạo bảng history nếu chưa tồn tại với các trường nhất quán
try:
    with connection.cursor() as cursor:
        create_history = """
            CREATE TABLE IF NOT EXISTS history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255),
                input_text TEXT,
                conversion_type VARCHAR(255),
                result VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        cursor.execute(create_history)
except Exception as e:
    print("Error creating table: ", e)
connection.commit()

# Map giọng đọc theo ngôn ngữ và giới tính
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

@app.route("/api/tts", methods=["POST"])
def tts():
    data = request.get_json()
    text = data.get("text")
    language = data.get("language")
    gender = data.get("gender")
    username = data.get("username")
    app.logger.info(f"Data: {data}")
    # Chọn voice tương ứng
    voice = VOICE_MAP.get(language, {}).get(gender)
    if not voice:
        return "Invalid voice selection", 400

    # Tạo thư mục lưu file nếu chưa tồn tại
    async def generate_and_insert():
        # Tạo file âm thanh từ edge_tts
        try:
            app.logger.info("Dang chay")
            communicate = edge_tts.Communicate(text, voice)

            backend_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(backend_dir, "..")
            speech_dir = os.path.join(project_root, "frontend", "mp3")
            os.makedirs(speech_dir, exist_ok=True)

            file_name = f"{username}_{datetime.datetime.now().strftime('%Y%m%dT%H%M%S')}.mp3"
            file_path = os.path.join(speech_dir, file_name)

            await communicate.save(file_path)
        except Exception as e:
            app.logger.error(f"Error: {e}")
        # Chèn thông tin vào database
        app.logger.info(f"File path: mp3/{file_name}")
        try:
            with connection.cursor() as cursor:
                sql = """
                    INSERT INTO history (username, input_text, conversion_type, result)
                    VALUES (%s, %s, %s, %s)
                """
                values = (username, text, "text_to_speech", "mp3/" + file_name)
                cursor.execute(sql, values)
                connection.commit()

            # Lấy timestamp của dòng vừa insert
                cursor.execute("SELECT timestamp FROM history WHERE id = LAST_INSERT_ID()")
                row = cursor.fetchone()
                if row:
                    ts = row["timestamp"]
                else:
                    ts = datetime.now()
        except Exception as e:
            app.logger.error(f"Error: {e}")

        return {
            "username": username,
            "input_text": text,
            "conversion_type": "tts",
            "result": "mp3/" + file_name,
            "timestamp": int(ts.timestamp() * 1000)
        }

    result = asyncio.run(generate_and_insert())
    return jsonify(result)

@app.route('/mp3/<path:filename>')
def serve_mp3(filename):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(backend_dir, "..")
    speech_dir = os.path.join(project_root, "frontend", "mp3")
    return send_from_directory(speech_dir, filename)
# API lấy lịch sử chuyển đổi
@app.route('/api/history_tts', methods=['GET'])
def get_history():
    username = request.args.get('username')
    history = [] 
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM history WHERE username=%s AND conversion_type = 'text_to_speech' ORDER BY timestamp DESC", (username,))
            history = cursor.fetchall()
    except Exception as e:
        app.logger.error(f"Error: {e}")
    # Chuyển timestamp sang mili giây
    for item in history:
        if isinstance(item['timestamp'], datetime.datetime):
            item['timestamp'] = int(item['timestamp'].timestamp() * 1000)
    return jsonify(history)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5552, debug=True)
