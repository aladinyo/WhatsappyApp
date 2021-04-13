importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyDKpDICrGpe4Afk1j0ffc8dlUG3jWKpgx0",
    authDomain: "whatsappy-app.firebaseapp.com",
    databaseURL: "https://whatsappy-app.firebaseio.com",
    projectId: "whatsappy-app",
    storageBucket: "whatsappy-app.appspot.com",
    messagingSenderId: "468435242245",
    appId: "1:468435242245:web:737f34ce5b750648aa7b6c",
    measurementId: "G-QL39RMK58H"
})

const messaging = firebase.messaging();

var href = self.location.origin 

messaging.onBackgroundMessage(payload => {
	const title = payload.data.title;
	const options = payload.data.image ? {
		badge: "icon.png",
		body: payload.data.body,
		icon: payload.data.photoURL,
        image: payload.data.image,
    } : {
        badge: "icon.png",
        body: payload.data.body,
        icon: payload.data.photoURL,
    }
	self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    self.clients.openWindow(href);
})