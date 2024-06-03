from flask import Flask, request, jsonify, make_response
from transformers import pipeline
import numpy as np
from openai import OpenAI
import json

app = Flask(__name__)

transcriber = pipeline(model="zzzdonut/cs224s-ascend-finetune-3")
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

            try:
                client = OpenAI()

                response = client.chat.completions.create(
                    model="gpt-4o",
                    response_format={ "type": "json_object" },
                    messages=[
                        {"role": "system", "content": "You are a helpful translater designed to output JSON."},
                        {"role": "user", "content": f"""Translate the following text to both English and Chinese:
                         {transcription}

                        Use the following format:
                        English: <english translation>
                        Chinese: <chinese translation>
                         """}
                    ]
                )
                print(response)
                eng_translation = json.loads(response.choices[0].message.content)["English"].strip()
                chi_translation = json.loads(response.choices[0].message.content)["Chinese"].strip()

            except Exception as e:
                print(e)
                eng_translation = str(e)
                chi_translation = str(e)

            response = make_response(jsonify({
                "transcription": transcription['text'], 
                "eng_translation": eng_translation,
                "chi_translation": chi_translation
                }))
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

