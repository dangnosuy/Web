from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt, pymysql

login = Flask(__name__)
CORS(login)

connection = pymysql.connect(
    host='localhost',
    user='root',
    password='2104230122',
    database='texttoeverything',
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        create_user_table = """CREATE TABLE IF NOT EXISTS user_pass (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )"""
        cursor.execute(create_user_table)
except Exception as e:
    print("Error creating user table: ", e)

connection.commit()

@login.route("/api/sign_up", methods=["POST"])
def sign_up():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data."}), 400
    login.logger.info(f"Data: {data}")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            check_user = cursor.fetchone()
            cursor.execute("SELECT * FROM user_pass WHERE email = %s", (email,))
            check_email = cursor.fetchone()

            if check_user:
                return jsonify({"error": "Username already exists."}), 400

            if check_email:
                return jsonify({"error": "Email already exists."}), 400

            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("INSERT INTO user_pass (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
            connection.commit()
            return jsonify({"success": "Registration successful!"}), 200

    except Exception as e:
        login.logger.error(f"Error during registration: {e}")
        return jsonify({"error": "loil"}), 500

@login.route("/api/sign_in", methods=["POST"])
def sign_in():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid data."}), 400

    username = data.get("username")
    password = data.get("password")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            user = cursor.fetchone()

            if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return jsonify({"success": "Login successful"}), 200
            else:
                return jsonify({"error": "Incorrect username or password"}), 400

    except Exception as e:
        login.logger.error(f"Error during login: {e}")
        return jsonify({"error": f"Database error: {e}"}), 400

if __name__ == "__main__":
    login.run(host='0.0.0.0', port=5550, debug=True)