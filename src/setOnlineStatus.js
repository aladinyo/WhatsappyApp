import db, { createTimestamp, createTimestamp2, db2 } from "./firebase";

export default function setOnlineStatus (uid) {
	try {
		const isOfflineForDatabase = {
		    state: 'offline',
		    last_changed: createTimestamp2,
		    id: uid,
		};

		const isOnlineForDatabase = {
		    state: 'online',
		    last_changed: createTimestamp2,
		    id: uid
		};
		const userStatusFirestoreRef = db.doc('/users/' + uid);
		const userStatusDatabaseRef = db2.ref('/status/' + uid);

		// Firestore uses a different server timestamp value, so we'll 
		// create two more constants for Firestore state.
		const isOfflineForFirestore = {
		    state: 'offline',
		    last_changed: createTimestamp(),
		};

		const isOnlineForFirestore = {
		    state: 'online',
		    last_changed: createTimestamp(),
		};

		db2.ref('.info/connected').on('value', function(snapshot) {
		    if (snapshot.val() === false) {
		        // Instead of simply returning, we'll also set Firestore's state
		        // to 'offline'. This ensures that our Firestore cache is aware
		        // of the switch to 'offline.'
		        userStatusFirestoreRef.set(isOfflineForFirestore,{merge: true});
		        return;
		    };

		    userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
		        userStatusDatabaseRef.set(isOnlineForDatabase);

		        // We'll also add Firestore set here for when we come online.
		        userStatusFirestoreRef.set(isOnlineForFirestore, {merge: true});
		    });
		});
	} catch(error) {
		console.log("error setting onlins status: ", error);
	}
};