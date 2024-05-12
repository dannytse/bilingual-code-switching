import React from "react";

export default function Home() {
  return (
    <main>
      <div  className="flex min-h-screen flex-col p-6 items-center justify-center">
      <textarea className="textarea textarea-bordered w-1/2 h-96" placeholder="Click on the button to start dictating.">
        {/* Text here eventually. */}
      </textarea>
        <div className="p-2">
          <button className="btn btn-primary">Dictate</button>
        </div>
      </div>
    </main>
  );
}
