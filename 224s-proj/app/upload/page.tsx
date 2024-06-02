// @ts-nocheck
'use client'

import React, {useState, useEffect, useRef, useCallback} from "react";
import Navigation from "../Navbar";
import Button from "../button";

var a;
export default function Page() {
    const [userText, setUserText] = useState("");
    const [buttonName, setButtonName] = useState("Play");
    const [audio, setAudio] = useState();
    const [url, setUrl] = useState("");
    const [disabled, setDisabled] = useState(false);
  
    const worker = useRef(null);
  
    useEffect(() => {
      if (!worker.current) {
        // Create the worker if it does not yet exist.
        worker.current = new Worker(new URL('../flaskworker.js', import.meta.url), {
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
            const transcription = e.data.output;
            setUserText(userText + transcription); // probably best to add an extra space? We'll see
            break;
        }
      }
      // Attach the callback function as an event listener.
      worker.current.addEventListener('message', onMessageReceived);
  
      // Define a cleanup function for when the component is unmounted.
      return () => worker.current.removeEventListener('message', onMessageReceived);
    });
  
    useEffect(() => {
      if (a) {
        a.pause();
        a = null;
        setButtonName("Play");
      }
      if (audio) {
        a = new Audio(audio);
        a.onended = () => {
          setButtonName("Play");
        };
      }
    }, [audio]);
  
    const handleClick = () => {
      setDisabled(true);
      worker.current.postMessage({
          url
      });
    };
  
    const addFile = (e) => {
      if (e.target.files[0]) {
          let thisUrl = URL.createObjectURL(e.target.files[0])
          setUrl(thisUrl)
          setAudio(URL.createObjectURL(e.target.files[0]));
      }
    };

    return (
        <main>
            <Navigation />
            <div className="flex min-h-screen flex-col p-6 
            items-center justify-center">
            <textarea className="textarea textarea-bordered w-1/2 h-96" placeholder="Upload a .wav file to start the transcription process." value ={userText} onChange={e => setUserText(e.target.value)}>
            </textarea>
                <div className="p-2">
                    <div className="flex items-center flex-col space-y-2">
                        <div>
                            <input type="file" className="file-input file-input-bordered file-input-primary w-full max-w-xs" onChange={addFile} />
                        </div>
                        <div>
                            <Button onClick={handleClick} disabled={disabled}>
                                {disabled ? 'Transcribing...' : "Transcribe"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
  }