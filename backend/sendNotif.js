const admin = require("firebase-admin");
const firebase = require("firebase");
const serviceAccount = require("./serviceAccountKey.json");

/*this code is for testing purposes only*/

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whatsappy-app.firebaseio.com"
});

const db = admin.firestore();

console.log("adding the notif to cloud firestore");
db.collection("notifications2").add({
    userID: "0zs2BiVOISfMCE7mP0fT8zPiit53",
    title: "hacker bando",
    body: "wesh ya na9ch",
    photoURL: "https://lh4.googleusercontent.com/-tbJZXfy1FVg/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnmWljfyeNPES_8nI3pjSvOLx2BWw/s96-c/photo.jpg",
    href: "https://whatsappy-app.web.app/",
    token: "ewIn2h6F6WYY-vGVdTaUaI:APA91bHnYUIcHgknxazzeInzA-1ZQpn41G29QkJV8w-PDOszmpxqJdxRGLHcnXxu2jGCLWBLZjXapUY0YTIzI-NbOIwlZNzt1gh82zg4AuRGxOf1oiJeaHgTSJwEZTgHCk4UkKlVneAX",
}).then(() => {
	console.log("notif added")
}).catch(e => console.log(e));