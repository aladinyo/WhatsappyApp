import {memo, useEffect, useState} from "react";
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import "./MediaPreview.css";

export default memo(function MediaPreview({imageSRC, mediaPreview, close}) {
	const [height, setHeight] = useState("");

	useEffect(() => {
		setHeight(document.querySelector('.chat__body--container').offsetHeight);
	}, [])

	return(
		<div 
			ref={mediaPreview} 
			className="mediaPreview"
			style={{
				height: height,
			}}
		>
			<CloseRoundedIcon onClick={close} />
			<img key={imageSRC} src={imageSRC} alt="" />
		</div>
	)
})