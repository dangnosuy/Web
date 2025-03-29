function SendPrompt() {
    const prompt = document.getElementById('prompt').value

    const username = localStorage.getItem('username')

    var data = {
        username : username,
        prompt : prompt
    }
    console.log(data)
    fetch('http://127.0.0.1:5554/api/texttomusic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)

    })
    .then(response => response.json())
    .then(jsonData  => {
        console.log(jsonData);
        if(jsonData.success === true) {
            console.log("Lỗi: " + jsonData.error)
            addSongCard('Bài hát mới của mày', 'Genre', '30s', jsonData.file_path)
        }
        else {
            console.log("File path: " + jsonData.result_path)
        }
    })
    .catch(error => {
        console.error('Error:', error);
    }) 
}
function addSongCard(songTitle, genre, duration, audioPath) {
  // Tạo phần tử card
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow p-4 flex items-center justify-between";
  
  card.innerHTML = `
    <!-- Thông tin bài hát và thanh progress -->
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-800">${songTitle}</h3>
      <p class="text-sm text-gray-500">${genre} • ${duration}</p>
      <!-- Thanh progress tùy chỉnh -->
      <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div class="progress-bar bg-blue-500 h-2 rounded-full" style="width: 0%;"></div>
      </div>
      <!-- Thẻ audio ẩn -->
      <audio src="${audioPath}" style="display:none;"></audio>
    </div>
    
    <!-- Nút chức năng: Play/Pause và Download -->
    <div class="flex space-x-2 ml-4">
      <!-- Nút Play/Pause -->
      <button class="play-btn p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
        <!-- Icon Play -->
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.5 5.5L14 10L6.5 14.5V5.5Z" />
        </svg>
      </button>
      
      <!-- Nút Download -->
      <button onclick="downloadSong('${audioPath}')" class="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a1 1 0 011 1v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586V4a1 1 0 011-1zM4 15a1 1 0 100 2h12a1 1 0 100-2H4z" />
        </svg>
      </button>
    </div>
  `;
  
  // Thêm card vào container danh sách bài hát
  document.getElementById("song-list").appendChild(card);
  
  // Lấy các phần tử cần xử lý trong card
  const audio = card.querySelector("audio");
  const playBtn = card.querySelector(".play-btn");
  const progressBar = card.querySelector(".progress-bar");
  
  // Xử lý sự kiện Play/Pause
  playBtn.addEventListener("click", function() {
    if (audio.paused) {
      audio.play();
      // Thay đổi icon thành icon Pause (bạn có thể thay đổi theo ý thích)
      playBtn.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6 4h4v12H6zM10 4h4v12h-4z"/>
        </svg>`;
    } else {
      audio.pause();
      // Đổi lại icon Play
      playBtn.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.5 5.5L14 10L6.5 14.5V5.5Z" />
        </svg>`;
    }
  });
  
  // Cập nhật thanh tiến độ khi audio đang chạy
  audio.addEventListener("timeupdate", function() {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = progressPercent + "%";
    }
  });
}
document.addEventListener('DOMContentLoaded', function() {
  // Thay đổi giá trị username và type theo yêu cầu của bạn
  const username = localStorage.getItem('username');
  const type = 'text_to_music';

  // Gửi request GET đến API lấy lịch sử
  fetch(`http://127.0.0.1:5554/api/get_ttm_data?username=${encodeURIComponent(username)}&type=${encodeURIComponent(type)}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(data)
        // Giả sử API trả về data.tts_data là một mảng chứa đường dẫn audio,
        // bạn có thể chỉnh sửa thông tin songTitle, genre, duration theo dữ liệu thực tế.
        data.tts_data.forEach(item => {
          // Nếu item chỉ chứa audioPath, bạn có thể cung cấp thêm thông tin mặc định hoặc chuyển đổi dữ liệu
          addSongCard("Song Title", "Genre", "3:30", item.result);
        });
      } else {
        console.error("Lỗi khi tải lịch sử:", data.error);
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
});

function downloadSong(audioPath) {
  const a = document.createElement('a');
  a.href = audioPath;
  a.download = audioPath.substring(audioPath.lastIndexOf('/') + 1);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

