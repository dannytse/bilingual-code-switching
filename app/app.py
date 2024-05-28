from flask import Flask, request, jsonify, make_response
from transformers import pipeline
import numpy as np

app = Flask(__name__)

transcriber = pipeline(model="zzzdonut/cs224s-ascend-finetuned")
# transcriber = pipeline(model="openai/whisper-tiny")

@app.route('/transcribe', methods=['POST', 'OPTIONS'])
def transcribe_audio():
    if request.method == 'POST':
        try:
            data = request.json.get('audio_data')
            if data is None:
                return jsonify({"error": "No audio data provided"}), 400

            audio_np = np.array(data, dtype=np.float32)

            transcription = transcriber(audio_np)
            print(transcription)
            response = make_response(jsonify({"transcription": transcription['text']}))
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'POST,PATCH,OPTIONS'
            return response


        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 500
        
    elif request.method == 'OPTIONS':
        try:
            response = make_response(jsonify({"message": 'okie-dokie'}))
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'POST,PATCH,OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'content-type'
            return response
        except Exception as e:
            print(e)
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

