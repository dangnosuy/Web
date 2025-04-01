$(document).ready(function () {
    $('.eye').click(function () {
        $(this).toggleClass('show');
        $(this).children('i').toggleClass('fa-eye-slash fa-eye');
        if ($(this).hasClass('show')) {
            $(this).prev().attr('type', 'text');
        }
        else {
            $(this).prev().attr('type', 'password');
        }
    });


    document.getElementById("username").addEventListener("input", function () {
        document.getElementById("check_username").className = "form";
    });

    const email_form = document.getElementById("email")
    if (email_form) {
        email_form.addEventListener("input", function () {
            document.getElementById("check_email").className = "form";
        });
    }

    document.getElementById("password").addEventListener("input", function () {
        document.getElementById("check_password").className = "form";
    });

    const confirm_form = document.getElementById("confirm")
    if (confirm_form) {
        confirm_form.addEventListener("input", function () {
            document.getElementById("check_confirm").className = "form";
        });
    }

    const SignUpButton = document.getElementById("sign_up");
    if (SignUpButton) {
        SignUpButton.addEventListener("click", function (event_up) {
            event_up.preventDefault();
            Send_signup();
        });
    }
    
    async function Send_signup() {
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm_password = document.getElementById("confirm").value;

        if (!username.trim() || !email.trim() || !password.trim() || !confirm_password.trim()) {
            if (!username.trim()) {
                document.getElementById("check_username").className = "form_error";
            }
            if (!email.trim()) {
                document.getElementById("check_email").className = "form_error";
            }
            if (!password.trim()) {
                document.getElementById("check_password").className = "form_error";
            }
            if (!confirm_password.trim()) {
                document.getElementById("check_confirm").className = "form_error";
            }
            return
        }

        if (password != confirm_password) {
            document.getElementById("check_confirm").className = "form_error";
        }

        const password_hash = sha256(password);
        //const password_hash = await bcrypt.hash(password, 10)
        const data = { username, email, password_hash };
        try {
            const response = await fetch("http://127.0.0.1:5550/api/sign_up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                document.getElementById("check_username").className = "form_error";
                document.getElementById("check_email").className = "form_error";
            }

            if (result.success) {
                console.log(result)
                localStorage.setItem('username', username);
                document.getElementById('avatarModal').style.display = 'flex';
                // window.location.href = "./Sign_in.html";
            } else {
                alert("Đăng ký thất bại: " + result.message);
            }
        } catch (err) {
            alert(err.message);
        }
    }

    const SignInButton = document.getElementById("sign_in");
    if (SignInButton) {
        SignInButton.addEventListener("click", function (event_in) {
            event_in.preventDefault();
            Send_signin();
        });
    }
    async function Send_signin() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        
        if (!username.trim() || !password.trim()) {
            if (!username.trim()) {
                document.getElementById("check_username").className = "form_error";
            }
            if (!password.trim()) {
                document.getElementById("check_password").className = "form_error";
            }
            return
        }

        const password_hash = sha256(password)
        const data = { username, password_hash };
        try {
            const response = await fetch("http://127.0.0.1:5550/api/sign_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (!response.ok) {
                alert(result.error);
                return;
            }
            if (result.success) {
                sessionStorage.setItem("loggedIn", "true");
                localStorage.setItem('username', username);
                window.location.href = "./index.html";
            } else {
                alert("Đăng nhập thất bại: " + result.message);
            }
        } catch (err) {
            alert(err.message);
        }
    }
    $('#randomBtn').click(function () {
        // Giả sử bạn có hàm randomPrompt() để tạo prompt ngẫu nhiên
        // Ví dụ:
        let prompts = [
            "A fox with a detective hat",
            "A cat riding a bicycle",
            "A dog in a superhero costume",
            "A squirrel playing the violin",
            "A penguin surfing on a wave",
            "A rabbit in a space suit",
            "A giraffe riding a skateboard",
            "A panda detective solving a mystery",
            "A turtle riding a scooter",
            "A parrot dressed as a pirate",
            "A lion in a professor outfit",
            "A koala enjoying a cup of coffee in a cafe",
            "A hedgehog wearing a wizard hat",
            "A raccoon painting a masterpiece",
            "A flamingo playing soccer",
            "A crocodile with a top hat and monocle",
            "A horse dressed as a superhero",
            "A monkey riding a motorcycle",
            "A cat flying a small plane",
            "A dog in a detective outfit",
            "A fox riding a skateboard",
            "A bear on a surfboard",
            "A monkey in a space suit exploring Mars"
        ];
        let randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        $('#promptInput').val(randomPrompt);
        // Sau khi thay đổi prompt, nút generate sẽ hiện lại
        $('#generateBtn').removeClass('hidden');
        $('#setAvatarBtn').addClass('hidden');
    });

    // Sự kiện khi nhấn nút Generate để tạo avatar
    $('#generateBtn').click(function () {
        // Thực hiện quá trình generate avatar dựa trên prompt hiện tại.
        // Sau khi hoàn thành việc generate avatar (ví dụ cập nhật ảnh hiển thị trong gallery hoặc modal),
        // ẩn nút Generate và hiện nút Set as Avatar.
        // Giả sử avatar đã được tạo xong, bạn có thể cập nhật src của một img nào đó.
        // Ví dụ:
        // $('#avatarImage').attr('src', generatedAvatarUrl);
        $(this).addClass('hidden');
        $('#setAvatarBtn').removeClass('hidden');
    });

    // Sự kiện khi nhấn nút Set as Avatar
    $('#setAvatarBtn').click(function () {
        // Xử lý logic set avatar cho người dùng, có thể lưu vào server hoặc cập nhật giao diện người dùng.
        alert("Avatar của bạn đã được đặt!");
    });
});