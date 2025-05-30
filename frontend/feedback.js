let selectedRating = 0; // Biến lưu giá trị rating

  // Lấy tất cả các sao và phần tử hiển thị
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.getElementById('rating-value');

  // Thêm sự kiện click cho từng sao
  stars.forEach(star => {
    star.addEventListener('click', function () {
      selectedRating = parseInt(this.getAttribute('data-value'));

      // Cập nhật giao diện
      stars.forEach(s => {
        s.classList.toggle('active', s.getAttribute('data-value') <= selectedRating);
      });

      ratingValue.textContent = `Selected Rating: ${selectedRating}`;
    });
  });

  function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    // Đặt inline style cho notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = isSuccess ? '#4caf50' : '#f44336';
    notification.style.color = '#fff';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.style.transform = 'translateY(-100%)';
    notification.style.opacity = '0';
    notification.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    
    // Hiệu ứng slide xuống
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // Ẩn popup sau 3 giây
    setTimeout(() => {
      notification.style.transform = 'translateY(-100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
function SendFeedback(event) {
    event.preventDefault();
    var username = document.getElementById('name')
    var email = document.getElementById('email')
    var rating = selectedRating
    var feedback = document.getElementById('feedbackText')

    
    var data = {
        username: username.value,
        email: email.value,
        rating: rating,
        feedback: feedback.value
    }
    username.value = email.value = feedback.value = ""
    fetch('http://127.0.0.1:5553/api/feedback', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(reponse => reponse.json())
    .then(jsonData => {
        console.log(jsonData)
        if (jsonData.success === false) {
            console.log("Lỗi: " + jsonData.error)
            showNotification("Gửi phản hồi thất bại. Hãy kiểm tra lại thông tin", false);
        }
        else {
            showNotification("Gửi phản hồi thành công", true);
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));
            ratingValue.textContent = `Selected Rating: 0`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification("Gửi phản hồi thất bại", false);
    })
}
