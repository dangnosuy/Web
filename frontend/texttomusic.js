function formatShortPrompt(text) {
  if (!text) return 'Không có tiêu đề';
  let shortPrompt = text.substring(0, 30);
  if (shortPrompt.length < text.length) shortPrompt += '...';
  // Loại bỏ dấu phẩy cuối và trim khoảng trắng
  shortPrompt = shortPrompt.replace(/,\s*$/, '').trim();
  return shortPrompt;
}
function SendPrompt() {
  document.getElementById('loading').style.display = 'flex'
  let prompt = document.getElementById('textInput').value
  prompt = prompt.replace(/[,!@#$%^&*()+=[\]{}|;:'"<>?]/g, '').trim(); // Loại bỏ khoảng trắng thừa ở đầu và cuối
  const username = localStorage.getItem('username')

  var data = {
    username: username,
    prompt: prompt
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
    .then(jsonData => {
      console.log(jsonData);
      if (jsonData.success === true) {
        document.getElementById('loading').style.display = 'none'
        jsonData.tts_data.forEach(item => {
          // Cắt ngắn prompt để làm tiêu đề (giới hạn 30 ký tự)
          const shortPrompt = item.input_text ? item.input_text.substring(0, 30) + (item.input_text.length > 30 ? '...' : '') : 'Không có tiêu đề';
          
          // Sử dụng username từ dữ liệu API
          const createdBy = item.username || 'Username';
          console.log(createdBy)
          addSongCard(shortPrompt, "Genre", "0:30", item.result, createdBy);
        });
      }
      else {
        document.getElementById('loading').style.display = 'none'
        console.log("File path: " + jsonData.result_path)
      }
    })
    .catch(error => {
      document.getElementById('loading').style.display = 'none'
      console.error('Error:', error);
    })
}
function addSongCard(songTitle, genre, duration, audioPath, createdBy) {
  // Tạo phần tử card
  const card = document.createElement("div");
  card.className = "bg-white rounded-lg shadow p-4 flex items-center justify-between";

  card.innerHTML = `
    <!-- Thông tin bài hát và thanh progress -->
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-800">${songTitle}</h3>
      <p class="text-sm text-gray-500">${genre} • ${duration} • ${createdBy}</p>
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
  playBtn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play();
      // Thay đổi icon thành icon Pause
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
  audio.addEventListener("timeupdate", function () {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = progressPercent + "%";
    }
  });
}
document.addEventListener('DOMContentLoaded', function () {
  // Thay đổi giá trị username và type theo yêu cầu của bạn
  const username = localStorage.getItem('username');
  const type = 'text_to_music';

  // Gửi request GET đến API lấy lịch sử
  fetch(`http://127.0.0.1:5554/api/get_data_user?username=${encodeURIComponent(username)}&type=${encodeURIComponent(type)}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(data)
        data.ttm_data.forEach(item => {
          const shortPrompt = item.input_text ? item.input_text.substring(0, 30) + (item.input_text.length > 30 ? '...' : '') : 'Không có tiêu đề';
          if (shortPrompt.endsWith(',')) {
            shortPrompt = shortPrompt.slice(0, -1); // Loại bỏ ký tự cuối
          }
          // Nếu item chỉ chứa audioPath, bạn có thể cung cấp thêm thông tin mặc định hoặc chuyển đổi dữ liệu
          const createdBy = item.username || 'Username';
          addSongCard(shortPrompt, "Music", "0:30", item.result, createdBy);
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

// Loại bỏ mảng likedTracks
let audioTracks = [];
let currentAudio = null;
let currentPlayBtn = null;

function formatShortPrompt(text) {
  if (!text) return 'Không có tiêu đề';
  let shortPrompt = text.substring(0, 30);
  if (shortPrompt.length < text.length) shortPrompt += '...';
  shortPrompt = shortPrompt.replace(/,\s*$/, '').trim();
  return shortPrompt;
}

function renderAudioSlider() {
  const slider = document.getElementById('audioSlider');
  slider.innerHTML = '';

  // Sort tracks by likes (descending)
  audioTracks.sort((a, b) => b.likes - a.likes);

  audioTracks.forEach(track => {
    // Dùng is_liked để xác định trạng thái nút tym
    const isLiked = track.is_liked;
    const likeClass = isLiked ? 'liked' : '';

    const audioItem = document.createElement('div');
    audioItem.classList.add('audio-item');
    audioItem.innerHTML = `
      <div class="info">
        <p>${track.title}</p>
        <p>${track.genre} • ${track.duration} • ${track.username}</p>
      </div>
      <div class="controls">
        <button class="play-btn" onclick="togglePlay(this, '${track.src}')">
          <svg class="play-icon" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg class="pause-icon" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6zm8-14v14h4V5z"/>
          </svg>
        </button>
        <button class="download-btn" onclick="downloadSong('${track.src}')">
          <svg viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <button class="like-btn ${likeClass}" data-id="${track.id}" data-likes="${track.likes}">
          <svg viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span>${track.likes}</span>
        </button>
      </div>
      <audio src="${track.src}" style="display:none;" preload="none"></audio>
    `;
    slider.appendChild(audioItem);
  });

  // Gắn sự kiện cho các nút like
  document.querySelectorAll('.like-btn').forEach(button => {
    button.addEventListener('click', function () {
      const trackId = this.getAttribute('data-id');
      const currentLikes = parseInt(this.getAttribute('data-likes'));
      toggleLike(trackId, this, currentLikes);
    });
  });
}

function toggleLike(trackId, button, currentLikes) {
  const username = localStorage.getItem('username') || "current_user"; // Lấy username từ localStorage
  const product = "text_to_music";

  // Gửi yêu cầu đến /api/tym
  fetch('http://127.0.0.1:5554/api/tym', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      id: trackId,
      product: product
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Cập nhật giao diện dựa trên action
        if (data.action === 'liked') {
          button.classList.add('liked');
          button.setAttribute('data-likes', currentLikes + 1);
          button.querySelector('span').textContent = currentLikes + 1;
          // Cập nhật audioTracks
          const track = audioTracks.find(t => t.id == trackId);
          if (track) {
            track.likes = currentLikes + 1;
            track.is_liked = true;
          }
        } else if (data.action === 'unliked') {
          button.classList.remove('liked');
          button.setAttribute('data-likes', currentLikes - 1);
          button.querySelector('span').textContent = currentLikes - 1;
          // Cập nhật audioTracks
          const track = audioTracks.find(t => t.id == trackId);
          if (track) {
            track.likes = currentLikes - 1;
            track.is_liked = false;
          }
        }
        // Sắp xếp lại slider theo số tym
        renderAudioSlider();
      } else {
        console.error('Error toggling like:', data.error);
        alert('Failed to toggle like: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error toggling like:', error);
      alert('Error toggling like');
    });
}

// Load dữ liệu khi khởi động
document.addEventListener('DOMContentLoaded', function () {
  const type = 'text_to_music';
  const username = localStorage.getItem('username') || 'current_user';

  // Gửi request GET đến API lấy tất cả dữ liệu
  fetch(`http://127.0.0.1:5554/api/get_data_all?type=${encodeURIComponent(type)}&username=${encodeURIComponent(username)}`, {
    headers: {
      'Cache-Control': 'no-cache'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Dữ liệu từ API (all):", data);

        // Chuyển đổi dữ liệu từ API thành định dạng audioTracks
        audioTracks = data.ttm_data.map(item => {
          const shortPrompt = formatShortPrompt(item.input_text);
          return {
            id: item.id,
            title: shortPrompt,
            genre: "Music", // Có thể lấy từ API nếu thêm trường genre
            duration: "0:30", // Có thể lấy từ API nếu thêm trường duration
            src: item.result,
            likes: item.quantity_tym || 0,
            username: item.username || "Unknown",
            is_liked: item.is_liked || false
          };
        });

        // Render slider
        renderAudioSlider();

        // Khởi động auto-scroll
        setInterval(autoScroll, 5000);
      } else {
        console.error("Lỗi khi tải lịch sử:", data.error);
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
    });
});

// Giữ nguyên các hàm khác
function togglePlay(button, src) {
  const audio = button.parentElement.parentElement.querySelector('audio');

  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentPlayBtn.classList.remove('playing');
    currentAudio.currentTime = 0;
  }

  if (audio.paused) {
    audio.play();
    button.classList.add('playing');
    currentAudio = audio;
    currentPlayBtn = button;

    audio.onended = () => {
      button.classList.remove('playing');
      audio.currentTime = 0;
    };
  } else {
    audio.pause();
    button.classList.remove('playing');
  }
}

function downloadSong(src) {
  const link = document.createElement('a');
  link.href = src;
  link.download = src.split('/').pop();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

let currentSlide = 0;
function autoScroll() {
  const slider = document.getElementById('audioSlider');
  const items = slider.children;
  if (items.length === 0) return;

  currentSlide = (currentSlide + 1) % items.length;
  slider.style.transform = `translateX(-${currentSlide * (300 + 16)}px)`;
}

function prevSlide() {
  currentSlide = currentSlide === 0 ? audioTracks.length - 1 : currentSlide - 1;
  const slider = document.getElementById('audioSlider');
  slider.style.transform = `translateX(-${currentSlide * (300 + 16)}px)`;
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % audioTracks.length;
  const slider = document.getElementById('audioSlider');
  slider.style.transform = `translateX(-${currentSlide * (300 + 16)}px)`;
}