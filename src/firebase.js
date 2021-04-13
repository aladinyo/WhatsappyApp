import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database"
import "firebase/messaging";
import "firebase/storage"

const firebaseConfig = {
    apiKey: "AIzaSyDKpDICrGpe4Afk1j0ffc8dlUG3jWKpgx0",
    authDomain: "whatsappy-app.firebaseapp.com",
    databaseURL: "https://whatsappy-app.firebaseio.com",
    projectId: "whatsappy-app",
    storageBucket: "whatsappy-app.appspot.com",
    messagingSenderId: "468435242245",
    appId: "1:468435242245:web:737f34ce5b750648aa7b6c",
    measurementId: "G-QL39RMK58H"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const enablePersistence = firebaseApp.firestore().enablePersistence();
const db = firebaseApp.firestore();
const db2 = firebaseApp.database();
const auth = firebaseApp.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const createTimestamp = firebase.firestore.FieldValue.serverTimestamp;
const createTimestamp2 = firebase.database.ServerValue.TIMESTAMP;
const messaging = "serviceWorker" in navigator && "PushManager" in window ?  firebase.messaging() : null;
const fieldIncrement = firebase.firestore.FieldValue.increment;
const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
const storage = firebase.storage().ref("images");
const audioStorage = firebase.storage().ref("audios");

async function loadFirebase(setFirebaseLoaded) {
	await enablePersistence;
	await db;
	setFirebaseLoaded(true);
}
//db.disableNetwork();

export {loadFirebase, auth , provider, createTimestamp, messaging, fieldIncrement, arrayUnion, storage, audioStorage, db2, createTimestamp2};
export default db;