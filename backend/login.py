from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql, bcrypt, random, yagmail

login = Flask(__name__)
CORS(login)

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
        create_user_table = """CREATE TABLE IF NOT EXISTS USERS (
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

EMAIL_SENDER = "tongxuanvuk1920@gmail.com" 
EMAIL_PASSWORD = "bwie ijci hayx jsqt"
pending_verifications = {}
  
def send_email(recipient_email, confirmation_code):
    try:
        yag = yagmail.SMTP(EMAIL_SENDER, EMAIL_PASSWORD) 
        subject = "Email kiểm tra từ AlchemistAI"
        body = f"Mã xác nhận của bạn là: {confirmation_code}"
        yag.send(recipient_email, subject, body)
        login.logger.info(f"Sent to {recipient_email}")
        return True
    except Exception as e:
        login.logger.error(f"Errors when sending mail: {e}")
        return False

@login.route("/api/sign_up", methods=["POST"])
def sign_up():
    data = request.get_json()
    if not data:
        return jsonify({"error": False}), 400
    login.logger.info(f"Data: {data}")
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM USERS WHERE username = %s", (username,))
            check_username = cursor.fetchone() 
            cursor.execute("SELECT * FROM USERS WHERE email = %s", (email,))
            check_email = cursor.fetchone() 

            if check_username or check_email:
                return jsonify({"error": False, "check_username": check_username, "check_email": check_email }), 400    

            verification_code = random.randint(100000, 999999) 
            pending_verifications[email] = {
                "username": username,
                "password_hash": password_hash,
                "verification_code": verification_code
            }

            if send_email(email, verification_code):
                return jsonify({"success": True, "message": "Verification code has been sent"}), 200
            else:
                return jsonify({"error": "Failed to send the confirmation code"}), 400

    except Exception as e:
        login.logger.error(f"Error during registration: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500
    
@login.route("/api/verify_email", methods=["POST"])
def verify_email():
    data = request.get_json()
    if not data:
        return jsonify({"error": False}), 400
    login.logger.info(f"Data: {data}")
    email = data.get("email")
    user_code = data.get("code")

    if email in pending_verifications:
        if pending_verifications[email]["verification_code"] == int(user_code):
            try:
                with connection.cursor() as cursor:
                    username = pending_verifications[email]["username"]
                    password_hash = pending_verifications[email]["password_hash"]
                    cursor.execute("INSERT INTO USERS (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
                    connection.commit()
                del pending_verifications[email]
                return jsonify({"success": True, "message": "Account created successfully"}), 200
            except Exception as e:
                login.logger.error(f"Error during register: {e}")
                return jsonify({"error": f"Database error: {e}"}), 500
        else:
            return jsonify({"error": "Verification is incorrect"}), 400
    else:
        return jsonify({"error": "Emails not on the list"}), 400

@login.route("/api/sign_in", methods=["POST"])
def sign_in():
    data = request.get_json()
    if not data:
        return jsonify({"error": False}), 400
    login.logger.info(f"Data: {data}")
    username = data.get("username")
    password = data.get("password")

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM USERS WHERE username = %s", (username,))
            user = cursor.fetchone()

            if user and bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
                return jsonify({"success": True, "message": "Login Successfully"}), 200
            else:
                return jsonify({"error": False, "message": "Username or password is incorrect"}), 400

    except Exception as e:
        login.logger.error(f"Error during login: {e}")
        return jsonify({"error": f"Database error: {e}"}), 500

if __name__ == "__main__":
    login.run(host='0.0.0.0', port=5550, debug=True)
