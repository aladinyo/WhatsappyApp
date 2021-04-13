import { memo, useState, useEffect, useRef } from 'react';
import { Send, MicRounded, CancelRounded, CheckCircleRounded } from '@material-ui/icons';
import db, { createTimestamp, fieldIncrement, audioStorage } from "./firebase";
import { useStateValue } from './StateProvider';
import { CSSTransition } from "react-transition-group";
import recorder from "./recorder.js";
import { v4 as uuidv4 } from 'uuid';
import "./ChatFooter.css";
const wait = time => new Promise(resolve => setTimeout(resolve, time));

export default memo(function ChatFooter({input, handleFocus, change, sendMessage, setFocus, image, focus, state, token, roomID, setAudioID}) {
	const [recording, setRecording] = useState(false);
	const [recordingTimer, setRecordingTimer] = useState("00:00");
	const [{ user }] = useStateValue();
	const recordingEl = useRef();
	const inputRef = useRef();
	const timerInterval = useRef();
	const record = useRef();

	function handleBlur(event) {
	    if (!event.currentTarget.contains(event.relatedTarget) && !recording) {
	    	setFocus(false)
	    }
	}

	async function sendAudio(audioFile, timer, audioName) {
		db.collection("rooms").doc(roomID).set({
            [user.uid]: false,
        }, { merge: true });
		db.collection("rooms").doc(roomID).set({
			lastMessage:{
				audio: true,
				time: timer,
			},
			seen: false
		}, { merge: true });
        if (state.userID) {
        	db.collection("users").doc(state.userID).collection("chats").doc(roomID).set({
                timestamp: createTimestamp(),
                photoURL: user.photoURL ? user.photoURL : null,
                name: user.displayName,
                userID: user.uid,
                unreadMessages: fieldIncrement(1),
            }, { merge: true });
            db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                timestamp: createTimestamp(),
                photoURL: state.photoURL ? state.photoURL : null,
                name: state.name,
                userID: state.userID
            }, { merge: true });
        } else {
        	db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                timestamp: createTimestamp(),
                photoURL: state.photoURL ? state.photoURL : null,
                name: state.name,
            });
        };
        const doc = await db.collection("rooms").doc(roomID).collection("messages").add({
        	name: user.displayName,
            uid: user.uid,
            timestamp: createTimestamp(),
            time: new Date().toUTCString(),
            audioUrl: "uploading",
            audioName,
            audioPlayed: false
        });
        await audioStorage.child(audioName).put(audioFile);
        const url = await audioStorage.child(audioName).getDownloadURL();
        db.collection("rooms").doc(roomID).collection("messages").doc(doc.id).update({
            audioUrl: url
        });
        if (state.userID && token !== "") {
        	db.collection("notifications").add({
	            userID: user.uid,
	            title: user.displayName,
	            body: "🎙️ " + timer,
	            photoURL: user.photoURL,
	            token: token
	        });
        };
	};

	async function startRecording(e) {
		e.preventDefault();
		if (window.navigator.onLine) {
			if (focus) {
				inputRef.current.focus();
			}
			await wait(150);
			record.current = await recorder(roomID);
			setAudioID(null);
			inputRef.current.style.width = "calc(100% - 56px)"
			await wait(305);
			setRecording(true);
		} else {
			alert("No access to internet !!!");
		}
	}

	async function stopRecording() {
		if (focus) {
			inputRef.current.focus();
		}
		db.collection("rooms").doc(roomID).set({
            [user.uid]: false,
        }, { merge: true });
		clearInterval(timerInterval.current);
		const stopped = record.current.stop();
		recordingEl.current.style.opacity = "0";
		await wait(300);
		setRecording(false);
		inputRef.current.style.width = "calc(100% - 112px)";
		const time = recordingTimer;
		setRecordingTimer("00:00");
		return [stopped, time];
	}

	async function finishRecording() {
		var [audio, time] = await stopRecording();
		audio = await audio;
		sendAudio(audio.audioFile, time, audio.audioName);
	}

	function pad(val) {
        var valString = val + "";
        if(valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

	function timer() {
        const start = Date.now();
        timerInterval.current = setInterval(setTime, 100);

        function setTime() {
            const delta = Date.now() - start; // milliseconds elapsed since start
            const totalSeconds = Math.floor(delta / 1000);
            setRecordingTimer(pad(parseInt(totalSeconds/60)) + ":" + pad(totalSeconds%60))
        }
	}

	function audioInputChange(e) {
		if (window.navigator.onLine) {
			const file = e.target.files[0];
			if (file) {
				setAudioID(null);
				const audioFile = new Audio(URL.createObjectURL(file));
				audioFile.addEventListener("loadedmetadata", () => {
					const totalSeconds = Math.floor(audioFile.duration);
					const time = pad(parseInt(totalSeconds/60)) + ":" + pad(totalSeconds%60);
					sendAudio(file,time, uuidv4());
				});
			};
		} else {
			alert("No access to internet !!!");
		}
	};

	useEffect(() => {
		const a = async () => {
			await wait(10);
			recordingEl.current.style.opacity = "1";
			await wait(100);
			timer();
			db.collection("rooms").doc(roomID).set({
                [user.uid]: "recording",
            }, { merge: true })
			record.current.start();
		}
		if (recording) {
			a();
		}
	}, [recording]);

	const btnIcons = <>
		<CSSTransition
        	in={input !== "" || (input === "" && image)}
        	timeout={{
        		enter: 400,
        		exit: 200,
        	}}
        	classNames="send__animate2"
        >
        	<Send 
            	style={{
                    width: 20,
                    height: 20,
                    color: "white"
                }}
            />
        </CSSTransition>
        <CSSTransition
        	in={!(input !== "" || (input === "" && image))}
        	timeout={{
        		enter: 400,
        		exit: 200,
        	}}
        	classNames="send__animate"
        >
        	<MicRounded 
            	style={{
            		width: 24,
                    height: 24,
                    color: "white"
            	}}
            />
    	</CSSTransition>
	</>;

	return (
		<div className="chat__footer" onBlur={handleBlur} >
	        <form>
	            <input
	            	ref={inputRef}
	                value={input}
	                onClick={handleFocus}
	                onChange={!recording ? change : null}
	                onKeyPress={recording ? () => false : null}
	                onFocus={() => setFocus(true)}
	                placeholder="Type a message"
	            />
	            {navigator.mediaDevices.getUserMedia && window.MediaRecorder ?
	            	<button 
		            	type="submit" 
		            	class="send__btn" 
		            	onClick={input !== "" || (input === "" && image) ? sendMessage : startRecording}
		            >
		                {btnIcons}
		            </button>	
		        :
		        	<>
		        		<label
			        		for="capture"  
			            	class="send__btn" 
			            >
			                {btnIcons}
			            </label> 
			        	<input
			        		style={{display: "none"}} 
				        	type="file" 
				            id="capture" 
				            accept="audio/*" 
				            capture
				            onChange={audioInputChange}  
			            />
		        	</>
		        }
	            
	        </form>
	        {recording ?
		        <div ref={recordingEl} className="record">
		        	<CancelRounded
		        		style={{
	                		width: 30,
		                    height: 30,
		                    color: "#F20519"
	                	}}
	                	onClick={stopRecording}
		        	/>
		        	<div>
		        		<div className="record__redcircle"></div>
		        		<div className="record__duration">{recordingTimer}</div>
		        	</div>
		        	<CheckCircleRounded
		        		style={{
	                		width: 30,
		                    height: 30,
		                    color: "#41BF49"
	                	}}
	                	onClick={finishRecording} 
		        	/>
		        </div> : null
		    }
	    </div>
	)
})