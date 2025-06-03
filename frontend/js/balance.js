document.addEventListener('DOMContentLoaded', function () {
    const balance = document.getElementById('user-balance');

    const username = localStorage.getItem('username')
    console.log(username)

    fetch(`http://127.0.0.1:5555/api/get_balance?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(jsonData => {
            console.log(jsonData);
            if (jsonData.success === true) {
                const rawBalance = jsonData.balance.balance;

                // Nếu muốn convert thành Number để format:
                const num = parseFloat(rawBalance);

                balance.textContent = num.toLocaleString() + ' VND'
            }
            else {
                console.log("Error: ", jsonData.error)
            }
        })
        .catch(err => console.error("Fetch error: ", err));
})