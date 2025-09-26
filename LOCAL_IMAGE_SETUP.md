# Local Image Generation Setup

This guide explains how to set up local image generation for the LLM Testing Interface without requiring API keys.

## Option 1: Automatic WebUI (Recommended)

### Install Automatic1111 WebUI

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   cd stable-diffusion-webui
   ```

2. **Run the installer:**
   ```bash
   ./webui.sh
   ```

3. **Access the WebUI:**
   - Open your browser to `http://localhost:7860`
   - The API will be available at `http://localhost:7860/sdapi/v1/`

4. **Configure the LLM Testing Interface:**
   - Set Image Provider to "Local/Open Source"
   - The interface will automatically connect to the local service

## Option 2: ComfyUI (Advanced)

1. **Install ComfyUI:**
   ```bash
   git clone https://github.com/comfyanonymous/ComfyUI.git
   cd ComfyUI
   pip install -r requirements.txt
   ```

2. **Run ComfyUI:**
   ```bash
   python main.py --listen
   ```

3. **Access ComfyUI:**
   - Open `http://localhost:8188`
   - Set up API endpoints for integration

## Option 3: Demo Mode (No Setup Required)

If you don't want to set up a local service, the application will automatically generate demo images using HTML5 Canvas. These are simple gradient images with your prompt text overlaid.

## Features

### Local Image Generation
- **No API Keys Required**: Completely free to use
- **Privacy**: Images generated locally, no data sent to external services
- **Customizable**: Full control over generation parameters
- **Offline Capable**: Works without internet connection

### Supported Models
- Stable Diffusion 1.5
- Stable Diffusion 2.1
- Stable Diffusion XL
- Custom models and LoRAs

### Configuration Options
- Image size (1024x1024, 1792x1024, 1024x1792)
- Generation steps
- CFG scale
- Sampler selection
- Negative prompts

## Troubleshooting

### Service Not Running
If the local image service isn't running, the application will automatically fall back to demo image generation.

### Port Conflicts
- Automatic1111 WebUI: Change port with `--port 7861`
- ComfyUI: Change port with `--port 8189`

### Memory Issues
- Reduce image size for lower VRAM usage
- Use CPU mode if GPU memory is insufficient
- Enable model offloading

## Performance Tips

1. **GPU Acceleration**: Ensure CUDA/ROCm is properly installed
2. **Model Optimization**: Use quantized models for faster generation
3. **Batch Processing**: Generate multiple images at once
4. **Caching**: Keep frequently used models in memory

## Security Notes

- Local generation keeps all data on your machine
- No external API calls for image generation
- Full control over generated content
- No usage tracking or logging

## Next Steps

1. Choose your preferred setup method
2. Install and configure the service
3. Test image generation in the LLM Testing Interface
4. Customize parameters for your use case
5. Explore different models and styles
