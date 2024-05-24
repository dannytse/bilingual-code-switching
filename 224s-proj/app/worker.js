import { pipeline, env } from "@xenova/transformers";
import { WaveFile } from 'wavefile';

// Skip local model check
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    // static model = 'zzzdonut/cs224s-ascend-finetuned';
    static model = 'Xenova/whisper-tiny';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the ASR pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let transcriber = await PipelineSingleton.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });

    // Load audio data
    let url = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav'; // replace this later
    let buffer = Buffer.from(await fetch(url).then(x => x.arrayBuffer()))

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
    audioData = audioData[0];
    // Actually perform the classification
    let output = await transcriber(audioData);
    // console.log(output);

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output
    });
});