// Initialize Firebase with your config
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

// Initialize localStorage data
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

// Get wallet data from localStorage
const getWalletData = () => JSON.parse(localStorage.getItem('walletData'));

// Update wallet data in localStorage
const updateWalletData = (data) => localStorage.setItem('walletData', JSON.stringify(data));

// Format time ago
const timeAgo = (timestamp) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

// Update transaction history UI
const updateTransactionHistory = () => {
    const walletData = getWalletData();
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';
    walletData.transactions.forEach(tx => {
        const icon = tx.amount > 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        const text = tx.amount > 0 
            ? `Added ₹${Math.abs(tx.amount)} ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}`
            : `Removed ₹${Math.abs(tx.amount)} ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}`;
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas ${icon}"></i> ${text} (${timeAgo(tx.timestamp)})`;
        historyList.prepend(li); // Add new transactions at the top
    });
};

// Update balance UI
const updateBalanceUI = () => {
    const walletData = getWalletData();
    document.getElementById('cash-balance').textContent = `₹${walletData.cashBalance}`;
    document.getElementById('digital-balance').textContent = `₹${walletData.digitalBalance}`;
};

// Sidebar Toggle State
let isSidebarVisible = localStorage.getItem('isSidebarVisible') === 'true';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initLocalStorage();
    updateBalanceUI();
    updateTransactionHistory();
});

// Check Auth State
auth.onAuthStateChanged((user) => {
    const sidebar = document.getElementById('sidebar');
    if (user) {
        sidebar.classList.add('hidden');
        if (isSidebarVisible) {
            sidebar.classList.remove('hidden');
            sidebar.classList.add('visible');
        }
    } else {
        window.location.href = 'signup.html';
    }
});

// Logo Toggle for Sidebar
const logoToggle = document.getElementById('logo-toggle');
const sidebar = document.getElementById('sidebar');
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

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Sidebar Navigation
document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (e.target.id === 'sign-out-btn') {
            auth.signOut().then(() => {
                localStorage.setItem('isSidebarVisible', 'false');
                window.location.href = 'money-wala.html';
            });
            return;
        }

        const section = item.getAttribute('data-section');
        const id = item.getAttribute('id');

        if (id === 'exchange-link') {
            window.location.href = 'exchange.html';
        } else if (section === 'overview') {
            window.location.href = 'money-wala.html';
        } else if (section === 'wallet') {
            window.location.href = 'wallet.html';
        } else if (section === 'notifications') {
            window.location.href = 'notifications.html';
        }
    });
});

// Modal Handling
const modal = document.getElementById('add-funds-modal');
const addFundsButtons = document.querySelectorAll('.add-funds-btn');
const removeFundsButtons = document.querySelectorAll('.remove-funds-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const addFundsForm = document.getElementById('add-funds-form');
const fundTypeDisplay = document.getElementById('fund-type-display');
const fundTypeInput = document.getElementById('fund-type');
let isAdding = true; // Track whether we're adding or removing

// Add Funds Buttons
addFundsButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');
        fundTypeDisplay.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        fundTypeInput.value = type;
        isAdding = true;
        modal.querySelector('h3').textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)} Funds`;
        modal.style.display = 'flex';
    });
});

// Remove Funds Buttons
removeFundsButtons.forEach(button => {
    button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');
        fundTypeDisplay.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        fundTypeInput.value = type;
        isAdding = false;
        modal.querySelector('h3').textContent = `Remove ${type.charAt(0).toUpperCase() + type.slice(1)} Funds`;
        modal.style.display = 'flex';
    });
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

addFundsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let amount = parseInt(document.getElementById('fund-amount').value);
    const type = fundTypeInput.value;
    const user = auth.currentUser;

    // If removing, make amount negative
    if (!isAdding) {
        amount = -amount;
    }

    if (user) {
        // Get current wallet data
        const walletData = getWalletData();
        
        // Update balance
        if (type === 'cash') {
            walletData.cashBalance += amount;
            if (walletData.cashBalance < 0) walletData.cashBalance = 0; // Prevent negative balance
        } else {
            walletData.digitalBalance += amount;
            if (walletData.digitalBalance < 0) walletData.digitalBalance = 0; // Prevent negative balance
        }

        // Add transaction
        walletData.transactions.push({
            type: type,
            amount: amount,
            action: amount > 0 ? 'added' : 'removed',
            timestamp: Date.now()
        });

        // Update localStorage
        updateWalletData(walletData);

        // Update UI
        updateBalanceUI();
        updateTransactionHistory();

        // Update Firebase
        db.collection('users').doc(user.uid).update({
            [`${type}Balance`]: walletData[`${type}Balance`]
        }).then(() => {
            alert(`₹${Math.abs(amount)} ${amount > 0 ? 'added to' : 'removed from'} ${type} balance!`);
            modal.style.display = 'none';
            addFundsForm.reset();
        }).catch(error => {
            console.error('Error updating Firebase:', error);
            alert('Failed to update balance in Firebase.');
        });
    }
});
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