from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_mysqldb import MySQL
import hashlib
import os
import bcrypt

login = Flask(__name__)
login.secret_key = "secret_key"

login.config['MYSQL_HOST'] = 'localhost'
login.config['MYSQL_USER'] = 'root'
login.config['MYSQL_PASSWORD'] = '2104230122'
login.config['MYSQL_DB'] = 'web_database'

mysql = MySQL(login)

@login.route("/sign_up", methods=["GET", "POST"])
def sign_up():
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dữ liệu không hợp lệ."}), 400
        
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            check_user = cur.fetchone()
            cur.execute("SELECT * FROM user_pass WHERE email = %s", (email,))
            check_email = cur.fetchone()

            if check_user:
                return jsonify({"error": "Tên người dùng đã tồn tại."}), 400

            if check_email:
                return jsonify({"error": "Email đã tồn tại."}), 400
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            cur.execute("INSERT INTO user_pass (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
            mysql.connection.commit()
            cur.close()
            return jsonify({"success": "Đăng ký thành công!"}), 200

        except Exception as e:
            return jsonify({"error": f"Lỗi cơ sở dữ liệu: {e}"}), 500
    return render_template("sign_up.html")


@login.route("/sign_in", methods=["GET", "POST"])
def sign_in():
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Dữ liệu không hợp lệ."}), 400

        username = data.get("username")
        password = data.get("password")
        
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            user = cur.fetchone()
            cur.close()

            if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
                 return jsonify({"success": "Đăng nhập thành công"}), 200

            else:
                 return jsonify({"error": "Sai mật khẩu hoặc tên người dùng"}), 400

        except Exception as e:
            return jsonify({"error": f"Lỗi cơ sở dữ liệu: {e}"}), 400

    return render_template("sign_in.html")

if __name__ == "__main__":
    login.run(debug=True)
    
    
    