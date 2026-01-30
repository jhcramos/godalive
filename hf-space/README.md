---
title: GodAlive TTS
emoji: ✝️
colorFrom: indigo
colorTo: yellow
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: apache-2.0
---

# ✝️ GodAlive TTS Engine

Open-source Text-to-Speech engine for [GodAlive](https://godalive.com) — an AI spiritual companion.

## Models
- **Primary:** Qwen3-TTS-12Hz-0.6B-CustomVoice (10 languages, voice design)
- **Fallback:** Kokoro-82M (lightweight, browser-compatible)

## API Usage
```python
import requests

response = requests.post(
    "https://YOUR-SPACE.hf.space/api/predict",
    json={"data": ["Peace be with you", "A warm male voice", "en"]}
)
```

## Languages
English, Portuguese, Spanish, French, Italian, German, Japanese, Korean, Russian, Chinese
