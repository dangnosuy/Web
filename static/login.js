$(document).ready(function()
{
    $('.eye').click(function()
    {
        $(this).toggleClass('show');
        $(this).children('i').toggleClass('fa-eye-slash fa-eye');
        if($(this).hasClass('show'))
        {
            $(this).prev().attr('type','text');
        }
        else 
        {
            $(this).prev().attr('type','password');
        }
    });
});
const SignUpButton = document.getElementById("sign_up");
if (SignUpButton) {
    SignUpButton.addEventListener("click", function(event_up) {
        event_up.preventDefault();
        Send_signup();
    });
}
async function Send_signup() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm").value;

    if (!username.trim() || !email.trim() || !password.trim() || !confirm_password.trim())
    {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    if (password !== confirm_password) 
    {
        alert("Mật khẩu không khớp.");
        return;
    }

    const data = { username, email, password, confirm_password};
    try {
        const response = await fetch("/sign_up", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        });
         
        const result = await response.json();
        if (!response.ok) {
            alert(result.error);
            return;
        }

        if (result.success) {
            alert("Đăng ký thành công!");
            window.location.href = "/sign_in";
        } else {
            alert("Đăng ký thất bại: " + result.message);
        }
    } catch (err) {
           alert(err.message);
    }
}

const SignInButton = document.getElementById("sign_in");
if (SignInButton) {
    SignInButton.addEventListener("click", function(event_in) {
        event_in.preventDefault();
        Send_signin();
    });
}
async function Send_signin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(!username.trim() || !password.trim()){
        alert("Vui lòng nhập đầy đủ thông tin.")
        return;
    }

    const data = {username, password};
    console.log(data)
    try {
        const response = await fetch("/sign_in", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        });
         
        const result = await response.json();
        if (!response.ok){
            alert(result.error);
            return;
        }
        if (result.success) {
            alert("Đăng nhập thành công!");
            window.location.href = "/sign_in";
        } else {
            alert("Đăng nhập thất bại: " + result.message);
        }
    } catch (err) {
           alert(err.message);
    }
}
