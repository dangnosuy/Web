# các model ngon
# black-forest-labs/FLUX.1-dev
# stabilityai/stable-diffusion-xl-base-1.0
import pymysql, datetime, os
from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import InferenceClient

app = Flask(__name__)
CORS(app)

client = InferenceClient(
	provider="hf-inference",
	api_key="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"
)

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

@app.route('/api/texttoimage', methods=['POST', "OPTIONS"])
def text_to_image():
    if request.method == 'OPTIONS':
        # Trả về response cho preflight với HTTP 200 và header CORS
        return jsonify({'message': 'OK'}), 200
    data = request.get_json()
    app.logger.info("Dữ liệu nhận được từ client: %s", data)
    username = data.get('username')
    prompt = data.get('prompt')
    
    try:
        image = client.text_to_image(
	        f"{prompt}",
	        model="black-forest-labs/FLUX.1-dev"
        )
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.join(backend_dir, "..")
        img_dir = os.path.join(project_root, "frontend", "img")
        os.makedirs(img_dir, exist_ok=True)
        
        # Tạo tên file với username và timestamp
        file_name = f"{username}_{datetime.datetime.now().strftime('%Y%m%dT%H%M%S')}.png"
        file_path = os.path.join(img_dir, file_name)

        image.save(file_path, format="PNG")        
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return jsonify({
            "success" : False,
            "error" : str(e)
        })
    app.logger.info(f"File path: img/ + {file_name}")
    InsertFileToDatabase(username, prompt, "text_to_image", "img/" + file_name)
    return jsonify({
        "success" : True,
        "result_path" : file_path,
    })

@app.route('/api/get_tti_data', methods=["GET"])
def get_tti_data():
    try:
        username = request.args.get('username')
        type = request.args.get('type') #tts, ttm, tti, ttv...
    except Exception as e:
        app.logger.info("Error: ", e)
    try:
        with connection.cursor() as cursor:
            sql = "SELECT result FROM history WHERE username=%s AND conversion_type = (%s)"
            cursor.execute(sql, (username, type))
            result = cursor.fetchall()
            list_history = [row['result'].replace('\\', '/') for row in result]
            list_history.reverse()

    except Exception as e:
        return jsonify({"success" : False, "error" : e}), 401 
    
    app.logger.info(f"Data: {list_history}")
    return jsonify({
        "success" : True,
        "tts_data" : list_history
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
    app.run(host='0.0.0.0', port=5551, debug=True)