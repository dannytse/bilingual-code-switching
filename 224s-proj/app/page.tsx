// @ts-nocheck
'use client'

import React, {useState, useEffect, useRef, useCallback} from "react";
import Button from "./button";

export default function Home() {
  // Model loading
  const [ready, setReady] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  /* establishes modified state, rerenders on every change */
  const [userText, setUserText] = useState("");
  const [recordingState, setRecordingState] = useState(false)
  const [buttonText, setButtonText] = useState("Start Recording")

  const worker: any = useRef(null);
  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./flaskworker.js', import.meta.url), {
        type: 'module'
      });
    }
    
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          // Model file start load: add a new progress item to the list.
          setReady(false);
          setProgressItems(prev => [...prev, e.data]);
          break;

        case 'progress':
        // Model file progress: update one of the progress items.
        setProgressItems(
          prev => prev.map(item => {
            if (item.file === e.data.file) {
              return { ...item, progress: e.data.progress }
            }
            return item;
          })
        );
        break;
        
        case 'done':
          // Model file loaded: remove the progress item from the list.
          setProgressItems(
            prev => prev.filter(item => item.file !== e.data.file)
          );
          break;
        
        case 'ready':
          // Pipeline ready: the worker is ready to accept messages.
          setReady(true);
          break;

        case 'complete':
          // Transcription complete: re-enable the Record button
          setDisabled(false);
          console.log(e.data.output.text)
          const transcription : string = e.data.output;
          setUserText(userText + transcription); // probably best to add an extra space? We'll see
          break;
      }
    }
    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () => worker.current.removeEventListener('message', onMessageReceived);
  });

  const handleAudio = (blob: Blob) => {
    setDisabled(true);
    const url = URL.createObjectURL(blob);
    console.log("URL:", url)
    worker.current.postMessage({
      url
    });
  };

  const record = useCallback(() => {
    if (!recordingState) {
      setRecordingState(true)
      setButtonText("Stop Recording")
      return;
    } else {
      setRecordingState(false)
      setButtonText("Start Recording")
      return;
    }
    }, [recordingState, buttonText, userText]
  )

  return (
    <main>
      <div  className="flex min-h-screen flex-col p-6 items-center justify-center">
      <textarea className="textarea textarea-bordered w-1/2 h-96" placeholder="Click on the button to start dictating." value ={userText} onChange={e => setUserText(e.target.value)}>
      </textarea>
        <div className="p-2">
          <Button onClick={record} disabled={disabled}> 
            {disabled ? 'Transcribing...' : buttonText}
          </Button>
        </div>
      </div>
    </main>
  );
}
