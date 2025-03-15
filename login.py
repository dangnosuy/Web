from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import hashlib
import os

login = Flask(__name__)
login.secret_key = "secret_key"  # Thay đổi khóa bí mật này

# Cấu hình cơ sở dữ liệu
basedir = os.path.abspath(os.path.dirname(__file__))
login.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'user_pass.db')
login.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(login)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def hash_password(self, password):
        self.password_hash = hashlib.sha256(password.encode()).hexdigest()

    def check_password(self, password):
        return self.password_hash == hashlib.sha256(password.encode()).hexdigest()

with login.app_context():
    db.create_all()

@login.route("/sign_up.html", methods=["GET", "POST"])
def sign_up():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm"]

        if password != confirm_password:
            return "Mật khẩu không khớp."

        if User.query.filter_by(username=username).first():
            return "Tên người dùng đã tồn tại."

        if User.query.filter_by(email=email).first():
            return "Email đã tồn tại."

        user = User(username=username, email=email)
        user.hash_password(password)

        db.session.add(user)
        db.session.commit()

        return redirect(url_for("sign_in"))

    return render_template("sign_up.html")

@login.route("/sign_in.html", methods=["GET", "POST"])
def sign_in():
   if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            return "Đăng nhập thành công"
        else:
            return "Đăng nhập thất bại"
   return render_template("sign_in.html") # hiển thị trang sign_in.html

if __name__ == "__main__":
    login.run(debug=True)