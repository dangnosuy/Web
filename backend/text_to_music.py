import requests

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/musicgen-small"
headers = {"Authorization": "Bearer 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"}

def query(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content

audio_bytes = query({
	"inputs": "A soothing melody featuring a traditional plucked instrument with a distinctive 'tung tung' sound (not a guitar, but an ancient folk instrument), blended with gentle, flowing tunes that evoke the colors and atmosphere of the ocean and water.",
})
# You can access the audio with IPython.display for example
from IPython.display import Audio
Audio(audio_bytes)

with open("output.wav", "wb") as f:
    f.write(audio_bytes)
