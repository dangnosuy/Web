function set_avatar() {
    const avatar = document.getElementById('avatar_generate')
    const username = localStorage.getItem('username')
    const prompt = document.getElementById('promptInput').value
    var data = {
        username: username,
        prompt : prompt
    }
    fetch('http://127.0.0.1:5550/api/generate_avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(jsonData => {
            console.log(jsonData);
            if (jsonData.success === true) {
                avatar.src = jsonData.avatar_url;
                localStorage.setItem('avatar', jsonData.avatar_url)
                window.location.href = 'Sign_in.html'
            }
            else {
                console.log("Error: ", jsonData.error)
            }
        })
        .catch(err => console.error("Fetch error: ", err));
}
function acceptAvatar() {
     
}