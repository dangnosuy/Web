import asyncio, edge_tts, random

# Danh sách các giọng nói của Microsoft Neural TTS theo quốc gia
VOICES = {
    "United States": [
        "en-US-AriaNeural",   # Female
        "en-US-JessaNeural",  # (khác, không dùng)
        "en-US-GuyNeural"     # Male
    ],
    "United Kingdom": [
        "en-GB-LibbyNeural",  # Female
        "en-GB-RyanNeural"    # Male
    ],
    "Australia": [
        "en-AU-NatashaNeural",  # Female
        "en-AU-WilliamNeural"   # Male
    ],
    "Canada": [
        "en-CA-ClaraNeural",  # Female
        "en-CA-LiamNeural"    # Male
    ],
    "India": [
        "en-IN-NeerjaNeural",   # Female
        "en-IN-PrabhatNeural"   # Male
    ],
    "Germany": [
        "de-DE-KatjaNeural",   # Female
        "de-DE-ConradNeural"   # Male
    ],
    "France": [
        "fr-FR-DeniseNeural",  # Female
        "fr-FR-HenriNeural"    # Male
    ],
    "Spain": [
        "es-ES-ElviraNeural",  # Female
        "es-ES-AlvaroNeural"   # Male
    ],
    "Italy": [
        "it-IT-IsabellaNeural",  # (chỉ có giọng nữ)
    ],
    "Japan": [
        "ja-JP-NanamiNeural",  # (chỉ có giọng nữ)
    ],
    "China": [
        "zh-CN-XiaoxiaoNeural",  # Female
        "zh-CN-YunxiNeural"      # Male (giả sử)
    ],
    "Korea": [
        "ko-KR-SunHiNeural",    # (chỉ có giọng)
    ],
    "Brazil": [
        "pt-BR-AntonioNeural",   # Male
        "pt-BR-FranciscaNeural"  # Female
    ],
    "Vietnam": [
        "vi-VN-HoaiMyNeural",   # Female
        "vi-VN-NamMinhNeural"   # Male
    ]
}

# Nhập văn bản cần chuyển đổi
TEXT = input("Enter text to speech: ")

# Hiển thị danh sách các quốc gia để lựa chọn
print("Choose national:")
print("1. Viet Nam")
print("2. United States")
print("3. Brazil")
print("4. Korea")
print("5. China")
print("6. Japan")
print("7. Italy")
print("8. Spain")
print("9. France")
print("10. United Kingdom")
NATIONAL = input("Enter national voice number: ")

VOICE = ""

if NATIONAL == '1':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    if GENDER == '1':
        VOICE = VOICES["Vietnam"][1]
    else:
        VOICE = VOICES["Vietnam"][0]
elif NATIONAL == '2':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với United States, ta chọn giọng "Guy" cho nam và "Aria" cho nữ
    if GENDER == '1':
        VOICE = VOICES["United States"][2]
    else:
        VOICE = VOICES["United States"][0]
elif NATIONAL == '3':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với Brazil, danh sách sắp xếp: index 0 là giọng nam, index 1 là giọng nữ
    if GENDER == '1':
        VOICE = VOICES["Brazil"][0]
    else:
        VOICE = VOICES["Brazil"][1]
elif NATIONAL == '4':
    # Korea chỉ có 1 giọng, không cần chọn giới tính
    VOICE = VOICES["Korea"][0]
elif NATIONAL == '5':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với China, giả sử: index 0 là giọng nữ, index 1 là giọng nam
    if GENDER == '1':
        VOICE = VOICES["China"][1]
    else:
        VOICE = VOICES["China"][0]
elif NATIONAL == '6':
    # Japan chỉ có 1 giọng
    VOICE = VOICES["Japan"][0]
elif NATIONAL == '7':
    # Italy chỉ có 1 giọng (nữ)
    VOICE = VOICES["Italy"][0]
elif NATIONAL == '8':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với Spain, index 0 là giọng nữ, index 1 là giọng nam
    if GENDER == '1':
        VOICE = VOICES["Spain"][1]
    else:
        VOICE = VOICES["Spain"][0]
elif NATIONAL == '9':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với France, index 0 là giọng nữ, index 1 là giọng nam
    if GENDER == '1':
        VOICE = VOICES["France"][1]
    else:
        VOICE = VOICES["France"][0]
elif NATIONAL == '10':
    GENDER = input("Gender\n1. Male\n2. Female\nChoose Gender: ")
    # Với United Kingdom, index 0 là giọng nữ, index 1 là giọng nam
    if GENDER == '1':
        VOICE = VOICES["United Kingdom"][1]
    else:
        VOICE = VOICES["United Kingdom"][0]
else:
    print("Invalid national selection.")

print("Selected voice:", VOICE)


async def amain() -> None:
    done = False
    while done == False:
        try:
            OUTPUT_FILE = f"{random.randint(1,1000000)}.mp3"
            communicate = edge_tts.Communicate(TEXT, VOICE)
            await communicate.save(OUTPUT_FILE)
            done = True
        except Exception as e:
            print("Trung file!")

loop = asyncio.get_event_loop_policy().get_event_loop()
try:
    loop.run_until_complete(amain())
finally:
    loop.close()