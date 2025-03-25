document.getElementById("clearBtn").addEventListener('click', function() {
    document.getElementById('textInput').value = '';
  });
  // API call to convert text to speech
  document
    .getElementById("generateBtn")
    .addEventListener("click", sendText);

  async function sendText() {
    // test username
    
    const username = localStorage.getItem('username');
    // lấy dữ liệu từ form
    const text = document.getElementById("textInput").value;
    const language = document.getElementById("language").value;
    const gender = document.getElementById("gender").value;
    const data = { username, text, language, gender };

    if (text.trim() === "") {
      alert("Vui lòng nhập text");
      return;
    }
    // Lấy audio element
    const audioElement = document.getElementById("audio-player");

    // Ẩn audio cũ và clear src trước khi gửi
    audioElement.style.display = "none";
    audioElement.pause(); // dừng phát nếu đang phát
    audioElement.src = "";
    
    try {
      const response = await fetch("http://127.0.0.1:5552/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("TTS request failed");
      const newItem = await response.json();
      alert("Đây là kết quả: " + JSON.stringify(newItem));
      audioElement.src = newItem.result;
      audioElement.style.display = "block"; // hiện audio
      audioElement.load();
      audioElement.play();
       // Thêm vào history containter
      addToHistory(newItem);
      
    } catch (err) {
      //alert("Error: " + err.message);
      console.log("Error", err)
    }
  };


  // Hàm tính giờ so với hiện tại
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

     if (diff < 60000) return "Vừa xong";
     if (diff < 3600000) return `${minutes} phút trước`;
     if (diff < 86400000) return `${hours} giờ trước`;
      return `${Math.floor(diff / 86400000)} ngày trước`;
  };


  // Hàm tạo history-item
  function createHistoryItem(item) {
    const div = document.createElement("div");
    div.className = "history-item";

    const previewText =
    item.input_text.length > 30 ? item.input_text.slice(0, 30) + "..." : item.input_text;

    //Lấy timestamp (tức giờ generate gốc) để làm mốc xác định dùng để cập nhật realtime
    const timestamp = item.timestamp; 
    //Gọi hàm trả về giờ so với hiện tại
    const timeAgoText = getTimeAgo(timestamp);

    div.innerHTML = `
    <p title="${item.input_text}">${previewText}</p>
    <small class="time-text" data-timestamp="${timestamp}">${timeAgoText}</small>
    ${item.result ? `<audio controls src="${item.result}"></audio>` : ""}
  `;
    return div;
  };

  // Load history
  async function loadHistory(username) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5552/api/history_tts?username=${encodeURIComponent(username)}`
      );
      const historyData = await response.json();

      const historyContainer = document.querySelector(".chat-history");

      // Xóa những item cũ (nếu có)
      const oldItems = historyContainer.querySelectorAll(".history-item");
      oldItems.forEach((item) => item.remove());

      // Thêm lịch sử mới
      historyData.forEach((item) => {
        const div = createHistoryItem(item);
        historyContainer.appendChild(div);
      });
    } catch (err) {
      console.error("Lỗi load history:", err);
    }
  }

  // Gọi khi load trang (hoặc khi đăng nhập xong)
  window.addEventListener("DOMContentLoaded", () => {
    const username = localStorage.getItem('username'); // Thay bằng username thật sau khi login
    loadHistory(username);
  });

  // Khi vừa bấm generate nhưng muốn không phải load trang để cập nhật history
  function addToHistory(newItem) {
    const historyContainer = document.querySelector(".chat-history");
    const div = createHistoryItem(newItem);
    historyContainer.insertBefore(div, historyContainer.querySelector(".history-title").nextSibling);
  };

   //Cập nhật thời gian từng history-item theo realtime
   setInterval(() => {
    const timeElements = document.querySelectorAll('.time-text');
    timeElements.forEach(el => {
     const timestamp = Number(el.dataset.timestamp); // chuyển rõ ràng sang số
      if (!isNaN(timestamp)) {
         el.textContent = getTimeAgo(timestamp);
        }
    });
  }, 60000);

 // Avatar dropdown functionality
  const avatarImg = document.getElementById('avatarImg');
  const dropdownMenu = document.getElementById('dropdownMenu');
  
  // Toggle dropdown when avatar is clicked
  avatarImg.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!avatarImg.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('active');
    }
  });
  
  // Add click events for menu items
  document.querySelectorAll('.dropdown-menu-item').forEach(item => {
    item.addEventListener('click', function() {
      const action = this.querySelector('span').textContent;
      alert(`You clicked: ${action}`);
      dropdownMenu.classList.remove('active');
    });
  });

   // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');

  document.addEventListener('click', function(e) {
  
  if (menuToggle.contains(e.target)) {
      menu.classList.toggle('active');
  }
  else if (!menu.contains(e.target)) {
      menu.classList.remove('active');
  }
  });