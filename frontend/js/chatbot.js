document.addEventListener('DOMContentLoaded', () => {
    // Tạo container cho chatbot với position fixed và z-index cao
    const chatbotContainer = document.createElement('div');
    chatbotContainer.classList.add('chatbot-wrapper');
    chatbotContainer.innerHTML = `
        <div class="fixed bottom-6 right-6 z-[9999]">
            <button id="chatToggle" class="chat-button relative p-4 rounded-full shadow-lg">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/>
                </svg>
            </button>
        </div>
        <div id="chatWindow" class="chat-window fixed bottom-20 right-6 w-80 md:w-96 h-[500px] rounded-xl shadow-2xl hidden z-[9999] flex flex-col" data-aos="fade-up">
            <div class="chat-header flex justify-between items-center p-4 rounded-t-xl text-white">
                <h3 class="text-lg font-bold">ALChemistAI</h3>
                <div class="flex items-center">
                    <button id="toggleFullscreen" class="text-white md:hidden mr-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                        </svg>
                    </button>
                    <button id="closeChat" class="text-white">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div id="chatBox" class="chat-box flex-1 p-4 overflow-y-auto text-sm">
                <p class="bot-message p-3 mb-2 text-white max-w-[80%]">Welcome! Ask me how to use ALChemistAI. For example, try: "How do I create a image?"</p>
            </div>
            <div class="p-4 border-t border-gray-600">
                <div class="flex items-center space-x-2">
                    <input id="chatInput" 
                           class="chat-input flex-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-yellow-400 transition" 
                           placeholder="Ask how to use the website...">
                    <button id="sendMessage" 
                            class="chat-button-action px-4 py-2 text-white rounded-lg shadow-md bg-yellow-500 hover:bg-yellow-600">
                        Send
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    // CSS inline với !important để ngăn chặn các xung đột và các styles khác ghi đè
    const style = document.createElement('style');
    style.textContent = `
        .chatbot-wrapper {
            position: fixed;
            bottom: 0;
            right: 0;
            z-index: 9999;
            pointer-events: none;
        }
        
        .chatbot-wrapper button,
        .chatbot-wrapper #chatWindow {
            pointer-events: auto;
        }
        
        .chat-button {
            background: linear-gradient(135deg, #3B82F6, #8B5CF6) !important;
            transition: transform 0.2s, box-shadow 0.2s !important;
            z-index: 9999 !important;
        }
        .chat-button:hover {
            transform: scale(1.1) !important;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4) !important;
        }
        .chat-button::after {
            content: '' !important;
            position: absolute !important;
            inset: 0 !important;
            border-radius: 9999px !important;
            background: inherit !important;
            opacity: 0.3 !important;
            animation: pulse 2s infinite !important;
        }
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.1; }
            100% { transform: scale(1); opacity: 0.3; }
        }
        .chat-window {
            background: linear-gradient(135deg, #1E3A8A, #4B5563) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            z-index: 9999 !important;
            flex-direction: column !important;
            height: 500px !important; /* Fixed height to ensure scrolling works */
            max-height: 80vh !important; /* Maximum height on small screens */
        }
        .chat-header {
            background: linear-gradient(135deg, #3B82F6, #8B5CF6) !important;
            flex: 0 0 auto !important;
        }
        .chat-box {
            flex: 1 1 auto !important;
            overflow-y: auto !important;
            height: 100% !important;
            min-height: 0 !important; /* Critical for proper scrolling */
            max-height: calc(100% - 100px) !important; /* Room for header and input */
        }
        .chat-box::-webkit-scrollbar {
            width: 8px !important;
        }
        .chat-box::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 4px !important;
        }
        .chat-box::-webkit-scrollbar-thumb {
            background: #8B5CF6 !important;
            border-radius: 4px !important;
        }
        .chat-input:focus {
            outline: none !important;
            border-color: #FBBF24 !important;
            box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3) !important;
        }
        .chat-button-action {
            background: linear-gradient(135deg, #3B82F6, #8B5CF6) !important;
            transition: transform 0.2s !important;
        }
        .chat-button-action:hover {
            transform: scale(1.05) !important;
        }
        
        /* Message container styles */
        .message-wrapper {
            display: flex !important;
            margin-bottom: 8px !important;
        }
        .message-wrapper.user {
            justify-content: flex-end !important;
        }
        
        .user-message {
            background: #3B82F6 !important;
            border-radius: 12px 12px 0 12px !important;
            color: white !important;
            display: inline-block !important; 
            max-width: 80% !important;
            word-wrap: break-word !important;
            padding: 10px !important;
            margin: 0 !important;
        }
        
        .bot-message {
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px 12px 12px 0 !important;
            color: white !important;
            display: inline-block !important;
            max-width: 80% !important;
            word-wrap: break-word !important;
            padding: 10px !important;
            margin: 0 !important;
        }
        
        .bot-message * {
            color: white !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .bot-message ul {
            list-style-type: disc !important;
            padding-left: 20px !important;
        }
        
        .bot-message strong {
            font-weight: 700 !important;
        }
        
        .typing-indicator {
            display: inline-flex !important;
            align-items: center !important;
            gap: 4px !important;
            padding: 8px 12px !important;
            min-width: 50px !important;
        }
        
        .typing-dot {
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            opacity: 0.3;
            animation: blink 1s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }`;
    document.head.appendChild(style);

    // Thêm marked.js từ CDN nếu chưa có
    if (!window.marked) {
        const markedScript = document.createElement('script');
        markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        document.head.appendChild(markedScript);
    }

    // Logic tương tác
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const toggleFullscreen = document.getElementById('toggleFullscreen');
    const chatBox = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    let lastResponse = '';
    let isFullscreen = false;

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        if (isFullscreen) {
            chatWindow.classList.remove('w-full', 'h-full', 'bottom-0', 'right-0');
            chatWindow.classList.add('w-80', 'md:w-96', 'h-[500px]', 'bottom-20', 'right-6');
            isFullscreen = false;
        }
    });

    // Revised click handler - only close if the click is outside of the chat elements
    document.addEventListener('click', (e) => {
        if (!chatWindow.contains(e.target) && 
            !chatToggle.contains(e.target) && 
            !chatWindow.classList.contains('hidden')) {
            chatWindow.classList.add('hidden');
            if (isFullscreen) {
                chatWindow.classList.remove('w-full', 'h-full', 'bottom-0', 'right-0');
                chatWindow.classList.add('w-80', 'md:w-96', 'h-[500px]', 'bottom-20', 'right-6');
                isFullscreen = false;
            }
        }
    });

    toggleFullscreen.addEventListener('click', () => {
        if (!isFullscreen) {
            chatWindow.classList.add('w-full', 'h-full', 'bottom-0', 'right-0');
            chatWindow.classList.remove('w-80', 'md:w-96', 'h-[500px]', 'bottom-20', 'right-6');
            isFullscreen = true;
        } else {
            chatWindow.classList.remove('w-full', 'h-full', 'bottom-0', 'right-0');
            chatWindow.classList.add('w-80', 'md:w-96', 'h-[500px]', 'bottom-20', 'right-6');
            isFullscreen = false;
        }
    });

    sendButton.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Using the message-wrapper for better alignment of short messages
        chatBox.innerHTML += `
            <div class="message-wrapper user">
                <span class="user-message">${message}</span>
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
        chatInput.value = '';

        chatInput.disabled = true;
        sendButton.disabled = true;
        sendButton.classList.add('opacity-50', 'cursor-not-allowed');

        // Compact typing indicator
        const typingEl = document.createElement('div');
        typingEl.id = 'typingIndicator';
        typingEl.className = 'message-wrapper';
        typingEl.innerHTML = `
            <div class="bot-message typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatBox.appendChild(typingEl);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const result = await response.json();
            if (typingEl.parentNode) typingEl.remove();
            
            if (result.response) {
                lastResponse = result.response;
                // Wait for marked to be loaded
                if (typeof marked !== 'undefined') {
                    const htmlResponse = marked.parse(lastResponse);
                    chatBox.innerHTML += `
                        <div class="message-wrapper">
                            <div class="bot-message text-white">
                                ${htmlResponse}
                            </div>
                        </div>
                    `;
                } else {
                    // Fallback if marked is not loaded
                    chatBox.innerHTML += `
                        <div class="message-wrapper">
                            <div class="bot-message text-white">
                                ${lastResponse.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
                }
            } else {
                chatBox.innerHTML += `
                    <div class="message-wrapper">
                        <div class="bot-message text-red-400">
                            ${result.error || 'An error occurred'}
                        </div>
                    </div>
                `;
            }
        } catch (e) {
            if (typingEl.parentNode) typingEl.remove();
            chatBox.innerHTML += `
                <div class="message-wrapper">
                    <div class="bot-message text-red-400">
                        Error: ${e.message}
                    </div>
                </div>
            `;
        } finally {
            // Enable lại input + button
            chatInput.disabled = false;
            sendButton.disabled = false;
            sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
            chatBox.scrollTop = chatBox.scrollHeight;
            if (chatBox.children.length > 20) {
                chatBox.removeChild(chatBox.firstChild);
            }
        }
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendButton.click();
    });
});