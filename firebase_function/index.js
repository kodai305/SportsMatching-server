// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
const settings = {/* your settings... */ timestampsInSnapshots: true};
admin.firestore().settings(settings);
var db = admin.firestore();

/**
 * Send FCM notification to inviter from applicant
 */
exports.sendNewApplyNotification = functions.https.onCall((data, context) => {
    //投稿IDを取得 (投稿ID=投稿者のUID)
    const postID   = data.postID; 
    const message  = data.message;
    const userName = data.userName;
    console.log("message:");
    console.log(message);
    //context には認証情報などが含まれている
    //リクエストした人のUID
    const uid = context.auth.uid;

    // 通知のJSON
    const payload = {
		notification: {
			title: "テスト",
			body: "新着応募があります",
			sound:"default",
			content_available: "true",
		},
		data: {
			msgType: "NewApply",
			message: message,
		    sender: uid,
		    senderName: userName,
		}
    };
	// priorityをhighにしとくと通知打つのが早くなる
	const options = {
		priority: "high",
	};

	console.log("postID:",postID);

	const userRef = db.collection('users').doc(postID);
	return userRef.get().then(snap => {
		console.log(snap);
		console.log(snap.data());
		const fcmToken = snap.data().fcmToken;
		console.log("fcmToken:");
		console.log(fcmToken);
		// Send Push Notification
		return admin.messaging().sendToDevice(fcmToken, payload, options)
	}).then(response => {
		console.log("response:");
		console.log(response);
		// XXX: shoud error handle
	    return {
		    returnMsg : 'success',
		};
	}).catch(error => {
		// Handle the error
		console.log("error:")
		console.log(error)
		return {
			returnMsg : 'error',
		};

	})
})

exports.sendNewMessageNotification = functions.https.onCall((data, context) => {
    //投稿IDを取得 (投稿ID=投稿者のUID)
    const partnerUID = data.partnerUID; 
    const message    = data.message;
    const roomID     = data.roomID;
    const senderType = data.senderType;
    console.log("message:");
    console.log(message);
    //context には認証情報などが含まれている
    //リクエストした人のUID
    const uid = context.auth.uid;

    var titleMsg = "新着メッセージです。";
    if (senderType === 'Applicant') {
	titleMsg = '応募者からのメッセージがあります。';
	console.log('応募者からのメッセージがあります。');
    } else if (senderType === 'Recruiter') {
	titleMsg = '募集者からのメッセージがあります。';
	console.log('募集者からのメッセージがあります。');
    }
    
    // 通知のJSON
    const payload = {
	notification: {
	    title: titleMsg,
	    body: message,
	    sound:"default",
	    content_available: "true",
	},
	data: {
	    msgType: "NewMessage",
	    message: message,
	    sender: uid,
	    roomID: roomID,
	}
    };
    // priorityをhighにしとくと通知打つのが早くなる
    const options = {
	priority: "high",
    };

    console.log("partnerUID:",partnerUID);
    
    const userRef = db.collection('users').doc(partnerUID);
    return userRef.get().then(snap => {
	console.log(snap);
	console.log(snap.data());
	const fcmToken = snap.data().fcmToken;
	console.log("fcmToken:");
	console.log(fcmToken);
	// Send Push Notification
	return admin.messaging().sendToDevice(fcmToken, payload, options)
    }).then(response => {
	console.log("response:");
	console.log(response);
	// XXX: shoud error handle
	return {
	    returnMsg : 'success',
	};
    }).catch(error => {
	// Handle the error
	console.log("error:")
	console.log(error)
	return {
	    returnMsg : 'error',
	};
	
    })
})

					   
