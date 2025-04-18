// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAk-7v8sSnYSe_DSegU5SAfeHoE5ZEdYsU",
    authDomain: "money-wala-9f96b.firebaseapp.com",
    projectId: "money-wala-9f96b",
    storageBucket: "money-wala-9f96b.firebasestorage.app",
    messagingSenderId: "857060971333",
    appId: "1:857060971333:web:1d6e6c8c7a5e017700e42c",
    measurementId: "G-2TVQ7STTW9"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const messagesList = document.getElementById('messages-list');
const authLink = document.getElementById('auth-link');
const logoToggle = document.getElementById('logo-toggle');
const sidebar = document.getElementById('sidebar');

// Sidebar Toggle State
let isSidebarVisible = localStorage.getItem('isSidebarVisible') === 'true';

// Function to set active sidebar item based on current page
function setActiveSidebarItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'money-wala.html'; // Default to homepage if no path
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        item.classList.remove('active'); // Remove active from all items

        const section = item.getAttribute('data-section');
        const id = item.getAttribute('id');

        // Map sidebar items to their corresponding pages
        if (currentPage === 'money-wala.html' && section === 'overview') {
            item.classList.add('active');
        } else if (currentPage === 'exchange.html' && id === 'exchange-link') {
            item.classList.add('active');
        } else if (currentPage === 'profile.html' && section === 'profile') {
            item.classList.add('active');
        } else if (currentPage === 'notifications.html' && section === 'notifications') {
            item.classList.add('active');
        }
    });
}

// Show loading screen initially
loadingScreen.style.display = 'block';
mainContent.style.display = 'none';

// Check Auth State
auth.onAuthStateChanged((user) => {
    loadingScreen.style.display = 'none'; // Hide loading screen

    if (user) {
        mainContent.style.display = 'block'; // Show main content
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        sidebar.classList.add('hidden');
        if (isSidebarVisible) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('visible');
        }
        setActiveSidebarItem(); // Set active sidebar item when user is signed in

        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                localStorage.setItem('isSidebarVisible', 'false');
                window.location.href = 'money-wala.html';
            }).catch((error) => alert('Error: ' + error.message));
        });

        document.getElementById('sign-out-btn').addEventListener('click', () => {
            auth.signOut().then(() => {
                localStorage.setItem('isSidebarVisible', 'false');
                window.location.href = 'money-wala.html';
            });
        });

        // Load mock messages
        loadMockMessages();
    } else {
        mainContent.style.display = 'none'; // Hide main content if not logged in
        window.location.href = 'signup.html'; // Redirect to signup
    }
});

// Fetch Random User (for demo purposes)
async function fetchRandomUser() {
    try {
        const response = await fetch('https://randomuser.me/api/?nat=IN');
        const data = await response.json();
        const user = data.results[0];
        return {
            name: { first: user.name.first, last: user.name.last },
            photo: user.picture.large,
        };
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Generate Random Indian Phone Number
function generateRandomIndianPhoneNumber() {
    const prefix = ['6', '7', '8', '9'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomNumber = randomPrefix + Math.floor(Math.random() * 9000000000 + 1000000000).toString().slice(1);
    return randomNumber;
}

// Generate Random Timestamp (within the last 7 days)
function generateRandomTimestamp() {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 7); // 0 to 6 days ago
    const randomHours = Math.floor(Math.random() * 24); // 0 to 23 hours
    const randomMinutes = Math.floor(Math.random() * 60); // 0 to 59 minutes
    const pastDate = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
    return pastDate.toLocaleString();
}

// Generate Random Location (mock locations for demo)
function generateRandomLocation() {
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
    return locations[Math.floor(Math.random() * locations.length)];
}

// Generate Random Message
function generateRandomMessage() {
    const messages = [
        "Hey, I saw you’re looking to exchange UPI for cash. I’m nearby and can help!",
        "Hi! I’m interested in exchanging cash for your UPI. Let’s meet up.",
        "I can exchange cash for your UPI. Are you available today?",
        "Saw your request on Money Wala. I have cash to exchange for UPI. Let me know!",
        "Hello! I’m nearby and can exchange cash for your UPI. When can we meet?"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Load Mock Messages
async function loadMockMessages() {
    messagesList.innerHTML = '<p>Loading messages...</p>';

    try {
        const mockMessages = [];
        const numMessages = Math.floor(Math.random() * 5) + 1; // 1 to 5 messages

        for (let i = 0; i < numMessages; i++) {
            const user = await fetchRandomUser();
            if (user) {
                const phoneNumber = generateRandomIndianPhoneNumber();
                const location = generateRandomLocation();
                const message = generateRandomMessage();
                const timestamp = generateRandomTimestamp();

                mockMessages.push({
                    name: `${user.name.first} ${user.name.last}`,
                    photo: user.photo,
                    location: location,
                    message: message,
                    timestamp: timestamp,
                    phone: phoneNumber
                });
            }
        }

        if (mockMessages.length === 0) {
            messagesList.innerHTML = '<p>No new messages.</p>';
            return;
        }

        messagesList.innerHTML = '';
        mockMessages.forEach((msg) => {
            const messageCard = document.createElement('div');
            messageCard.classList.add('message-card');
            messageCard.innerHTML = `
                <img src="${msg.photo}" alt="User Photo">
                <div class="message-content">
                    <h3>${msg.name}</h3>
                    <p class="location"><strong>Location:</strong> ${msg.location}</p>
                    <p class="message-text">${msg.message}</p>
                    <p class="timestamp"><strong>Received:</strong> ${msg.timestamp}</p>
                    <button class="call-btn" onclick="callUser('${msg.phone}')">Call</button>
                </div>
            `;
            messagesList.appendChild(messageCard);
        });

    } catch (error) {
        console.error(error);
        messagesList.innerHTML = `<p>Error loading messages: ${error.message}</p>`;
    }
}

// Call User (Placeholder)
function callUser(phoneNumber) {
    alert(`Calling ${phoneNumber}... (This is a placeholder. In a real app, this would initiate a call.)`);
}

// Logo Toggle for Sidebar
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

// Sidebar Navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (e.target.id === 'sign-out-btn') return;

        const section = item.getAttribute('data-section');
        const id = item.getAttribute('id');

        // Handle navigation to other pages
        if (id === 'exchange-link') {
            window.location.href = 'exchange.html';
        } else if (section === 'overview') {
            window.location.href = 'money-wala.html';
        } else if (section === 'profile') {
            window.location.href = 'profile.html';
        } else if (section === 'notifications') {
            window.location.href = 'notifications.html';
        }
    });
});

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Run on page load to set the active sidebar item
window.addEventListener('load', setActiveSidebarItem);

// Add to your existing JavaScript (e.g., scripts/notifications.js or new script)
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('interactive-title');
    const titleText = 'Money Wala';
    titleElement.innerHTML = ''; // Clear content

    // Split text into spans
    titleText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Handle spaces
        span.style.animationDelay = `${index * 0.1}s`; // Delay each character
        titleElement.appendChild(span);
    });
});