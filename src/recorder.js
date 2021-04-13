import { v4 as uuidv4 } from 'uuid';

export default function record (){
  return new Promise(resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        const start = () => {
          mediaRecorder.start();
        };

        const stop = () => {
          return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
              const audioName = uuidv4();
              const audioFile = new File(audioChunks, audioName, {type: "audio/mpeg"});
              const audioUrl = URL.createObjectURL(audioFile);
              const audio = new Audio(audioUrl);
              const play = () => {
                audio.play();
              };

              resolve({ audioFile, audioUrl, play, audioName });
            });

            mediaRecorder.stop();
          });
        };

        resolve({ start, stop });
      });
  });
};