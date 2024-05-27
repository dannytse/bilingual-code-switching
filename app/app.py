from flask import Flask, request, jsonify
from transformers import pipeline
import numpy as np

app = Flask(__name__)

transcriber = pipeline(model="zzzdonut/cs224s-ascend-finetuned")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        data = request.json.get('audio_data')
        if data is None:
            return jsonify({"error": "No audio data provided"}), 400

        audio_np = np.array(data, dtype=np.float32)

        transcription = transcriber(audio_np)
        print(transcription)
        return jsonify({"transcription": transcription['text']})

    except Exception as e:
       print(e)
       return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

