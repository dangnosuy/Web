from huggingface_hub import InferenceClient

client = InferenceClient(
	provider="hf-inference",
	api_key="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"
)

# output is a PIL.Image object
image = client.text_to_image(
	"Volodymyr Oleksandrovych Zelenskyy and Putin hug each other to make peace",
	model="black-forest-labs/FLUX.1-dev"
)
filename = "output_2.png"
image.save(filename, format="PNG")
print("Ảnh đã được lưu với tên:", filename)

# các model ngon
# black-forest-labs/FLUX.1-dev
# stabilityai/stable-diffusion-xl-base-1.0
