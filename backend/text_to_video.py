import requests

generation_id = "1d175ee7411768cc8948d79074b53822"

response = requests.request(
    "GET",
    f"https://api.stability.ai/v2beta/image-to-video/result/{generation_id}",
    headers={
        'accept': "video/*",  # Use 'application/json' to receive base64 encoded JSON
        'authorization': f"Bearer sk-JOHSxcRe8TXFHLkBDjuZzLKo8aQqbo6JLcI7Qx1H01WTLCGh"
    },
)

if response.status_code == 202:
    print("Generation in-progress, try again in 10 seconds.")
elif response.status_code == 200:
    print("Generation complete!")
    with open("video.mp4", 'wb') as file:
        file.write(response.content)
else:
    raise Exception(str(response.json()))