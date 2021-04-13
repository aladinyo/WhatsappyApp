const admin = require("firebase-admin");
const algoliasearch = require('algoliasearch');
const serviceAccount = require("./serviceAccountKey.json");/*download your own service account key from firebase*/
const client = algoliasearch("XXXXX", "xxxxxxxxxxxxxx"); /*use your own keys*/
const index = client.initIndex('whatsappy-app');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whatsappy-app.firebaseio.com"
});

const db = admin.firestore();
const db2 = admin.database();

let listening = false;
db.collection("notifications").onSnapshot(snap => {
	if (!listening) {
		console.log("listening for notifications...");
		listening = true;
	}
	const docs = snap.docChanges();
	if (docs.length > 0) {
		docs.forEach(async change => {
			if (change.type === "added") {
				const data = change.doc.data();
				if (data) {
					console.log("\n");
					console.log("notification was found");
					console.log(data);
					console.log("\n");
					const message = {
						data: data,
						token: data.token
					};
					await db.collection("notifications").doc(change.doc.id).delete();
					console.log("notification deleted from database");
					try {
						const response = await admin.messaging().send(message);
						console.log("notification successfully sent ", response);	
					} catch(error) {
						console.log("error sending notification ", error);
					};
				};
			};
		});
	};
});

db.collection("users").onSnapshot(snap => handleSnap(snap, true));
db.collection("rooms").orderBy("timestamp").onSnapshot(snap => handleSnap(snap, false));
db2.ref('/status/').on(("child_added"), data => handleOnlineStatus(data, "child_added"));
db2.ref('/status/').on(("child_changed"), data => handleOnlineStatus(data, "child_changed"));

function handleSnap (snap, update) {
	const docs = snap.docChanges();
	if (docs.length > 0) {
		docs.forEach(async change => {
			if (change.type === "added" || (change.type === "modified") && update) {
				console.log("document added or modified\n");
				const data = change.doc.data();
				data.objectID = change.doc.id;
				if (!update) {
					data.lastMessage = "";
				};
				console.log("document: ", data);
				await index.saveObject(data);
				console.log("object succesfully saved !!!");
			} else if (change.type === "removed") {
				console.log("document was deleted\n");
				console.log("document: ", change.doc.data());
				await index.deleteObject(change.doc.id);
				console.log("object succesfully deleted !!!");
			}
		});
	};
};

async function handleOnlineStatus(data, event) {
	console.log("setting online status with event: ", event);
	// Get the data written to Realtime Database
	const eventStatus = data.val();
	console.log("eventStatus: ", eventStatus);
	// Then use other event data to create a reference to the
	// corresponding Firestore document.
	const userStatusFirestoreRef = db.doc(`users/${eventStatus.id}`);

	// It is likely that the Realtime Database change that triggered
	// this event has already been overwritten by a fast change in
	// online / offline status, so we'll re-read the current data
	// and compare the timestamps.
	const statusSnapshot = await data.ref.once('value');
	const status = statusSnapshot.val();
	console.log(status, eventStatus);
	// If the current timestamp for this data is newer than
	// the data that triggered this event, we exit this function.
	if (status.last_changed <= eventStatus.last_changed) {
		// Otherwise, we convert the last_changed field to a Date
		eventStatus.last_changed = new Date(eventStatus.last_changed);
		// ... and write it to Firestore.
		await userStatusFirestoreRef.set(eventStatus, {merge: true});
		console.log("user: " + eventStatus.id + " online status was succesfully updated !!!");
	} else {
		console.log("next status timestamp is newer for user: ", eventStatus.id);
	}

}
