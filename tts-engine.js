/* ============================================
   GodAlive — TTS Engine (Qwen3-TTS + Kokoro Fallback)
   ============================================ */

const TTSEngine = {
  // Configuration
  config: {
    // Tier 0 (IMMEDIATE): Edge TTS via local server — FREE, high quality, PT-BR + EN
    edgeTTS: {
      serverUrl: 'http://localhost:8765',
      presets: {
        en: 'jesus_en',  // AndrewMultilingualNeural (Warm, Confident, Authentic)
        pt: 'jesus_pt',  // AntonioNeural (Friendly, Positive)
        es: 'jesus_es',
        fr: 'jesus_fr',
        it: 'jesus_it',
        de: 'jesus_de',
      },
    },
    // Tier 1: Qwen3-TTS via HuggingFace (future — needs HF account)
    qwen: {
      model: 'Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign',
      apiUrl: 'https://router.huggingface.co/hf-inference/models/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign',
      spaceUrl: null, // Will be set when HF Space is deployed
      voiceInstruction: 'A warm, deep male voice with gentle authority and spiritual compassion. Calm and reassuring, like a wise teacher speaking with love and wisdom. Speak slowly and clearly.',
      voiceInstructionPT: 'Uma voz masculina profunda e calorosa com autoridade gentil e compaixão espiritual. Calma e reconfortante, como um professor sábio falando com amor e sabedoria. Fale devagar e claramente.',
    },
    // Fallback: Kokoro-82M via Transformers.js (browser)
    kokoro: {
      model: 'onnx-community/Kokoro-82M-v1.0-ONNX',
      voice: 'am_adam', // warm male voice
      langCode: {
        en: 'a', // American English
        pt: 'p', // Brazilian Portuguese
      },
    },
    // Last resort: Browser Web Speech API
    webSpeech: {
      rate: 0.85,
      pitch: 0.9,
      voicePreference: ['Google UK English Male', 'Daniel', 'Microsoft David'],
    },
    // State
    currentEngine: 'auto', // 'edge' | 'qwen' | 'kokoro' | 'webspeech' | 'auto'
    hfToken: null,
    edgeTTSAvailable: false,
  },

  // Audio context for playback
  audioContext: null,
  isPlaying: false,
  currentSource: null,

  // ---- Initialization ----
  async init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.config.hfToken = localStorage.getItem('godalive_hf_token');
    
    // Check if Edge TTS server is available
    try {
      const edgeUrl = localStorage.getItem('godalive_edge_url') || this.config.edgeTTS.serverUrl;
      const res = await fetch(`${edgeUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        this.config.edgeTTSAvailable = true;
        this.config.edgeTTS.serverUrl = edgeUrl;
        console.log('[TTS] ✅ Edge TTS server detected at', edgeUrl);
      }
    } catch (e) {
      console.log('[TTS] Edge TTS server not available, will use fallbacks');
    }

    console.log('[TTS] Engine initialized. Mode:', this.config.currentEngine);
    return this;
  },

  // ---- Set HuggingFace Token ----
  setHFToken(token) {
    this.config.hfToken = token;
    localStorage.setItem('godalive_hf_token', token);
    console.log('[TTS] HF token set');
  },

  // ---- Set Custom HF Space URL ----
  setSpaceUrl(url) {
    this.config.qwen.spaceUrl = url;
    localStorage.setItem('godalive_hf_space', url);
    console.log('[TTS] HF Space URL set:', url);
  },

  // ---- Detect Language ----
  detectLanguage(text) {
    // Simple heuristic: check for Portuguese characters/words
    const ptPatterns = /[ãõçáéíóúâêîôûà]|você|estou|tenho|como|querido|filho|coração|senhor|deus/i;
    return ptPatterns.test(text) ? 'pt' : 'en';
  },

  // ---- Main Speak Function ----
  async speak(text, options = {}) {
    const lang = options.lang || this.detectLanguage(text);
    const engine = this.config.currentEngine;

    // Stop any current playback
    this.stop();

    console.log(`[TTS] Speaking (${lang}, engine: ${engine}):`, text.substring(0, 50) + '...');

    try {
      if (engine === 'auto' || engine === 'edge') {
        // Try Edge TTS first (FREE, best quality, PT-BR + EN)
        if (this.config.edgeTTSAvailable) {
          const audio = await this.speakEdgeTTS(text, lang);
          if (audio) return this.playAudio(audio);
        }
      }

      if (engine === 'auto' || engine === 'qwen') {
        // Try Qwen3-TTS (HuggingFace)
        const audio = await this.speakQwen(text, lang);
        if (audio) return this.playAudio(audio);
      }

      if (engine === 'auto' || engine === 'kokoro') {
        // Try Kokoro fallback (browser ONNX)
        const audio = await this.speakKokoro(text, lang);
        if (audio) return this.playAudio(audio);
      }

      // Last resort: Web Speech API
      return this.speakWebSpeech(text, lang);

    } catch (err) {
      console.warn('[TTS] All engines failed, falling back to Web Speech:', err);
      return this.speakWebSpeech(text, lang);
    }
  },

  // ---- Edge TTS (FREE Microsoft voices) ----
  async speakEdgeTTS(text, lang = 'en') {
    try {
      const serverUrl = this.config.edgeTTS.serverUrl;
      const preset = this.config.edgeTTS.presets[lang] || 'jesus_en';

      console.log(`[TTS/Edge] Generating (${lang}, preset: ${preset})...`);

      const response = await fetch(`${serverUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, preset }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 100) {
          console.log('[TTS/Edge] ✅ Audio received:', arrayBuffer.byteLength, 'bytes');
          return arrayBuffer;
        }
      }
      console.warn('[TTS/Edge] Response not ok:', response.status);
    } catch (err) {
      console.warn('[TTS/Edge] Failed:', err.message);
    }
    return null;
  },

  // ---- Qwen3-TTS (HuggingFace) ----
  async speakQwen(text, lang = 'en') {
    const spaceUrl = this.config.qwen.spaceUrl || localStorage.getItem('godalive_hf_space');
    const hfToken = this.config.hfToken;

    // Option A: Custom HF Space with Gradio API
    if (spaceUrl) {
      try {
        console.log('[TTS/Qwen] Using HF Space:', spaceUrl);
        const voiceInstruction = lang === 'pt'
          ? this.config.qwen.voiceInstructionPT
          : this.config.qwen.voiceInstruction;

        const response = await fetch(`${spaceUrl}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: [text, voiceInstruction, lang],
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Gradio returns audio as base64 or file path
          if (result.data && result.data[0]) {
            const audioData = result.data[0];
            if (typeof audioData === 'string' && audioData.startsWith('data:audio')) {
              return this.base64ToArrayBuffer(audioData);
            }
            // If it's a file path, fetch it
            const audioResponse = await fetch(`${spaceUrl}/file=${audioData}`);
            return await audioResponse.arrayBuffer();
          }
        }
      } catch (err) {
        console.warn('[TTS/Qwen] Space failed:', err);
      }
    }

    // Option B: HuggingFace Inference API (needs token)
    if (hfToken) {
      try {
        console.log('[TTS/Qwen] Using HF Inference API');
        const response = await fetch(this.config.qwen.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: text,
            parameters: {
              voice_instruction: lang === 'pt'
                ? this.config.qwen.voiceInstructionPT
                : this.config.qwen.voiceInstruction,
            },
          }),
        });

        if (response.ok) {
          return await response.arrayBuffer();
        }
        console.warn('[TTS/Qwen] API response:', response.status);
      } catch (err) {
        console.warn('[TTS/Qwen] Inference API failed:', err);
      }
    }

    return null; // Failed, let fallback handle it
  },

  // ---- Kokoro-82M (Browser ONNX) ----
  async speakKokoro(text, lang = 'en') {
    // Check if Transformers.js is loaded
    if (!window.KokoroTTS) {
      console.log('[TTS/Kokoro] Loading Transformers.js + Kokoro model...');
      try {
        // Dynamic import of Transformers.js
        if (!window.transformers) {
          const module = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3');
          window.transformers = module;
        }

        // Load Kokoro pipeline
        const { pipeline } = window.transformers;
        window.KokoroTTS = await pipeline(
          'text-to-speech',
          'onnx-community/Kokoro-82M-v1.0-ONNX',
        );
        console.log('[TTS/Kokoro] Model loaded successfully!');
      } catch (err) {
        console.warn('[TTS/Kokoro] Failed to load:', err);
        return null;
      }
    }

    try {
      console.log('[TTS/Kokoro] Generating speech...');
      const result = await window.KokoroTTS(text, {
        voice: this.config.kokoro.voice,
        lang: this.config.kokoro.langCode[lang] || 'a',
      });

      if (result && result.audio) {
        // Convert Float32Array to WAV ArrayBuffer
        return this.float32ToWav(result.audio, result.sampling_rate || 24000);
      }
    } catch (err) {
      console.warn('[TTS/Kokoro] Generation failed:', err);
    }

    return null;
  },

  // ---- Web Speech API (Last Resort) ----
  speakWebSpeech(text, lang = 'en') {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn('[TTS/WebSpeech] Not available');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.config.webSpeech.rate;
      utterance.pitch = this.config.webSpeech.pitch;
      utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';

      // Try to find a good voice
      const voices = speechSynthesis.getVoices();
      const preferred = this.config.webSpeech.voicePreference;
      for (const pref of preferred) {
        const voice = voices.find(v => v.name.includes(pref));
        if (voice) {
          utterance.voice = voice;
          break;
        }
      }

      utterance.onend = () => {
        this.isPlaying = false;
        this.onSpeechEnd();
        resolve();
      };
      utterance.onstart = () => {
        this.isPlaying = true;
        this.onSpeechStart();
      };

      this.isPlaying = true;
      this.onSpeechStart();
      speechSynthesis.speak(utterance);
    });
  },

  // ---- Audio Playback ----
  async playAudio(arrayBuffer) {
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
        this.onSpeechEnd();
      };

      this.currentSource = source;
      this.isPlaying = true;
      this.onSpeechStart();
      source.start(0);

    } catch (err) {
      console.error('[TTS] Audio playback failed:', err);
      this.isPlaying = false;
    }
  },

  // ---- Stop Playback ----
  stop() {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch (e) {}
      this.currentSource = null;
    }
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
  },

  // ---- Event Callbacks (override these) ----
  onSpeechStart() {
    // Override: animate avatar, show speaking indicator
    document.body.classList.add('jesus-speaking');
  },

  onSpeechEnd() {
    // Override: stop avatar animation
    document.body.classList.remove('jesus-speaking');
  },

  // ---- Utility: Float32 to WAV ----
  float32ToWav(float32Array, sampleRate) {
    const buffer = new ArrayBuffer(44 + float32Array.length * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + float32Array.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, float32Array.length * 2, true);

    // Convert float32 to int16
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return buffer;
  },

  // ---- Utility: Base64 to ArrayBuffer ----
  base64ToArrayBuffer(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return buffer;
  },

  // ---- Get Engine Status ----
  getStatus() {
    return {
      engine: this.config.currentEngine,
      hasHFToken: !!this.config.hfToken,
      hasSpaceUrl: !!(this.config.qwen.spaceUrl || localStorage.getItem('godalive_hf_space')),
      kokoroLoaded: !!window.KokoroTTS,
      webSpeechAvailable: !!window.speechSynthesis,
      isPlaying: this.isPlaying,
    };
  },
};
