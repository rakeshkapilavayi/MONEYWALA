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
const db = firebase.firestore();

// Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const authLink = document.getElementById('auth-link');
const userName = document.getElementById('user-name');
const sidebar = document.getElementById('sidebar');
const logoToggle = document.getElementById('logo-toggle');
const signedInSection = document.querySelector('.signed-in');
const signedOutSections = document.querySelectorAll('.signed-out');
const locationSearch = document.getElementById('location-search');
const locationDropdown = document.getElementById('location-dropdown');
const locationSuggestions = document.getElementById('location-suggestions');
const toggleIcon = document.querySelector('.toggle-icon');

// Sidebar Toggle State
let isSidebarVisible = localStorage.getItem('isSidebarVisible') === 'true';

// LocalStorage Helper Functions
const initLocalStorage = () => {
    if (!localStorage.getItem('walletData')) {
        localStorage.setItem('walletData', JSON.stringify({
            cashBalance: 1500,
            digitalBalance: 3200,
            transactions: [
                { type: 'cash', amount: 500, action: 'added', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
                { type: 'digital', amount: -1000, action: 'exchanged', timestamp: Date.now() - 24 * 60 * 60 * 1000 },
                { type: 'digital', amount: 2000, action: 'received', timestamp: Date.now() - 48 * 60 * 60 * 1000 }
            ]
        }));
    }
};

const getWalletData = () => JSON.parse(localStorage.getItem('walletData'));
const updateWalletData = (data) => localStorage.setItem('walletData', JSON.stringify(data));

// Update Balance UI
const updateBalanceUI = () => {
    const walletData = getWalletData();
    const cashBalanceEl = document.getElementById('cash-balance');
    const digitalBalanceEl = document.getElementById('digital-balance');
    if (cashBalanceEl) cashBalanceEl.textContent = `₹${walletData.cashBalance}`;
    if (digitalBalanceEl) digitalBalanceEl.textContent = `₹${walletData.digitalBalance}`;
};

// Randomize Wallet Balances
const walletInsights = document.querySelector('.wallet-insights');
if (walletInsights) {
    walletInsights.addEventListener('click', () => {
        const walletData = getWalletData();
        walletData.cashBalance = Math.floor(Math.random() * 5000) + 500; // ₹500-₹5500
        walletData.digitalBalance = Math.floor(Math.random() * 10000) + 1000; // ₹1000-₹11000
        updateWalletData(walletData);
        updateBalanceUI();
    });
}

// Function to set active sidebar item based on current page
function setActiveSidebarItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'money-wala.html';
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const section = item.getAttribute('data-section');
        const id = item.getAttribute('id');

        if (currentPage === 'money-wala.html' && section === 'overview') {
            item.classList.add('active');
        } else if (currentPage === 'exchange.html' && id === 'exchange-link') {
            item.classList.add('active');
        } else if (currentPage === 'wallet.html' && section === 'wallet') {
            item.classList.add('active');
        } else if (currentPage === 'notifications.html' && section === 'notifications') {
            item.classList.add('active');
        } else if (currentPage === 'profile.html' && section === 'profile') {
            item.classList.add('active');
        }
    });
}

// Auth State
auth.onAuthStateChanged((user) => {
    if (loadingScreen) loadingScreen.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';

    if (user) {
        // Signed-in state
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        signedInSection.style.display = 'flex';
        signedOutSections.forEach(el => el.style.display = 'none');
        authLink.textContent = 'Sign Out';
        authLink.href = '#';
        if (sidebar) {
            sidebar.classList.add('hidden');
            if (isSidebarVisible) {
                sidebar.classList.remove('hidden');
                sidebar.classList.add('visible');
            }
        }
        if (userName) userName.textContent = user.displayName || 'User';
        loadUserStats(user.uid);
        setActiveSidebarItem();
        initLocalStorage();
        updateBalanceUI();

        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                localStorage.setItem('isSidebarVisible', 'false');
                localStorage.removeItem('selectedLocation');
                window.location.reload();
            }).catch((error) => alert('Error: ' + error.message));
        });

        // Listen for storage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'walletData') {
                updateBalanceUI();
            }
        });
    } else {
        // Signed-out state
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        signedInSection.style.display = 'none';
        signedOutSections.forEach(el => el.style.display = 'block');
        authLink.textContent = 'Sign In';
        authLink.href = 'signup.html';
    }
});

// Load User Stats from Firestore
function loadUserStats(uid) {
    db.collection('users').doc(uid).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                updateBalanceUI();
            }
        })
        .catch(err => console.error('Error loading stats:', err));
}

// Sidebar Navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const section = item.getAttribute('data-section');
        const id = item.getAttribute('id');

        if (id === 'exchange-link') {
            window.location.href = 'exchange.html';
        } else if (section === 'wallet') {
            window.location.href = 'wallet.html';
        } else if (section === 'notifications') {
            window.location.href = 'notifications.html';
        } else if (section === 'overview') {
            window.location.href = 'money-wala.html';
        } else if (section === 'profile') {
            window.location.href = 'profile.html';
        }

        if (window.location.pathname.split('/').pop() === 'money-wala.html') {
            document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
            if (section) {
                document.getElementById(section).classList.add('active');
            }
        }
    });
});

