import { WaveFile } from 'wavefile';

async function sendRequest(audioData) {
    let body = JSON.stringify({
        'audio_data': audioData
    })
    let response = await fetch('http://127.0.0.1:5000/transcribe', {
        method: "POST",
        body: JSON.stringify({
            'audio_data': audioData
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    console.log(response)
    console.log(response.status)
    if (response.status == 200) {
        console.log("STATUS CODE:", response.status)
        let result = await response.json()
        console.log(result)
        let output = result['transcription']
        let eng_translation = result['eng_translation']
        let chi_translation = result['chi_translation']
        console.log(output)

        self.postMessage({
            status: 'complete',
            output: output,
            eng_translation: eng_translation,
            chi_translation: chi_translation
        });
    } else {
        console.log("STATUS CODE:", response.status)
        console.log('Error:', response.text)
    }
}

self.addEventListener('message', async (event) => {
    // Load audio data
    // let url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav'; // replace this later
    let url = event.data.url
    let buffer = Buffer.from(await fetch(url).then(x => x.arrayBuffer()))
    console.log(buffer)
    // Read .wav file and convert it to required format
    let wav = new WaveFile(buffer);
    wav.toBitDepth('32f'); // Pipeline expects input as a Float32Array
    wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
        if (audioData.length > 1) {
            const SCALING_FACTOR = Math.sqrt(2);

            // Merge channels (into first channel to save memory)
            for (let i = 0; i < audioData[0].length; ++i) {
            audioData[0][i] = SCALING_FACTOR * (audioData[0][i] + audioData[1][i]) / 2;
            }
        }
    }
    // Select first channel
    audioData = Array.from(audioData[0]);
    // let audioData = Array.from(buffer);
    console.log(audioData)
    sendRequest(audioData);
});