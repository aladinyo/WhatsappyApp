import { useState, useEffect, memo, useRef } from 'react';
import Sidebar from './Sidebar';
import Chat from './Chat';
import Login from './Login';
import setOnlineStatus from "./setOnlineStatus";
import { Route, useLocation, Redirect } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import CircularProgress from '@material-ui/core/CircularProgress';
import db, { loadFirebase, auth, provider, createTimestamp, messaging } from './firebase';
import { TransitionGroup, Transition, CSSTransition } from "react-transition-group";
import './App.css';
import useRoomsData from './useRoomsData';
import scalePage from "./scalePage";

const configureNotif = (docID) => {
  messaging.requestPermission()
    .then(() => {
      //console.log('permission granted');
      return messaging.getToken();
    })
    .then((token) => {
      //console.log(token);
      db.collection("users").doc(docID).set({
        token: token
      }, { merge: true })
    })
    .catch(e => {
      //console.log(e.message);
      db.collection("users").doc(docID).set({
        token: ""
      }, { merge: true });
    });
  messaging.onMessage(payload => {
    //console.log(payload.data);
  })
}

function App() {
  const [{ user, path, pathID, roomsData, page }, dispatch, actionTypes] = useStateValue();
  const [loader, setLoader] = useState(true);
  const [pwaEvent, setPwaEvent] = useState(undefined);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checkingVersion, setCheckingVerison] = useState(true);
  const [chats, setChats] = useState(null);
  const [chatsFetched, setChatsFetched] = useState();
  const location = useLocation();
  const [setRoomsData] = useRoomsData();
  const b = useRef([]);
  const menus = ["/rooms", "/search", "/users", "/chats"];

  useEffect(() => {
    function r() {
      auth.onAuthStateChanged(authUser => {
        //console.log("user change: ", authUser)
        if (authUser) {
          if ("serviceWorker" in navigator && "PushManager" in window) {
            //console.log("This browser supports notifications and service workers")
            configureNotif(authUser.uid);
          } else {
            //console.log("This browser does not support notifications and service workers")
          }
          //console.log(authUser);
          db.collection("version").doc("version").get().then(doc => {
            const version = doc.data().version;
            const previousVersion = localStorage.getItem("version");
            if (previousVersion) {
              //console.log("previous version exists in local storage")
              if (version !== +previousVersion) {
                //console.log("new version is not equal to previous version")
                localStorage.setItem("version", version);
                setUpdating(true);
                auth.signOut();
                auth.signInWithRedirect(provider).catch(e => alert(e.message))
              } else {
                setCheckingVerison(false)
              }
            } else {
              //console.log("previous version doesn't exists in local storage")
              localStorage.setItem("version", version);
              setCheckingVerison(false)
            }
          }).then(() => {
            //console.log("checking version has finished");
            dispatch({ type: actionTypes.SET_USER, user: authUser });
            const ref = db.collection("users").doc(authUser.uid);
            ref.get().then(doc => {
              const data = doc.data();
              if (data) {
                if (data.timestamp) {
                  //console.log("updating user")
                  return ref.set({
                    name: authUser.displayName,
                    photoURL: authUser.photoURL,
                  }, { merge: true })
                }
              }
              //console.log("setting user")
              return ref.set({
                name: authUser.displayName,
                photoURL: authUser.photoURL,
                timestamp: createTimestamp(),
              }, { merge: true })
            }).then(() => loader ? setLoader(false) : null)
          })
        } else {
          dispatch({ type: actionTypes.SET_USER, user: null });
          //console.log(user);
          if (loader) setLoader(false);
          db.collection("version").doc("version").get().then(doc => {
            const version = doc.data().version;
            const previousVersion = localStorage.getItem("version");
            if (previousVersion) {
              //console.log("previous version exists in local storage")
              if (version !== +previousVersion) {
                //console.log("new version is not equal to previous version")
                localStorage.setItem("version", version);
                if (user) {
                  auth.signInWithRedirect(provider).catch(e => alert(e.message))
                } else {
                  setCheckingVerison(false)
                }
              } else {
                setCheckingVerison(false)
              }
            } else {
              //console.log("previous version doesn't exists in local storage")
              localStorage.setItem("version", version);
              setCheckingVerison(false)
            }
          })
        }
      })
    }
    loadFirebase(setFirebaseLoaded);
    if (firebaseLoaded) r();
  }, [user, firebaseLoaded])

  useEffect(() => {
	  window.addEventListener('beforeinstallprompt', (e) => {
	    // Prevent the mini-infobar from appearing on mobile
      //console.log("pwa event executed");
	    e.preventDefault();
	    // Stash the event so it can be triggered later.
	    setPwaEvent(e);
	    // Update UI notify the user they can install the PWA
	  });
    window.addEventListener("resize", () => {
      dispatch({type: "set_scale_page", page: scalePage()});
    })
  }, []);

  useEffect(() => {
    if (user && !checkingVersion){
      db.collection("users").doc(user.uid).collection("chats").orderBy("timestamp", "desc").onSnapshot({ includeMetadataChanges: true }, snap => {
          if (snap.docs?.length > 0) {
            snap.docChanges().forEach(change => {
              if (change.type === "added") {
                setRoomsData(change.doc.data().userID, change.doc.id);
              };
            });
            if (!snap.metadata.fromCache || (!window.navigator.onLine && snap.metadata.fromCache)) {
              setChats(snap.docs.map(cur => ({
                ...cur.data(),
                id: cur.id
              })));
            };
          } else {
            setChats([]);
          };
      });
    };
  }, [user, checkingVersion]);

  useEffect(() => {
    if (chats?.length > 0) {
      if (chats.every(cur => roomsData[cur.id]?.lastMessage)) {
        setChatsFetched(true);
      };
    } else if (chats?.length === 0) {
      setChatsFetched(true);      
    }
  }, [chats, roomsData]);

  useEffect(() => {
    var s;
    if (user && !checkingVersion) {
      setOnlineStatus(user.uid);
    }
    return () => {
      if (s) {
        s();
      };
    };
  }, [user, checkingVersion]);

  useEffect(() => {
    var id = location.pathname.replace("/room/", "");
    menus.forEach(cur => id = id.replace(cur, ""))
    dispatch({type: "set_path_id", id});
  }, [location.pathname]);

  return (
    <div className="app" style={{...page}} >
      {page.width <= 760 ?
        <Redirect to="/chats" />
      : <Redirect to="/" />}
      {(loader && chats === null) || checkingVersion ?
        <div className="loader__container">
          <CircularProgress />
        </div>
        : !user && !checkingVersion && !updating?
          <Login />
          : !checkingVersion && !updating && chatsFetched ?
          <div className="app__body">
            <Sidebar chats={chats} pwa={pwaEvent} />
            <TransitionGroup component={null} >
              {page.width <= 760 ?
                <Transition
                  key={location.pathname.replace("/image", "")}
                  timeout={260}
                >
                  {state => (
                    <Route location={location} path={`${path}/room/:roomID`}>
                      <Chat
                        b={b}
                        unreadMessages={chats?.length > 0 ? chats.find(cur => cur.id === pathID)?.unreadMessages : 0}
                        animState={state}
                      /> 
                    </Route>
                  )}
                </Transition>
              :
                <CSSTransition
                  key={location.pathname.replace("/image", "")}
                  timeout={1010}
                  classNames="page"
                >
                  {state => (
                    <Route location={location} path={`${path}/room/:roomID`}>
                      <Chat
                        b={b}
                        unreadMessages={chats?.length > 0 ? chats.find(cur => cur.id === pathID)?.unreadMessages : 0}
                        animState={state}
                      /> 
                    </Route>
                  )}
                </CSSTransition>
              }
            </TransitionGroup>
          </div> : 
          <div className="loader__container">
            <CircularProgress />
          </div>
      }
    </div>
  );
}

export default memo(App);