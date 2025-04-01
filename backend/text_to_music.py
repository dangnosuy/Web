import pymysql, datetime, os, requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from IPython.display import Audio

app = Flask(__name__)
CORS(app)


connection = pymysql.connect(
    host='localhost',
    user='dangnosuy',
    password='dangnosuy',
    database='texttoeverything',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        create_history = """CREATE TABLE IF NOT EXISTS history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            input_text VARCHAR(255),
            conversion_type VARCHAR(255),
            result VARCHAR(255),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"""
        cursor.execute(create_history)
except Exception as e:
    print("Error: ", e)

connection.commit()

def InsertFileToDatabase(username, prompt, type, result_path):
    try:
        with connection.cursor() as cursor:
            insert = "INSERT INTO history (username, input_text, conversion_type, result) VALUES (%s, %s, %s, %s)"
            cursor.execute(insert, (username, prompt, type, result_path))
            connection.commit()
            return True
    except Exception as e:
        app.logger.info(f"Error: {e}")
        return False

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small"
headers = {"Authorization": "Bearer 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"} 

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content

@app.route('/api/texttomusic', methods=['POST'])
def TextToMusic():
    data = request.get_json()
    username = data.get('username')
    prompt = data.get('prompt')  
    app.logger.info(f"Data: {data}")  
    try:
        payload = {"inputs" : prompt}
        audio_byte = query(payload)
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.join(backend_dir, "..")
        img_dir = os.path.join(project_root, "frontend", "music")
        os.makedirs(img_dir, exist_ok=True)
        
        file_name = f"{username}_{datetime.datetime.now().strftime('%Y%m%dT%H%M%S')}.wav"
        file_path = os.path.join(img_dir, file_name)
        
        with open(file_path, "wb") as f:
            f.write(audio_byte)
        app.logger.info(f"File path: music/{file_name}")
        InsertFileToDatabase(username, prompt, 'text_to_music', 'music/' + file_name)
        return jsonify({
            "success" : True,
            "file_path" : f"music/{file_name}"
		})
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({
            "success" : False,
            "error" : str(e)
        })
        

@app.route('/api/get_ttm_data', methods=["GET"])
def get_tti_data():
    try:
        username = request.args.get('username')
        type = request.args.get('type') #tts, ttm, tti, ttv...
    except Exception as e:
        app.logger.info("Error: ", e)
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM history WHERE username=%s AND conversion_type = (%s) ORDER BY id DESC;"
            cursor.execute(sql, (username, type))
            result = cursor.fetchall()

    except Exception as e:
        return jsonify({"success" : False, "error" : e}), 401 
    
    app.logger.info(f"Data: {result}")
    return jsonify({
        "success" : True,
        "tts_data" : result
    }), 201

@app.route('/api/delete_data', methods=["POST"]) 
def delete_data():
    data = request.get_json()
    app.logger.info(data)
    username = data.get('username')
    file_path = data.get('file_path')
    type = data.get('type')

    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM history WHERE username=%s AND result=%s"
            cursor.execute(sql, (username, file_path))    
            connection.commit()
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"success": True}), 202
        else:
            return jsonify({"success": False, "error": "File not found"}), 201
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 401

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5554, debug=True)