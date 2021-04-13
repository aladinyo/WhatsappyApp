import { useEffect, memo, useState } from "react";
import { createPortal } from "react-dom";
import { useHistory } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import "./ImagePreview.css"

export default memo(function ImagePreview({ imagePreview, animState }) {
    const history = useHistory();
    const [loaded, setLoaded] = useState(false);
    const [{page}] = useStateValue();
    
    useEffect(() => {
        if (loaded) {
            const ratio = page.height / page.width;
            const el = document.querySelector('.imagePreview-container');
            var animW, animH, a;
            const imageRatio = imagePreview.ratio ? imagePreview.ratio : (imagePreview.imgH / imagePreview.imgW);
            if (ratio  < imageRatio) {
                a = true;
                animW = (1 / imageRatio) * page.height;
                animH = page.height;
            } else {
                a = false;
                animH = imageRatio * page.width;
                animW = page.width;
            }
            if (animState === "entering" || animState === "entered") {
                setTimeout(() => {
                    document.querySelector(".imagePreview").style.backgroundColor = "black";
                    el.style.borderRadius = "0px"
                    el.style.transformOrigin = a ? "0% 0%" : "0% 0%";
                    el.style.height = imagePreview.imgH + "px";
                    el.style.transform = a ? `translateX(${(page.width / 2) - (animW / 2)}px) translateY(0px) scale(${page.height / imagePreview.imgH})` : 
                            `translateX(0px) translateY(${(page.height / 2) - (animH / 2)}px) scale(${page.width / imagePreview.width})`
                    setTimeout(() => {
                        document.querySelector('.imagePreview .MuiSvgIcon-root').classList.add("close-animate")
                    }, 300)
                }, 10)
            } else if (animState === "exiting") {
                setTimeout(() => {
                    document.querySelector('.imagePreview .MuiSvgIcon-root').classList.remove("close-animate")
                    setTimeout(() => {
                        document.querySelector(".imagePreview").style.backgroundColor = "transparent"
                    }, 200)
                    el.style.borderRadius = "10px"
                    el.style.height = imagePreview.height + "px";
                    el.style.transform = `translateX(${imagePreview.left}px) translateY(${imagePreview.top}px) scale(1)`;
                }, 10)
            }
        }
    }, [animState, loaded]);

    const style = {
        transform:`translateX(${imagePreview.left}px) translateY(${imagePreview.top}px) scale(1)`,
        width: imagePreview.width,
        height: imagePreview.height,
    }

    const imgStyle = {}

    if (page.height / page.width > imagePreview.ratio || page.height / page.width === imagePreview.ratio) {
        imgStyle.minWidth = "100%";
    } else {
        imgStyle.minHeight = "100%";
        if (imagePreview.imgW < imagePreview.width) {
            imgStyle.minWidth = "100%";
        }
    }
       
    return createPortal(
        <div className="imagePreview" onClick={() => document.querySelector('.imagePreview .MuiSvgIcon-root').classList.toggle("close-animate")}>
            <CloseRoundedIcon onClick={() => history.goBack()} />
            <div
                className="imagePreview-container"
                style={style}
            >
                <img style={imgStyle} onLoad={() => setLoaded(true)} src={imagePreview.src} alt="" />
            </div>
        </div>
    , document.querySelector(".app"))
})