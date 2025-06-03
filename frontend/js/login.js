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

const username_form = document.getElementById("username")
if(username_form){
    username_form.addEventListener("click", function() {
        document.getElementById("username_form").className = "form";
});
}

const email_form = document.getElementById("email")
if(email_form){
    email_form.addEventListener("click", function() {
        document.getElementById("email_form").className = "form";
});
}

const password_form = document.getElementById("password")
if(password_form){
    password_form.addEventListener("click", function() {
        document.getElementById("password_form").className = "form";
});
}

const confirm_form = document.getElementById("confirm")
if(confirm_form){
    confirm_form.addEventListener("click", function() {
        document.getElementById("confirm_form").className = "form";
});
}

const verify_form = document.getElementById("verify")
if(verify_form){
    verify_form.addEventListener("click", function() {
        document.getElementById("verify_form").className = "form";
});
}

const reset_password = document.getElementById("reset_password")
if(reset_password){
    reset_password.addEventListener("click", function() {
        document.getElementById("SignIn_form").style.display = "none";
        document.getElementById("ResetPassword_form").style.display = "block";
        document.getElementById("return").style.display = "";
});
}

const SignUpButton = document.getElementById("sign_up");
if (SignUpButton) {
    SignUpButton.addEventListener("click", function(event_up) {
        event_up.preventDefault();
        document.getElementById("error_message").textContent = ""
        Send_SignUp();
    });
}
async function Send_SignUp() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm").value;

    if (!username.trim() || !email.trim() || !password.trim() || !confirm_password.trim())
        {
            error_message = "Please enter ";
            if (!username.trim()) {
                document.getElementById("username_form").className = "form_error";
                error_message += "Username, "
            }
            if (!email.trim()) {
                document.getElementById("email_form").className = "form_error";
                error_message += "Email, "
            }
            if (!password.trim()) {
                document.getElementById("password_form").className = "form_error";
                error_message += "Password, "
            }
            if (!confirm_password.trim()) {
                document.getElementById("confirm_form").className = "form_error";
                error_message += "Confirm Password, "
            }
            error_message = error_message.slice(0, -2) + "."
            document.getElementById("error_message").textContent = error_message
            return
        }
    
        if (password != confirm_password) {
            document.getElementById("confirm_form").className = "form_error";
            document.getElementById("password_form").className = "form_error";
            document.getElementById("error_message").textContent = "Password and password confirmation don't match."
            return
        }

        const data = { username, email, password};
    try {
        const response = await fetch("http://127.0.0.1:5550/api/sign_up", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        });
         
        const result = await response.json();
        if (result.check_username || result.check_email) {
            error_message = "";
            if(result.check_username){
                document.getElementById("username_form").className = "form_error";
                error_message += "Username, "
            }
            if(result.check_email){
                document.getElementById("email_form").className = "form_error";
                error_message += "Email, "
            }
            error_message = error_message.slice(0, -2) + " has been used"
            document.getElementById("error_message").textContent = error_message
            return
        }

        if (result.success) {
            localStorage.setItem('username', username);
            document.getElementById("SignUp_form").style.display = "none";
            document.getElementById("verify_email_form").style.display = "block";
        } else {
            alert("Registration Failed: " + result.message);
        }
    } catch (err) {
           alert(err.message);
    }
}

const SignInButton = document.getElementById("sign_in");
if (SignInButton) {
    SignInButton.addEventListener("click", function(event_in) {
        event_in.preventDefault();
        document.getElementById("error_message").textContent = ""
        Send_SignIn();
    });
}
async function Send_SignIn() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if(!username.trim() || !password.trim())
    {
        error_message = "Please enter";
        if (!username.trim()) {
            document.getElementById("username_form").className = "form_error";
            error_message += " Username,"
        }
        if (!password.trim()) {
            document.getElementById("password_form").className = "form_error";
            error_message += " Password,"
        }
        error_message = error_message.slice(0, -1) + "."
        document.getElementById("error_message").textContent = error_message
        return
    }

    const data = {username, password};
    try {
        const response = await fetch("http://127.0.0.1:5550/api/sign_in", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        });
         
        const result = await response.json();
        if (!response.ok){
            document.getElementById("username_form").className = "form_error";
            document.getElementById("password_form").className = "form_error";
            document.getElementById("error_message").textContent = result.message;
            return
        }
        if (result.success) {
            const remember = document.getElementById("rememberMe").checked;

            if (remember) {
                // Lưu giữ đăng nhập lâu dài
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("username", username);
                localStorage.setItem("rememberMe", "true");
            } else {
            // Chỉ lưu trong session (mất khi đóng trình duyệt)
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("username", username);
                localStorage.removeItem("rememberMe"); 
            }
            window.location.href = "index.html";
        } else {
            alert("Login Failed: " + result.message);
        }
    } catch (err) {
           alert(err.message);
    }
}

