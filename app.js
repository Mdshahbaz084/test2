// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBfqQkLMdirE1s3QDAU-k8kZJDSJ-AHfxI",
  authDomain: "madrsa-sikariya.firebaseapp.com",
  projectId: "madrsa-sikariya",
  storageBucket: "madrsa-sikariya.firebasestorage.app",
  messagingSenderId: "1066102927865",
  appId: "1:1066102927865:web:d5e649be4178d363408d28",
  measurementId: "G-3S96TVYFJC"
};

// Display error message on the UI
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Display success message on the UI
function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Register service worker manually to fix issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./firebase-messaging-sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
        showSuccess('Service Worker registered successfully!');
        
        // Continue with getting token after SW registration
        messaging.getToken({ 
          vapidKey: 'BClpcTQygEYX1ueX4n8GTMN0UmSsaeM1JwpbRoI81WxOaHGB4gQHJl-bNiyBJmp_c5CryDL0NGiWAd2a7z3CpB4',
          serviceWorkerRegistration: registration
        })
        .then((currentToken) => {
          if (currentToken) {
            console.log('Current token:', currentToken);
            showSuccess('Successfully registered for notifications!');
            // Send the token to your server if needed
          } else {
            console.log('No registration token available.');
            requestPermission();
          }
        })
        .catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
          showError('Error retrieving token: ' + err.message);
          requestPermission();
        });
      })
      .catch(function(error) {
        console.log('Service Worker registration failed:', error);
        showError('Service Worker registration failed: ' + error.message);
      });
  } else {
    console.log('Service workers are not supported in this browser.');
    showError('Service workers are not supported in this browser.');
  }

  // Request notification permission
  function requestPermission() {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        showSuccess('Notification permission granted!');

        // Get registration
        navigator.serviceWorker.ready.then((registration) => {
          // After permission is granted, attempt to get token again
          messaging.getToken({ 
            vapidKey: 'BClpcTQygEYX1ueX4n8GTMN0UmSsaeM1JwpbRoI81WxOaHGB4gQHJl-bNiyBJmp_c5CryDL0NGiWAd2a7z3CpB4',
            serviceWorkerRegistration: registration
          })
          .then((currentToken) => {
            if (currentToken) {
              console.log('New token after permission:', currentToken);
              showSuccess('Successfully registered for notifications!');
              // Send the token to your server if needed
            } else {
              console.log('No registration token available.');
              showError('Failed to get registration token. Check your Firebase configuration.');
            }
          })
          .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            showError('Error retrieving token: ' + err.message);
          });
        });
      } else {
        console.log('Unable to get permission to notify.');
        showError('Notification permission denied. Please enable notifications to receive updates.');
      }
    });
  }

  // Handle incoming messages while page is in foreground
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    
    // Display notification manually in foreground
    if (Notification.permission === 'granted') {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || '/firebase-logo.png'
      });
    }
  });

  // Check notification permission on page load and ask for it if not granted
  document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      requestPermission();
    }
  });

  // If user denied permission, ask again when they interact with the page
  if (Notification.permission === 'denied') {
    document.addEventListener('click', () => {
      requestPermission();
    }, { once: true });
  }

  // Check permission status on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Notification.permission !== 'granted') {
      requestPermission();
    }
  });
} catch (error) {
  console.error('Error initializing Firebase:', error);
  showError('Error initializing Firebase: ' + error.message);
} 