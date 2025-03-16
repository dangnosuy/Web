from flask import Flask, render_template, request, redirect, url_for
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
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm"]
        
        if not username or not email or not password or not confirm_password:
            return "Vui lòng điền đầy đủ thông tin."
        

        if password != confirm_password:
            return "Mật khẩu không khớp."

        try:
            cur = mysql.connection.cursor()

            cur.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            check_user = cur.fetchone()

            cur.execute("SELECT * FROM user_pass WHERE email = %s", (email,))
            check_email = cur.fetchone()

            if check_user:
                return "Tên người dùng đã tồn tại."

            if check_email:
                return "Email đã tồn tại."

            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            cur.execute("INSERT INTO user_pass (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, password_hash))
            mysql.connection.commit()
            cur.close()
            return redirect(url_for("sign_in"))

        except Exception as e:
            return f"Lỗi cơ sở dữ liệu: {e}"

    return render_template("sign_up.html")

@login.route("/sign_in", methods=["GET", "POST"])
def sign_in():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM user_pass WHERE username = %s", (username,))
            user = cur.fetchone()
            cur.close()

            if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
                return "Đăng nhập thành công"
            else:
                return "Đăng nhập thất bại"

        except Exception as e:
            return f"Lỗi cơ sở dữ liệu: {e}"

    return render_template("sign_in.html")

if __name__ == "__main__":
    login.run(debug=True)
    
    
    