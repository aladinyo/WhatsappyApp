import {useEffect,  memo, useRef, useState} from 'react';
import { Avatar } from '@material-ui/core';
import { CancelOutlined, SearchOutlined, Photo, MicRounded } from '@material-ui/icons';
import './SidebarChat.css';
import { Link } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useStateValue } from './StateProvider';
//window
function SidebarChat({ dataList, title, path, fetchList}) {
    const [{roomsData, page, pathID}, dispatch] = useStateValue();
    const [scrollFetch, setScrollFetch] = useState(false);
    const [list, setList] = useState(null);
    const sidebarChatContainer = useRef();

    useEffect(() => {
        var a = null;
        if (fetchList) {
            a = function () {
                if (parseInt(sidebarChatContainer.current.scrollTop) === sidebarChatContainer.current.scrollHeight - sidebarChatContainer.current.offsetHeight) {
                    fetchList(setScrollFetch);
                };
            };
            if (dataList?.length > 0) {
                sidebarChatContainer.current.addEventListener("scroll", a);
            };
        };
        const clean = sidebarChatContainer.current;
        return () => {
            if (a) {
                //console.log("removing event");
                clean.removeEventListener("scroll", a);
                
            };
        };
    }, [dataList, fetchList]);
    
    useEffect(() => {
        //console.log(dataList);
        //console.log(list)
        if (dataList?.length === list?.length) {
            setTimeout(() => {
                Array.from(document.querySelectorAll('.animate')).forEach((cur,i) => {
                    setTimeout(() => {
                        cur.classList.remove("animate");
                    }, 50 * i);
                });
            }, 10);
        };
    }, [dataList, list]);

    useEffect(() => {
        if (dataList) {
            const arr = [];
            dataList.forEach(data => {
                //console.log("data: ", data);
                //console.log("rooms data: ", roomsData[data.id]);
                if (data) {
                    const onlineState = roomsData[data.id]?.onlineState ? roomsData[data.id].onlineState : data.state;
                    const lastMessage = title === "Search Result" ? null : roomsData[data.id]?.lastMessage ? roomsData[data.id].lastMessage : data.lastMessage;
                    if (title === "Rooms" || title === "Search Result" || title === "Chats" && roomsData[data.id].lastMessage || title !== "Chats" && roomsData[data.id]) {
                        arr.push(<Link className="link" key={data.id} to={{
                            pathname: path ? `${path}/room/${data.id}` : `/room/${data.id}`,
                            state: {
                                photoURL: `${data.photoURL ? data.photoURL : `https://avatars.dicebear.com/api/human/${data.id}.svg`}`,
                                name: data.name,
                                userID: data.userID ? data.userID : null,
                                state: data.state
                            }
                        }} >
                            <div 
                                className={`sidebar__chat animate`}
                            >
                                <div className="avatar__container">
                                    <Avatar style={{width: 45,height: 45}} src={`${data.photoURL ? data.photoURL : `https://avatars.dicebear.com/api/human/${data.id}.svg`}`} />
                                    {onlineState=== "online" ? <div className="online"></div> : null}
                                </div>
                                <div className="sidebar__chat--info">
                                    <h2 
                                        dangerouslySetInnerHTML={{__html: title === "Search Result" ? data._highlightResult.name.value : data.name}}
                                        style={{
                                            width: page.width <= 760 ? page.width - 126 : page.width * 0.315 - 126,
                                            marginBottom: lastMessage?.message || lastMessage ? 8 : 0,
                                        }}
                                    ></h2>
                                    <p style={{width: page.width <= 760 ? page.width - 126 : page.width * 0.315 - 126}}>
                                        {lastMessage?.message ? 
                                            <><Photo style={{width: 19,height: 19}} /> <span style={{width: page.width <= 760 ? page.width - 150 : page.width * 0.315 - 150}}>{lastMessage.message}</span> </>
                                            : lastMessage?.audio ?
                                            <><MicRounded style={{width: 19,height: 19}} /><span style={{width: page.width <= 760 ? page.width - 150 : page.width * 0.315 - 150}}>{lastMessage.time}</span></>
                                            : lastMessage?.message === "" ?
                                            <><Photo style={{width: 19,height: 19}} /> <span style={{width: page.width <= 760 ? page.width - 150 : page.width * 0.315 - 150}}>Photo</span> </>
                                        :lastMessage}
                                    </p>
                                </div>
                                {data?.unreadMessages && pathID !== data.id ?
                                    <div className="sidebar__chat--unreadMessages">
                                        <div>
                                            {data.unreadMessages}
                                        </div>
                                    </div>
                                :null}
                            </div>
                        </Link>);
                    }
                } else {
                    arr.push(null);
                }
            });
            setList(arr)
        }
    }, [dataList, roomsData, page, pathID]);

    useEffect(() => {
        if (page.width <= 760) {
            dispatch({type: "SET_PATH", path: path});
        } else {
            dispatch({type: "SET_PATH", path: ""})
        }
    }, [path, page]);

    return (
        <div ref={sidebarChatContainer} className="sidebar__chat--container">
            <h2 className="animate">{title} </h2>
            {dataList?.length > 0 ? list : dataList === null && title !== "Chats" ?
                <div className="loader__container sidebar__loader">
                    <CircularProgress />
                </div>
                :
                <div className="no-result">
                    <div>
                        <SearchOutlined />
                        <div className="cancel-root">
                            <CancelOutlined />
                        </div>
                    </div>
                    <h2>No {title} found </h2>
                </div>
                
            }
            <div className="loader__container scrollFetch">
                {scrollFetch ? <CircularProgress /> : null}
            </div>
        </div>
    )
}

export default memo(SidebarChat);
