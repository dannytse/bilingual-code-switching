'use client'

import React, {useState, useCallback} from "react";
import Button from "./button";

export default function Home() {
  /* establishes modified state, rerenders on every change */
  const [userText, setUserText] = useState("");
  const [recordingState, setRecordingState] = useState(false)
  const [buttonText, setButtonText] = useState("Start Recording")

  const record = useCallback(() => {
    if (!recordingState) {
      setRecordingState(true)
      setButtonText("Stop Recording")
      return;
    } else {
      setRecordingState(false)
      setButtonText("Start Recording")
      setUserText(userText + "Button was pressed (in the future this is transcribed text)! ")
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
          <Button onClick={record}> 
            {buttonText}
          </Button>
        </div>
      </div>
    </main>
  );
}
