const express = require('express');
const admin = require('firebase-admin');
const app = express();

// Initialize Firebase Admin SDK (create a service account key in Firebase Console)
const serviceAccount = require('./path-to-your-service-account-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

// Example endpoint to save additional user data
app.post('/signup', async (req, res) => {
    const { uid, fullName, phone } = req.body;
    try {
        await admin.firestore().collection('users').doc(uid).set({
            fullName,
            phone,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).send('User data saved');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});