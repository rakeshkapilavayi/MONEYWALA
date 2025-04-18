// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAk-7v8sSnYSe_DSegU5SAfeHoE5ZEdYsU",
    authDomain: "money-wala-9f96b.firebaseapp.com",
    projectId: "money-wala-9f96b",
    storageBucket: " personally-owned-9f96b.firebasestorage.app",
    messagingSenderId: "857060971333",
    appId: "1:857060971333:web:1d6e6c8c7a5e017700e42c",
    measurementId: "G-2TVQ7STTW9"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Sidebar Toggle State
let isSidebarVisible = localStorage.getItem('isSidebarVisible') === 'true';

document.addEventListener('DOMContentLoaded', function () {
    const messages = document.querySelectorAll('.message');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages');
    const sidebar = document.getElementById('sidebar');
    const logoToggle = document.getElementById('logo-toggle');
    const authLink = document.getElementById('auth-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const chatSearch = document.getElementById('chat-search');
    const channelList = document.getElementById('channel-list');
    const typingIndicator = document.getElementById('typing-indicator');

    // Initialize Sidebar State
    if (isSidebarVisible && auth.currentUser) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('visible');
    } else {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('visible');
    }

    // Auth State
    auth.onAuthStateChanged((user) => {
        if (user) {
            authLink.textContent = 'Sign Out';
            authLink.href = '#';
            authLink.addEventListener('click', (e) => {
                e.preventDefault();
                auth.signOut().then(() => {
                    localStorage.setItem('isSidebarVisible', 'false');
                    window.location.href = 'money-wala.html';
                });
            });
        } else {
            authLink.textContent = 'Sign In';
            authLink.href = 'signup.html';
            sidebar.classList.add('hidden');
            setTimeout(() => {
                window.location.href = 'signup.html';
            }, 500);
        }
    });

    // Smooth animations for messages
    messages.forEach((msg, i) => {
        msg.style.animationDelay = `${i * 0.1}s`;
    });

    // Send message functionality
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text) {
            const newMessage = document.createElement('div');
            newMessage.className = 'message sent';
            newMessage.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                    <div class="message-time">${new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })} <i class="fas fa-check-double message-status"></i></div>
                </div>
            `;
            messagesContainer.appendChild(newMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            messageInput.value = '';
            newMessage.style.animation = 'messageIn 0.4s ease-out forwards';

            // Show typing indicator before reply
            typingIndicator.style.display = 'flex';
            setTimeout(() => {
                typingIndicator.style.display = 'none';
                simulateReply();
            }, 1500 + Math.random() * 1000);
        }
    }

    function simulateReply() {
        const replies = [
            'Sounds good!',
            "I'll be there in 10 mins",
            'Can we do ₹1000 instead?',
            "What's your exact location?",
            'Got it, thanks!',
            'Let me check and get back to you',
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const newMessage = document.createElement('div');
        newMessage.className = 'message received';
        newMessage.innerHTML = `
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Ravi" class="message-avatar">
            <div class="message-content">
                <div class="message-bubble">${randomReply}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}</div>
            </div>
        `;
        messagesContainer.appendChild(newMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        newMessage.style.animation = 'messageIn 0.4s ease-out forwards';
    }

    // Channel click handler
    document.querySelectorAll('.channel').forEach((channel) => {
        channel.addEventListener('click', function () {
            document.querySelectorAll('.channel').forEach((c) => c.classList.remove('active'));
            this.classList.add('active');
            const name = this.querySelector('.channel-name').textContent;
            const avatar = this.querySelector('.channel-avatar').src;
            document.querySelector('.chat-header-name').textContent = name;
            document.querySelector('.chat-header-avatar').src = avatar;
            const unread = this.querySelector('.channel-unread');
            if (unread) unread.remove();

            // Animate channel switch
            messagesContainer.style.opacity = '0';
            setTimeout(() => {
                messagesContainer.innerHTML = ''; // Clear messages (simulate new chat)
                messagesContainer.style.opacity = '1';
            }, 300);
        });
    });

    // Sidebar toggle
    logoToggle.addEventListener('click', () => {
        if (auth.currentUser) {
            if (isSidebarVisible) {
                sidebar.classList.remove('visible');
                sidebar.classList.add('hidden');
                isSidebarVisible = false;
            } else {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('visible');
                isSidebarVisible = true;
            }
            localStorage.setItem('isSidebarVisible', isSidebarVisible);
        }
    });

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Chat search functionality
    chatSearch.addEventListener('input', () => {
        const query = chatSearch.value.trim().toLowerCase();
        const channels = channelList.querySelectorAll('.channel');
        channels.forEach((channel) => {
            const name = channel.getAttribute('data-name').toLowerCase();
            channel.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Logo hover animation
    const logo = document.querySelector('.logo');
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'rotate(360deg)';
    });
    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'rotate(0deg)';
    });
});