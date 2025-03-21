import pymysql, asyncio, datetime, os, random
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import edge_tts

app = Flask(_name_)
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

# Tạo bảng CHAT nếu chưa tồn tại
try:
    with connection.cursor() as cursor:
        create_table = """
            CREATE TABLE IF NOT EXISTS CHAT (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255),
                prompt TEXT,
                type VARCHAR(50),
                result_path VARCHAR(255),
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        cursor.execute(create_table)
    connection.commit()
except Exception as e:
    print("Error creating table: ", e)

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

def insert_to_db(username, prompt, conv_type, result_path):
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO CHAT (username, prompt, type, result_path) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (username, prompt, conv_type, result_path))
        connection.commit()
        return True
    except Exception as e:
        app.logger.error(f"DB Insert error: {e}")
        return False

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.get_json()
    app.logger.info("Dữ liệu nhận được từ client: %s", data)
    
    text = data.get("text")
    language = data.get("language")
    gender = data.get("gender")
    username = data.get("username")
    
    voice = VOICE_MAP.get(language, {}).get(gender)
    if not voice:
        return jsonify({"success": False, "error": "Invalid voice selection"}), 400

    output_file = f"mp3/{username}_{datetime.datetime.now().strftime('%Y%m%dT%H%M%S')}.mp3"
    
    async def generate_audio_and_insert():
        # Tạo file âm thanh từ edge_tts
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)
        
        # Chèn thông tin vào DB
        insert_to_db(username, text, "text_to_speech", output_file)
        
        # Lấy timestamp của dòng vừa insert
        with connection.cursor() as cursor:
            cursor.execute("SELECT create_at FROM CHAT WHERE id = LAST_INSERT_ID()")
            row = cursor.fetchone()
            if row and 'create_at' in row:
                timestamp = int(row['create_at'].timestamp() * 1000)
            else:
                timestamp = int(datetime.datetime.now().timestamp() * 1000)
        return {
            "username": username,
            "input_text": text,
            "conversion_type": "text_to_speech",
            "result": output_file,
            "timestamp": timestamp
        }
    
    result = asyncio.run(generate_audio_and_insert())
    return jsonify(result)

@app.route('/api/history/tts', methods=['GET'])
def get_history():
    username = request.args.get('username')
    conv_type = "text_to_speech"
    try:
        with connection.cursor() as cursor:
            if conv_type:
                cursor.execute("SELECT * FROM CHAT WHERE username=%s AND type=%s ORDER BY create_at DESC", (username, conv_type))
            else:
                cursor.execute("SELECT * FROM CHAT WHERE username=%s ORDER BY create_at DESC", (username,))
            history = cursor.fetchall()
            # Chuyển timestamp sang mili giây
            for item in history:
                if isinstance(item['create_at'], datetime.datetime):
                    item['create_at'] = int(item['create_at'].timestamp() * 1000)
        return jsonify({"success": True, "history": history}), 200
    except Exception as e:
        app.logger.error(f"Error fetching history: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "_main_":
    app.run(host='0.0.0.0', port=5550, debug=True)
