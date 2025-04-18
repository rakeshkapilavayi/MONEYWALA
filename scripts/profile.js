// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAk-7v8sSnYSe_DSegU5SAfeHoE5ZEdYsU",
    authDomain: "money-wala-9f96b.firebaseapp.com",
    projectId: "money-wala-9f96b",
    storageBucket: "money-wala-9f96b.appspot.com",
    messagingSenderId: "857060971333",
    appId: "1:857060971333:web:1d6e6c8c7a5e017700e42c",
    measurementId: "G-2TVQ7STTW9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPhone = document.getElementById('user-phone');
const userLocation = document.getElementById('user-location');
const userUsername = document.getElementById('user-username');
const userJoinDate = document.getElementById('user-join-date');
const profilePic = document.getElementById('profile-pic');
const editForm = document.getElementById('editForm');
const logoutBtn = document.getElementById('logout-btn');
const languageSelect = document.getElementById('language-select');

// Initialize page
loadingScreen.style.display = 'flex';
mainContent.style.display = 'none';

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        // Set initial values
        userName.textContent = user.displayName || 'User';
        userEmail.textContent = user.email || 'No email';
        userPhone.textContent = 'Not set';
        userLocation.textContent = 'Not set';
        userUsername.textContent = 'Not set';

        // Set join date
        if (user.metadata.creationTime) {
            const joinDate = new Date(user.metadata.creationTime);
            userJoinDate.textContent = joinDate.toLocaleDateString();
        } else {
            userJoinDate.textContent = 'Unknown';
        }

        // Load additional profile data
        loadUserProfile(user.uid);
        mainContent.style.display = 'block';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    } else {
        window.location.href = 'signup.html';
    }
});

// Load user profile from Firestore
async function loadUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            userUsername.textContent = data.username || 'Not set';
            userPhone.textContent = data.phone || 'Not set';
            userLocation.textContent = data.location || 'Not set';
            if (data.profilePicUrl) {
                profilePic.src = data.profilePicUrl;
            }
            if (data.displayName) {
                userName.textContent = data.displayName;
            }
        } else {
            // Create initial profile if it doesn't exist
            await db.collection('users').doc(uid).set({
                displayName: userName.textContent,
                email: userEmail.textContent,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showToast('Error loading profile data', 'error');
    }
}

// Toggle edit form
function toggleEditForm() {
    const isVisible = editForm.style.display === 'block';
    editForm.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        document.getElementById('edit-username').value = userUsername.textContent === 'Not set' ? '' : userUsername.textContent;
        document.getElementById('edit-phone').value = userPhone.textContent === 'Not set' ? '' : userPhone.textContent;
    }
}

// Handle form submission
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('edit-username').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const user = auth.currentUser;

    if (!user) {
        showToast('Please log in to update profile', 'error');
        return;
    }

    const submitBtn = editForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        // Ensure the user document exists
        await db.collection('users').doc(user.uid).set({
            username: username || firebase.firestore.FieldValue.delete(),
            phone: phone || firebase.firestore.FieldValue.delete(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Reload profile to reflect changes
        await loadUserProfile(user.uid);

        toggleEditForm();
        showToast('Profile updated successfully!', 'success');
    } catch (error) {
        console.error("Error updating profile:", error);
        showToast('Error updating profile: ' + (error.message || 'Unknown error'), 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
});

// Handle profile picture upload
document.getElementById('profile-pic-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        const storageRef = storage.ref(`profile_pics/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = await storageRef.put(file);
        const downloadURL = await uploadTask.ref.getDownloadURL();

        await db.collection('users').doc(user.uid).update({
            profilePicUrl: downloadURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        profilePic.src = downloadURL;
        showToast('Profile picture updated!', 'success');
    } catch (error) {
        console.error("Error uploading picture:", error);
        showToast('Error uploading picture: ' + error.message, 'error');
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'signup.html';
    } catch (error) {
        showToast('Error logging out: ' + error.message, 'error');
    }
});

// Language selector
languageSelect.addEventListener('change', (e) => {
    showToast(`Language changed to ${e.target.options[e.target.selectedIndex].text}`, 'info');
});

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: opacity 0.3s;
    `;

    switch(type) {
        case 'success': toast.style.backgroundColor = '#48BB78'; break;
        case 'error': toast.style.backgroundColor = '#F56565'; break;
        case 'info': toast.style.backgroundColor = '#6C63FF'; break;
    }

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
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