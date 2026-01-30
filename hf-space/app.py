"""
GodAlive TTS — HuggingFace Space
Qwen3-TTS Voice Generation API for GodAlive

Deploy this as a HuggingFace Space (Gradio) with GPU.
It exposes an API endpoint that the GodAlive frontend can call.
"""

import gradio as gr
import numpy as np
import tempfile
import os

# ---- Model Loading ----
print("🔄 Loading Qwen3-TTS model...")

try:
    from qwen_tts import QwenTTS
    
    # Load the VoiceDesign model (can create voices from descriptions)
    tts = QwenTTS(model_name="Qwen3-TTS-12Hz-0.6B-CustomVoice")  # Use 0.6B for free GPU tier
    MODEL_LOADED = True
    print("✅ Qwen3-TTS loaded successfully!")
except ImportError:
    print("⚠️ qwen-tts not available, trying Kokoro fallback...")
    try:
        from kokoro import KPipeline
        import soundfile as sf
        
        # Load Kokoro as fallback
        kokoro_pipelines = {}
        MODEL_LOADED = "kokoro"
        print("✅ Kokoro-82M loaded as fallback!")
    except ImportError:
        print("❌ No TTS model available")
        MODEL_LOADED = False


# ---- Default Voice Descriptions ----
VOICE_PRESETS = {
    "jesus_en": "A warm, deep male voice with gentle authority and spiritual compassion. Calm and reassuring, like a wise teacher speaking with love and wisdom. Speak slowly and clearly with a peaceful tone.",
    "jesus_pt": "Uma voz masculina profunda e calorosa com autoridade gentil e compaixão espiritual. Calma e reconfortante, como um professor sábio falando com amor e sabedoria. Fale devagar e claramente com tom pacífico.",
    "narrator": "A calm, clear male narrator voice with warmth and gravitas.",
}


def generate_speech(text: str, voice_instruction: str = "", language: str = "en"):
    """Generate speech from text using the loaded TTS model."""
    
    if not text or not text.strip():
        return None
    
    # Default voice instruction
    if not voice_instruction:
        voice_instruction = VOICE_PRESETS.get(f"jesus_{language}", VOICE_PRESETS["jesus_en"])
    
    try:
        if MODEL_LOADED == True:
            # Qwen3-TTS
            audio_data = tts.generate(
                text=text,
                voice_instruction=voice_instruction,
                language=language,
            )
            
            # Save to temp file
            tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            sf.write(tmp.name, audio_data["audio"], audio_data["sample_rate"])
            return tmp.name
            
        elif MODEL_LOADED == "kokoro":
            # Kokoro fallback
            lang_map = {"en": "a", "pt": "p", "es": "e", "fr": "f", "it": "i"}
            lang_code = lang_map.get(language, "a")
            
            if lang_code not in kokoro_pipelines:
                kokoro_pipelines[lang_code] = KPipeline(lang_code=lang_code)
            
            pipeline = kokoro_pipelines[lang_code]
            
            # Generate audio
            all_audio = []
            for _, _, audio in pipeline(text, voice="am_adam"):
                all_audio.append(audio)
            
            if all_audio:
                import numpy as np
                full_audio = np.concatenate(all_audio)
                tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
                sf.write(tmp.name, full_audio, 24000)
                return tmp.name
        
        return None
        
    except Exception as e:
        print(f"❌ TTS Error: {e}")
        return None


# ---- Gradio Interface ----
with gr.Blocks(
    title="GodAlive TTS",
    theme=gr.themes.Soft(),
) as demo:
    gr.Markdown("""
    # ✝️ GodAlive TTS Engine
    *Generate spiritual voice audio for GodAlive*
    
    Powered by Qwen3-TTS (open source) with Kokoro-82M fallback.
    """)
    
    with gr.Row():
        with gr.Column(scale=2):
            text_input = gr.Textbox(
                label="Text to speak",
                placeholder="Peace be with you, dear child...",
                lines=4,
            )
            voice_input = gr.Textbox(
                label="Voice instruction (optional)",
                placeholder="A warm, deep male voice with gentle authority...",
                lines=2,
            )
            lang_input = gr.Dropdown(
                choices=["en", "pt", "es", "fr", "it", "de", "ja", "ko", "ru", "zh"],
                value="en",
                label="Language",
            )
            generate_btn = gr.Button("🎙️ Generate Voice", variant="primary")
        
        with gr.Column(scale=1):
            audio_output = gr.Audio(label="Generated Audio", type="filepath")
            status = gr.Textbox(label="Status", interactive=False)
    
    # Presets
    gr.Markdown("### Quick Presets")
    with gr.Row():
        preset_jesus_en = gr.Button("✝️ Jesus (EN)")
        preset_jesus_pt = gr.Button("✝️ Jesus (PT)")
    
    def apply_preset(preset_name):
        presets = {
            "jesus_en": ("Peace be with you, dear child. I am the Way, the Truth, and the Life.", VOICE_PRESETS["jesus_en"], "en"),
            "jesus_pt": ("A paz esteja com você, querido filho. Eu sou o Caminho, a Verdade e a Vida.", VOICE_PRESETS["jesus_pt"], "pt"),
        }
        return presets.get(preset_name, ("", "", "en"))
    
    preset_jesus_en.click(
        lambda: apply_preset("jesus_en"),
        outputs=[text_input, voice_input, lang_input],
    )
    preset_jesus_pt.click(
        lambda: apply_preset("jesus_pt"),
        outputs=[text_input, voice_input, lang_input],
    )
    
    def generate_and_status(text, voice, lang):
        audio = generate_speech(text, voice, lang)
        if audio:
            return audio, f"✅ Generated ({language_names.get(lang, lang)})"
        return None, "❌ Generation failed"
    
    language_names = {
        "en": "English", "pt": "Portuguese", "es": "Spanish",
        "fr": "French", "it": "Italian", "de": "German",
        "ja": "Japanese", "ko": "Korean", "ru": "Russian", "zh": "Chinese",
    }
    
    generate_btn.click(
        generate_and_status,
        inputs=[text_input, voice_input, lang_input],
        outputs=[audio_output, status],
    )


# ---- API Endpoint (for GodAlive frontend) ----
# The Gradio app automatically exposes /api/predict
# Frontend calls: POST /api/predict with {data: [text, voice_instruction, language]}

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
    )
