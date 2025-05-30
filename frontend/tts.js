function SendPrompt() {
  
    var username = localStorage.getItem('username')

    var text = document.getElementById('textInput').value;
    var national = document.getElementById('language').value;
    var gender = document.getElementById('voice').value;
    
    if (text.trim() === "") {
        alert("Yêu cầu nhập text để chuyển đổi!");
        return;
    }
    var data = {
        username : username,
        text : text,
        national : national,
        gender : gender
    }

    fetch('http://127.0.0.1:5550/api/texttospeech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
    }) 
    .then(response => response.json())
    .then(jsonData  => {
        console.log(jsonData);
        spinner.style.display = 'none';
        if(jsonData.success == false) {
            console.log("Lỗi: " + jsonData.error)
            spinner.style.display = 'none';
        }
        else {
            console.log("File path: " + jsonData.file)
            spinner.style.display = 'none';
        }
    })
    .catch(error => {
        spinner.style.display = 'none';
        console.error('Error:', error);
    })
}

document.addEventListener("DOMContentLoaded", function() {
    // Thay đổi URL API theo endpoint của bạn
    const apiUrl = "http://127.0.0.1:5550/api/get_tts_data?username=None&type=text_to_speech";
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.tts_data && Array.isArray(data.tts_data)) {
          const recordingContainer = document.querySelector(".recording-item");
          // Xóa nội dung cũ (nếu có)
          recordingContainer.innerHTML = "";
  
          data.tts_data.forEach((audioSrc, index) => {
            // Tạo div chứa thông tin của một bản ghi
            const recordingInfo = document.createElement("div");
            recordingInfo.className = "recording-info";
          
            // Tạo tiêu đề cho bản ghi (ví dụ: Recording 1, Recording 2, ...)
            const title = document.createElement("span");
            title.className = "recording-title";
            title.textContent = `Recording ${index + 1}`;
          
            // Tạo phần tử audio với controls
            const audioPlayer = document.createElement("audio");
            audioPlayer.className = "audio-play";
            audioPlayer.controls = true;
          
            // Tạo thẻ source cho audio
            const source = document.createElement("source");
            source.src = audioSrc; // Lúc này audioSrc đã là chuỗi đường dẫn hợp lệ
            source.type = "audio/mpeg";
          
            // Ghép các phần tử lại với nhau
            audioPlayer.appendChild(source);
            recordingInfo.appendChild(title);
            recordingInfo.appendChild(audioPlayer);
            recordingContainer.appendChild(recordingInfo);
          });
        } else {
          console.error("Dữ liệu không hợp lệ từ server:", data);
        }
      })
      .catch(error => {
        console.error("Lỗi khi lấy dữ liệu từ server:", error);
      });
  });
  