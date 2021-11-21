# WhatsappyApp
WhatsappyApp is a whatsapp clone progressive web application built with react nodejs and firebase
it allows you to send messages talk with people and serach for them and many more.  
# WARNING 
this app is just an open source project and it doesn't have the feature of deleting your account also you will sign in with your google account so use a fake one you are responsible of giving your data.

# Live Demo
Search for "alaa eddine" and talk with me.  
https://whatsappy-app.web.app/  ALLOW NOTIFICATIONS !!!  
the app may not run because free limits of firebase or hosting service has been exceeded !!  

# Preview
  <img src="https://github.com/aladinyo/WhatsappyApp/blob/main/preview1.png" width="600">
  <img src="https://github.com/aladinyo/WhatsappyApp/blob/main/preview2.png" width="600">
  <img src="https://github.com/aladinyo/WhatsappyApp/blob/main/preview3.png" width="600">

# Features of the app
* Messaging users in real time.
* You can text messages.
* You can send Images.
* You can send an audio message.
* You click on an image sent in a chat and it will smoothly animate to the center so you can see it.
* You can see if the user is typing or recording.
* You can record an audio and send it.
* You can delete the conversation.
* You can search for users.
* You can see the online status of users.
* You can see the unread messages.
* You will have a seen at the bottom if the user saw your message.
* You have an arrow button that allows you to scroll down the chat you also see the unread messages in it.
* You can fetch 30 messages in a chat and if you scroll up you will fetch more messages.
* The audio slider is grey when you send an audio message and is green when you receive one and becomes blue if the receiver plays the audio.
* The audio player allows you to see the full time of the audio and if you play it you will see the current time.
* You can receive notifications if a user sent you a message.
* A sound is played when you send a message or receive one in a conversation.
* Another sound is played if you receive a message from another user.
* The app works offline you can use it without internet and you can send text messages only when you come back online they will be automatically sent.
* Finally you can click on the arrow down button at the home page and the web app is installed in your device.

# Development
In order to run the app setup a firebase project then navigate to "src/firebase" and put your config object there and then go to your project settings in firebase then get a service account file from there and go put it on "backend" folder.
Then setup an algolia search project then put your keys in "backend/index.js" and "src/Sidebar.js".
# Running the app
After setting up the project in the root folder run "npm run start" to run the frontend and then navigate to "backend" folder and run "npm run index.js" to run the backend.
# building the app
To build the app run in the root folder "npm run build" you get the production code of your frontend in the build folder you can use it to host the app (you can set up firebase hosting for that) also you can host the backend folder in a node js hosting platform like heroku just make sure that your hosting service will run a worker (npm run index.js).

## Thank you so much for checking this project don't forget to put a star to encourage us.
