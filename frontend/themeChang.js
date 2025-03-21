function theme(isDark) {
    const themeLink = document.getElementById("theme-style");
    if (isDark) {
        themeLink.href = "profile_dark.css";
    } else {
        themeLink.href = "profile_light.css";
    }
}

document.getElementById("button-darkmode").addEventListener("click", function() {
    const isDark = (document.getElementById("theme-style").getAttribute("href") === "profile_dark.css");
    theme(!isDark);
});
document.addEventListener("DOMContentLoaded", function() {
    const buttonContainer = document.querySelector(".button-container");
    const usernameInput = document.getElementById("username");
    const bioText = document.getElementById("bio_text");

    function showButtons() {
        // Loại bỏ thuộc tính hidden để hiển thị container
        buttonContainer.hidden = false;
    }

    usernameInput.addEventListener("input", showButtons);
    bioText.addEventListener("input", showButtons);
});
