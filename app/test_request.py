import requests
import json
import datasets


val_set = datasets.load_dataset("CAiRE/ASCEND", split="validation")
audio_data = list(val_set[1]["audio"]["array"])

url = 'http://127.0.0.1:5000/transcribe'

data = {'audio_data': audio_data}

headers = {'Content-Type': 'application/json'}
response = requests.post(url, headers=headers, data=json.dumps(data))

if response.status_code == 200:
    result = response.json()
    transcription = result['transcription']
    print("Transcription:", transcription)
else:
    print("Error:", response.text)

