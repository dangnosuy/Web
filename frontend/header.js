const username = localStorage.getItem('username') || sessionStorage.getItem('username');
const isLoggedIn = localStorage.getItem('loggedIn') || sessionStorage.getItem('loggedIn');

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  document.querySelector(".avatar-container")?.classList.add("hidden");
  document.querySelector(".login-button")?.classList.remove("hidden");
  dropdownMenu?.classList.remove("active");
}

document.addEventListener('DOMContentLoaded', function () {
  // Show avatar if logged in
  if (isLoggedIn) {
    document.querySelector(".avatar-container")?.classList.remove("hidden");
    document.querySelector(".login-button")?.classList.add("hidden");

    fetch(`http://127.0.0.1:5550/api/get_avatar?username=${encodeURIComponent(username)}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          document.getElementById("avatarImg")?.setAttribute("src", data.avatar_path);
        } else {
          console.error("Lỗi:", data.error);
        }
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  } else {
    document.querySelector(".avatar-container")?.classList.add("hidden");
    document.querySelector(".login-button")?.classList.remove("hidden");
  }

  // Dropdown avatar
  const avatarImg = document.getElementById("avatarImg");
  const dropdownMenu = document.getElementById("dropdownMenu");

  avatarImg?.addEventListener("click", function (e) {
    e.stopPropagation();
    dropdownMenu?.classList.toggle("active");
    console.log("Oke")
  });

  document.addEventListener("click", function (e) {
    if (!avatarImg?.contains(e.target) && !dropdownMenu?.contains(e.target)) {
      dropdownMenu?.classList.remove("active");
    }
  });

  document.querySelectorAll(".dropdown-menu-item").forEach((item) => {
    item.addEventListener("click", function () {
      const action = this.querySelector("span")?.textContent.trim();
      if (action === "Log out") {
        logout();
      }
      dropdownMenu?.classList.remove("active");
    });
  });

  // Menu toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove("active");
      }
    });
  }
});

// Auto logout when idle
const MAX_IDLE_TIME = 30 * 60 * 1000; 
let idleTimer;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (localStorage.getItem("loggedIn") || sessionStorage.getItem("loggedIn")) {
      alert("Bạn đã bị đăng xuất do không hoạt động quá lâu.");
      logout();
    }
  }, MAX_IDLE_TIME);
}

['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer);
});

resetIdleTimer();
