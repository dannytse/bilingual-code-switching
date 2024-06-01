import AudioPlay from "../AudioPlay";
import Navigation from "../Navbar";

export default function Page() {
    return (
        <main>
            <Navigation />
            <div className="flex min-h-screen flex-col p-6 items-center justify-center">
                <AudioPlay />
            </div>
        </main>
    )
  }