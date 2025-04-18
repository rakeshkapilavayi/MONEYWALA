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
const form = document.getElementById('locationForm');
const mapElement = document.getElementById('map');
const mapLoader = document.getElementById('map-loader');
const resultsElement = document.getElementById('results');
const authLink = document.getElementById('auth-link');
const logoToggle = document.getElementById('logo-toggle');
const sidebar = document.getElementById('sidebar');
let map = null;

// Sidebar Toggle State
let isSidebarVisible = localStorage.getItem('isSidebarVisible') === 'true';

// Show loading screen initially
loadingScreen.style.display = 'flex';
mainContent.style.display = 'none';

// Check Auth State
auth.onAuthStateChanged((user) => {
    if (user) {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'block';
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        sidebar.classList.add('hidden');
        if (isSidebarVisible) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('visible');
        }
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

        // Load cached search results if available
        const cachedResults = localStorage.getItem('lastSearchResults');
        if (cachedResults) {
            resultsElement.innerHTML = cachedResults;
            const cachedCoords = localStorage.getItem('lastSearchCoords');
            if (cachedCoords) {
                const { lat, lon } = JSON.parse(cachedCoords);
                mapElement.style.display = 'block';
                initializeMap(lat, lon);
            }
        }
    } else {
        loadingScreen.style.display = 'none';
        mainContent.style.display = 'none';
        window.location.href = 'signup.html';
    }
});

// Initialize Map
function initializeMap(lat, lon) {
    if (!map) {
        map = L.map(mapElement).setView([lat, lon], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);
    } else {
        map.setView([lat, lon], 10);
    }
}

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

// Generate Random Money Type
function generateRandomMoneyType() {
    const types = ['upi', 'cash'];
    return types[Math.floor(Math.random() * types.length)];
}

// Handle Form Submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if the user is offline
    if (!navigator.onLine) {
        const cachedResults = localStorage.getItem('lastSearchResults');
        if (cachedResults) {
            resultsElement.innerHTML = `
                <p>You’re offline. Showing your last search results below:</p>
                ${cachedResults}
                <p>Connect to the internet to perform a new search.</p>
            `;
            const cachedCoords = localStorage.getItem('lastSearchCoords');
            if (cachedCoords) {
                const { lat, lon } = JSON.parse(cashedCoords);
                mapElement.style.display = 'block';
                initializeMap(lat, lon);
            }
        } else {
            resultsElement.innerHTML = `
                <p>You’re offline. The exchange feature requires an internet connection to search for nearby partners.</p>
                <p>Please connect to the internet and try again. You can view your profile data offline in the Profile page.</p>
            `;
        }
        return;
    }

    const city = document.getElementById('city').value.trim();
    const radius = parseInt(document.getElementById('radius').value) * 1000;
    const moneyAmount = parseInt(document.getElementById('money').value);

    if (!city || isNaN(radius) || isNaN(moneyAmount)) {
        alert('Please enter valid inputs.');
        return;
    }

    // Show map and loader
    mapElement.style.display = 'block';
    mapLoader.style.display = 'flex';
    resultsElement.innerHTML = '';

    try {
        // Fetch City Coordinates
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json`);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.length === 0) throw new Error('City not found.');

        const { lat, lon } = geocodeData[0];
        initializeMap(lat, lon);

        // Cache coordinates
        localStorage.setItem('lastSearchCoords', JSON.stringify({ lat, lon }));

        // Fetch Nearby Places
        const overpassQuery = `
            [out:json];
            node(around:${radius},${lat},${lon})[place~"village|town|city"];
            out body;
        `;
        const overpassResponse = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`);
        const overpassData = await overpassResponse.json();

        mapLoader.style.display = 'none';

        if (overpassData.elements.length === 0) {
            resultsElement.innerHTML = '<p>No places found within the specified radius.</p>';
            localStorage.setItem('lastSearchResults', resultsElement.innerHTML);
            return;
        }

        const places = overpassData.elements.slice(0, 4); // Limit to 4 results for demo
        resultsElement.innerHTML = '';

        for (const place of places) {
            const villageName = place.tags.name || 'Unknown';
            const user = await fetchRandomUser();
            const phoneNumber = generateRandomIndianPhoneNumber();
            const moneyType = generateRandomMoneyType();

            if (place.lat && place.lon) {
                L.marker([place.lat, place.lon])
                    .addTo(map)
                    .bindPopup(`<strong>${villageName}</strong><br>Type: ${place.tags.place}`);

                if (user && user.name && user.photo) {
                    const userCard = document.createElement('div');
                    userCard.classList.add('user-card');

                    const email = `${user.name.first.toLowerCase()}${user.name.last.toLowerCase()}@gmail.com`;

                    userCard.innerHTML = `
                        <img src="${user.photo}" alt="User Photo">
                        <h3>${user.name.first} ${user.name.last}</h3>
                        <p><strong>Location:</strong> ${villageName}</p>
                        <p><strong>Available:</strong> ${moneyType === 'upi' ? 'UPI' : 'Cash'}</p>
                        <p><strong>Amount:</strong> ₹${moneyAmount}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phoneNumber}</p>
                        <button class="contact-btn">Contact</button>
                    `;

                    resultsElement.appendChild(userCard);
                }
            }
        }

        if (resultsElement.children.length === 0) {
            resultsElement.innerHTML = '<p>No matching users found.</p>';
        }

        // Cache the search results
        localStorage.setItem('lastSearchResults', resultsElement.innerHTML);

    } catch (error) {
        console.error(error);
        mapLoader.style.display = 'none';
        resultsElement.innerHTML = `<p>Error: ${error.message}</p>`;
        localStorage.setItem('lastSearchResults', resultsElement.innerHTML);
    }
});

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
        if (e.target.id === 'exchange-link') {
            window.location.href = 'exchange.html';
            return;
        }
        const section = e.target.getAttribute('data-section');
        if (section === 'overview') {
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

// Interactive Title
document.addEventListener('DOMContentLoaded', () => {
    const titleElement = document.getElementById('interactive-title');
    const titleText = 'Money Wala';
    titleElement.innerHTML = '';
    titleText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });
});