const express = require('express');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory (built frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// API routes can be added here
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Node.js server!' });
});

// Catch all handler: send back index.html for client-side routing
// app.all('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Test: Write a dummy doc to 'profiles' collection
  try {
    const docRef = await db.collection('profiles').add({
      name: 'Dummy User',
      email: 'dummy@example.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Dummy doc added to profiles collection with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding dummy doc:', error);
  }
});