const VerifyEmailButton = document.getElementById("verify_email");
if (VerifyEmailButton ) {
    VerifyEmailButton.addEventListener("click", function(event_in) {
        event_in.preventDefault();
        document.getElementById("error_message_verify").textContent = ""
        Send_VerifyEmail();
    });
}
async function Send_VerifyEmail() {
    const email = document.getElementById("email").value;
    const code = document.getElementById("verify").value;
    
    if(!code.trim()||!email.trim())
    {
        document.getElementById("verify_form").className = "form_error";
        document.getElementById("error_message_verify").textContent = "Please enter the verification code";
        return
    }
    try {
        const response = await fetch("http://127.0.0.1:5550/api/verify_email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code }),
        });

        const result = await response.json();
        if (!response.ok) {
            document.getElementById("verify_form").className = "form_error";
            document.getElementById("error_message_verify").textContent = result.message;
            return;
        }

        if (result.success) {
            window.location.href = 'Sign_in.html'
        } else {
            alert("Email Confirmation Failed: " + result.message);
        }
    } catch (err) {
        alert(err.message);
    }
}

const ResetPasswordButton = document.getElementById("submit_reset");
if (ResetPasswordButton) {
    document.getElementById("submit_reset").addEventListener("click", function(event_in) {
        event_in.preventDefault();
        Send_SubmitResetPassword();
    });
}
async function Send_SubmitResetPassword() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;

    if(!username.trim() || !email.trim())
    {
        error_message = "Please enter";
        if (!username.trim()) {
            document.getElementById("username_form").className = "form_error";
            error_message += " Username,"
        }
        if (!email.trim()) {
            document.getElementById("email_form").className = "form_error";
            error_message += " Email,"
        }
        error_message = error_message.slice(0, -1) + "."
        document.getElementById("error_message_verify").textContent = error_message
        return
    }

    const data = {username, email};
    try {
        const response = await fetch("http://127.0.0.1:5550/api/reset_password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        });
         
        const result = await response.json();
        if (!response.ok){
            document.getElementById("username_form").className = "form_error";
            document.getElementById("email_form").className = "form_error";
            document.getElementById("error_message_verify").textContent = result.message;
            return
        }
        if (result.success) {
            window.location.href = "Sign_in.html";
        } else {
            alert("Reset password Failed: " + result.message);
        }
    } catch (err) {
           alert(err.message);
    }
}

const googleSignInButton = document.querySelector('.other:nth-child(1)');
const googleClientId = '2538207828-gqk1ah92p6fr28gsji3dr97hlmhjghn7.apps.googleusercontent.com';

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    sendGoogleTokenToBackend(response.credential);  
}

function sendGoogleTokenToBackend(idToken) {
    fetch("http://127.0.0.1:5550/api/google_login", {
        method: "POST",
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken: idToken })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem("loggedIn", "true");
            localStorage.setItem('username', data.username);
            window.location.href = "./index.html";
        } else {
        alert("Đăng nhập bằng Google thất bại: " + data.message);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert("Lỗi khi giao tiếp với backend.");
    });
    }

    window.onload = function () {
    google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        googleSignInButton,
        { theme: "outline", size: "large" }  
    );
    }


window.addEventListener('DOMContentLoaded', () => {
  const isRemembered = localStorage.getItem("loggedIn") === "true";
  if (isRemembered) {
    document.getElementById("rememberMe").checked = true;
  }
});