// Logo Toggle for Sidebar
if (logoToggle && sidebar) {
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
}

// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
}

// Location Search Bar Functionality
if (locationSearch && locationDropdown && locationSuggestions && toggleIcon) {
    // Check if location is already set
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
        locationSearch.value = savedLocation;
        unlockExchangeFeatures();
    } else {
        // Lock exchange features until location is set
        const exchangeWidget = document.getElementById('exchange-widget');
        const liveMatches = document.getElementById('live-matches');
        if (exchangeWidget && liveMatches) {
            exchangeWidget.style.pointerEvents = 'none';
            exchangeWidget.style.opacity = '0.6';
            liveMatches.style.pointerEvents = 'none';
            liveMatches.style.opacity = '0.6';
        }
    }

    // Expanded list of popular locations
    const popularLocationsList = [
        "Kopalle",
        "Bank Colony Bhimavaram",
        "Lanchila Revu",
        "Boka Vari Palem",
        "Visakhapatnam",
        "Hyderabad",
        "Vijayawada",
        "Guntur",
        "Bhimavaram",
        "Rajahmundry",
        "Kakinada",
        "Nellore",
        "Tirupati",
        "Amaravati",
        "Anantapur",
        "Kadapa",
        "Srikakulam",
        "Chittoor",
        "Ongole",
        "Eluru"
    ];

    // Populate Location Suggestions
    function populateLocationSuggestions(locations) {
        locationSuggestions.innerHTML = '';
        locations.forEach(location => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-map-pin"></i>${location}`;
            locationSuggestions.appendChild(li);
            li.addEventListener('click', () => {
                if (!localStorage.getItem('selectedLocation')) {
                    locationSearch.value = location;
                    localStorage.setItem('selectedLocation', location);
                    locationDropdown.classList.remove('visible');
                    locationDropdown.style.display = 'none';
                    toggleIcon.classList.remove('active');
                    unlockExchangeFeatures();
                }
            });
        });
    }

    // Filter Location Suggestions with Similarity Matching
    function filterLocationSuggestions(query) {
        if (!query) {
            populateLocationSuggestions(popularLocationsList);
            return;
        }

        const scoredLocations = popularLocationsList.map(location => {
            const distance = levenshteinDistance(query.toLowerCase(), location.toLowerCase());
            const maxLength = Math.max(query.length, location.length);
            const similarity = 1 - distance / maxLength;
            return { location, similarity };
        });

        const filteredLocations = scoredLocations
            .filter(item => item.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .map(item => item.location)
            .slice(0, 6);

        populateLocationSuggestions(filteredLocations.length > 0 ? filteredLocations : popularLocationsList);
    }

    // Toggle Dropdown
    function toggleDropdown(show) {
        if (!localStorage.getItem('selectedLocation')) {
            if (show) {
                locationDropdown.style.display = 'block';
                setTimeout(() => locationDropdown.classList.add('visible'), 10);
                toggleIcon.classList.add('active');
                populateLocationSuggestions(popularLocationsList);
            } else {
                locationDropdown.classList.remove('visible');
                setTimeout(() => locationDropdown.style.display = 'none', 300);
                toggleIcon.classList.remove('active');
            }
        }
    }

    // Unlock Exchange Features
    function unlockExchangeFeatures() {
        const exchangeWidget = document.getElementById('exchange-widget');
        const liveMatches = document.getElementById('live-matches');
        if (exchangeWidget && liveMatches) {
            exchangeWidget.style.pointerEvents = 'auto';
            exchangeWidget.style.opacity = '1';
            liveMatches.style.pointerEvents = 'auto';
            liveMatches.style.opacity = '1';
        }
    }

    // Event Listeners for Location Search
    locationSearch.addEventListener('focus', () => toggleDropdown(true));
    locationSearch.addEventListener('input', () => {
        const query = locationSearch.value.trim();
        filterLocationSuggestions(query);
    });
    toggleIcon.addEventListener('click', () => {
        if (locationDropdown.classList.contains('visible')) {
            toggleDropdown(false);
        } else {
            toggleDropdown(true);
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!locationSearch.contains(e.target) && !locationDropdown.contains(e.target) && !toggleIcon.contains(e.target)) {
            toggleDropdown(false);
        }
    });

    // Current Location
    const currentLocation = document.querySelector('.current-location');
    if (currentLocation) {
        currentLocation.addEventListener('click', () => {
            if (!localStorage.getItem('selectedLocation')) {
                locationSearch.value = 'Fetching location...';
                toggleDropdown(false);
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            try {
                                const response = await fetch(
                                    `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
                                );
                                const data = await response.json();
                                const location = data.address.city || data.address.town || 'Unknown Location';
                                locationSearch.value = location;
                                localStorage.setItem('selectedLocation', location);
                                unlockExchangeFeatures();
                            } catch (error) {
                                locationSearch.value = 'Error fetching location';
                            }
                        },
                        () => {
                            locationSearch.value = 'Location access denied';
                        }
                    );
                } else {
                    locationSearch.value = 'Geolocation not supported';
                }
            }
        });
    }
}

// Levenshtein Distance Function
function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}

// Run on page load
window.addEventListener('load', () => {
    setActiveSidebarItem();
    if (auth.currentUser) {
        initLocalStorage();
        updateBalanceUI();
    }
});