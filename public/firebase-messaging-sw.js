importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js');

firebase.initializeApp({}) /*use your own configuration*/

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
