import { useState, useEffect, memo, useRef } from 'react';
import PlayArrowRoundedIcon from '@material-ui/icons/PlayArrowRounded';
import PauseRoundedIcon from '@material-ui/icons/PauseRounded';
import CircularProgress from '@material-ui/core/CircularProgress';
import PlayForWorkRoundedIcon from '@material-ui/icons/PlayForWorkRounded';
import db from "./firebase";
import "./AudioPlayer.css"

export default memo(function AudioPlayer({sender, roomID, audioUrl, id, setAudioID, audioID, animState, audioPlayed}) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [mediaLoaded, setMediaLoaded] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [error, setError] = useState(false);
	const [sliderValue, setSliderValue] = useState(0);
	const [sliderPlayedWidth, setSliderPlayedWidth] = useState("0%");
	const [duration, setDuration] = useState("");
	const totalDuration = useRef("");
	const audio = useRef(new Audio(audioUrl));
	const interval = useRef();
	const uploading = useRef(audioUrl === "uploading");

	function play () {
		audio.current.play();
		if (!audioPlayed && !sender) {
			db.collection("rooms").doc(roomID).collection("messages").doc(id).set({
				audioPlayed: true
			}, {merge: true});
		}
		if (audioID !== id) {
			setAudioID(id);
		}
		interval.current = setInterval(seekUpdate, 50);
		setIsPlaying(true);
	}

	function pause() {
		audio.current.pause();
		clearInterval(interval.current);
		setIsPlaying(false);
		setDuration(totalDuration.current);
	}

	function inputChange(e) {
		const value = e.target.value;
		if (mediaLoaded) {
			const seekto = audio.current.duration * (value / 100);
			audio.current.currentTime = seekto;
			setSliderValue(value);
			setSliderPlayedWidth(`${value - 5.7 * (value / 100)}%`);
		}
	}

	function getCurrentTime() {
		// Calculate the time left and the total duration 
		let currentMinutes = Math.floor(audio.current.currentTime / 60); 
		let currentSeconds = Math.floor(audio.current.currentTime - currentMinutes * 60); 

		// Add a zero to the single digit time values 
		if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; } 
		if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; } 

		// Display the updated duration 
		return  currentMinutes + ":" + currentSeconds; 
	}

	function seekUpdate() { 
		let seekPosition = 0; 
		// Check if the current track duration is a legible number 
		if (!isNaN(audio.current.duration)) { 
			seekPosition = audio.current.currentTime * (100 / audio.current.duration); 
			setSliderValue(seekPosition);
			setSliderPlayedWidth(seekPosition + "%"); 
			setDuration(getCurrentTime());
		} 
	}

	function loadAudioAgain() {
		audio.current.load();
		setError(false);
	}

	function calculateMediaDuration(media){
	  return new Promise( (resolve,reject)=>{
	    media.onloadedmetadata = function(){
	      // set the mediaElement.currentTime  to a high value beyond its real duration
	      media.currentTime = Number.MAX_SAFE_INTEGER;
	      // listen to time position change
	      media.ontimeupdate = function(){
	        media.ontimeupdate = function(){};
	        // setting player currentTime back to 0 can be buggy too, set it first to .1 sec
	        media.currentTime = 0.1;
	        media.currentTime = 0;
	        // media.duration should now have its correct value, return it...
	        resolve(media.duration);
	      }
	    }
	  });
	};
	
	useEffect(() => {
		if (uploading.current === true && audioUrl !== "uploading") {
			audio.current = new Audio(audioUrl);
			audio.current.load();
			setLoaded(true);
		} else if (uploading.current === false) {
			setLoaded(true);
		}
	}, [audioUrl]);

	useEffect(() => {
		if (loaded) {
			audio.current.addEventListener("error", () => {
				setError(true);
			});
			calculateMediaDuration(audio.current).then(() => {
				setMetadataLoaded(true);
			})
		}
	}, [loaded]); 

	useEffect(() => {
		if (metadataLoaded) {
			audio.current.addEventListener("canplaythrough", async () => {
				if (totalDuration.current === "") {
					setMediaLoaded(true);
					let durationMinutes = Math.floor(audio.current.duration / 60); 
					let durationSeconds = Math.floor(audio.current.duration - durationMinutes * 60); 
					// Add a zero to the single digit time values 
					if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; } 
					if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; } 
					// Display the updated duration 
					totalDuration.current = durationMinutes + ":" + durationSeconds;
					setDuration(totalDuration.current);
				}
			});
			audio.current.addEventListener("ended", () => {
				clearInterval(interval.current);
				setDuration(totalDuration.current);
				setSliderValue(0);
				setSliderPlayedWidth("0%");
				setIsPlaying(false);
			});
		}
	}, [metadataLoaded]);

	useEffect(() => {
		if (animState === "exiting") {
			audio.current.pause();
		}
	}, [animState]);

	useEffect(() => {
		if (audioID !== id) {
			audio.current.pause();
			setIsPlaying(false);
		}
	}, [audioID])

	return (
		<>
			<div className={`${sender ? "audioplayer" : "audioplayer audioplayer2"} ${audioPlayed ? "audioplayer__played" : ""}`}>
				{!mediaLoaded && !error ?
					<CircularProgress />
				: isPlaying && !error? 
					<PauseRoundedIcon className="pause" onClick={pause} /> 
				: !isPlaying && !error ?
					<PlayArrowRoundedIcon onClick={play} />
				: 
					<PlayForWorkRoundedIcon onClick={loadAudioAgain} />
				}
				<div>
					<span 
						style={{
							width: sliderPlayedWidth,
						}}
						className="audioplayer__slider--played" 
					></span>
					<input	
						type="range" min="1" max="100" value={sliderValue}
						onChange={inputChange} class="audioplayer__slider"
					></input>
				</div>
			</div>
			<span className="chat__timestamp audioplayer__time">{duration}</span>
		</>
	)
})