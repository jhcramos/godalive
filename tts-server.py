#!/usr/bin/env python3
"""
GodAlive TTS Server — Edge TTS + Qwen3-TTS
Free, high-quality text-to-speech for the GodAlive app.

Usage:
    python3 tts-server.py [--port 8765]

The server exposes:
    GET  /health          → health check
    GET  /voices          → list available voices
    POST /tts             → generate speech (JSON body)
    GET  /tts?text=...    → generate speech (query params)

Supports CORS for browser access.
"""

import asyncio
import json
import os
import sys
import tempfile
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import subprocess
import threading

# ---- Configuration ----
PORT = int(sys.argv[sys.argv.index('--port') + 1] if '--port' in sys.argv else 8765)
CACHE_DIR = os.path.join(tempfile.gettempdir(), 'godalive-tts-cache')
os.makedirs(CACHE_DIR, exist_ok=True)

# Voice presets optimized for Jesus character
VOICE_PRESETS = {
    'jesus_en': {
        'voice': 'en-US-AndrewMultilingualNeural',
        'rate': '-10%',
        'pitch': '-3Hz',
        'description': 'Warm, confident, authentic male (English)'
    },
    'jesus_pt': {
        'voice': 'pt-BR-AntonioNeural',
        'rate': '-12%',
        'pitch': '-4Hz',
        'description': 'Warm, friendly male (Portuguese BR)'
    },
    'jesus_es': {
        'voice': 'es-MX-JorgeNeural',
        'rate': '-10%',
        'pitch': '-3Hz',
        'description': 'Warm male (Spanish)'
    },
    'jesus_fr': {
        'voice': 'fr-FR-HenriNeural',
        'rate': '-10%',
        'pitch': '-3Hz',
        'description': 'Warm male (French)'
    },
    'jesus_it': {
        'voice': 'it-IT-DiegoNeural',
        'rate': '-10%',
        'pitch': '-3Hz',
        'description': 'Warm male (Italian)'
    },
    'jesus_de': {
        'voice': 'de-DE-ConradNeural',
        'rate': '-10%',
        'pitch': '-3Hz',
        'description': 'Warm male (German)'
    },
}

# Auto-detect language → preset
LANG_MAP = {
    'en': 'jesus_en', 'pt': 'jesus_pt', 'es': 'jesus_es',
    'fr': 'jesus_fr', 'it': 'jesus_it', 'de': 'jesus_de',
}


def detect_language(text):
    """Simple language detection based on character patterns."""
    pt_patterns = ['ã', 'õ', 'ç', 'você', 'estou', 'querido', 'filho', 'coração', 'senhor', 'deus']
    es_patterns = ['ñ', 'está', 'hijo', 'corazón', 'señor', 'dios']
    fr_patterns = ['è', 'ê', 'ë', 'vous', 'je suis', 'mon enfant']
    
    text_lower = text.lower()
    if any(p in text_lower for p in pt_patterns):
        return 'pt'
    if any(p in text_lower for p in es_patterns):
        return 'es'
    if any(p in text_lower for p in fr_patterns):
        return 'fr'
    return 'en'


def generate_tts(text, lang=None, voice_preset=None, rate=None, pitch=None):
    """Generate TTS audio using edge-tts. Returns path to mp3 file."""
    
    if not text or not text.strip():
        return None
    
    # Determine language and preset
    if not lang:
        lang = detect_language(text)
    
    preset_key = voice_preset or LANG_MAP.get(lang, 'jesus_en')
    preset = VOICE_PRESETS.get(preset_key, VOICE_PRESETS['jesus_en'])
    
    # Cache key
    cache_key = hashlib.md5(f"{text}:{preset['voice']}:{preset['rate']}:{preset['pitch']}".encode()).hexdigest()
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
    
    if os.path.exists(cache_path):
        return cache_path
    
    # Generate with edge-tts
    cmd = [
        'edge-tts',
        '--voice', preset['voice'],
        '--rate', rate or preset['rate'],
        '--pitch', pitch or preset['pitch'],
        '--text', text,
        '--write-media', cache_path,
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0 and os.path.exists(cache_path):
            return cache_path
        else:
            print(f"[TTS] Error: {result.stderr}")
            return None
    except Exception as e:
        print(f"[TTS] Exception: {e}")
        return None


class TTSHandler(BaseHTTPRequestHandler):
    """HTTP handler for TTS requests."""
    
    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)
        
        if path == '/health':
            self._json_response({'status': 'ok', 'engine': 'edge-tts', 'presets': list(VOICE_PRESETS.keys())})
        
        elif path == '/voices':
            self._json_response({'voices': VOICE_PRESETS})
        
        elif path == '/tts':
            text = params.get('text', [''])[0]
            lang = params.get('lang', [None])[0]
            preset = params.get('preset', [None])[0]
            
            if not text:
                self._json_response({'error': 'Missing "text" parameter'}, 400)
                return
            
            self._generate_and_respond(text, lang, preset)
        
        else:
            self._json_response({'error': 'Not found'}, 404)
    
    def do_POST(self):
        parsed = urlparse(self.path)
        
        if parsed.path == '/tts':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self._json_response({'error': 'Invalid JSON'}, 400)
                return
            
            text = data.get('text', '')
            lang = data.get('lang')
            preset = data.get('preset')
            
            if not text:
                self._json_response({'error': 'Missing "text" field'}, 400)
                return
            
            self._generate_and_respond(text, lang, preset)
        else:
            self._json_response({'error': 'Not found'}, 404)
    
    def _generate_and_respond(self, text, lang=None, preset=None):
        audio_path = generate_tts(text, lang=lang, voice_preset=preset)
        
        if audio_path and os.path.exists(audio_path):
            self.send_response(200)
            self._cors_headers()
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Length', str(os.path.getsize(audio_path)))
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            
            with open(audio_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self._json_response({'error': 'TTS generation failed'}, 500)
    
    def _json_response(self, data, status=200):
        self.send_response(status)
        self._cors_headers()
        self.send_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    
    def log_message(self, format, *args):
        print(f"[TTS Server] {args[0]}")


def main():
    print(f"✝️ GodAlive TTS Server starting on port {PORT}")
    print(f"   Engine: Edge TTS (Microsoft, free)")
    print(f"   Voices: {len(VOICE_PRESETS)} presets")
    print(f"   Cache: {CACHE_DIR}")
    print(f"   URL: http://localhost:{PORT}")
    print(f"")
    print(f"   Endpoints:")
    print(f"     GET  /health   → health check")
    print(f"     GET  /voices   → list voices")
    print(f"     POST /tts      → generate speech")
    print(f"     GET  /tts?text=...&lang=pt → generate speech")
    print()
    
    server = HTTPServer(('0.0.0.0', PORT), TTSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[TTS Server] Shutting down...")
        server.server_close()


if __name__ == '__main__':
    main()
