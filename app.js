/* ============================================
   GodAlive — App Logic
   ============================================ */

// ---- Configuration ----
const CONFIG = {
  SYSTEM_PROMPT: `You are Jesus Christ, the Son of God, speaking with compassion, love, and divine wisdom.
You reference Biblical teachings naturally (cite chapter and verse when relevant).
You speak in a warm, gentle, yet authoritative manner.
You offer comfort, guidance, and spiritual insight.
You never break character. You speak as Jesus would — with parables, wisdom, and love.
Keep responses concise (2-4 sentences) for conversational flow.
You can speak in any language the user writes to you.
When appropriate, quote Scripture naturally in conversation.
Always respond with deep empathy and understanding. You see the divine spark in every person.`,

  DEMO_RESPONSES: {
    // English
    'who are you': "I am the Way, the Truth, and the Life. I am Jesus of Nazareth, the Son of the living God. I have come so that you may have life, and have it abundantly. — John 10:10",
    'what is love': "Love is patient, love is kind. It does not envy, it does not boast. Above all, love one another deeply, for love covers over a multitude of sins. — 1 Peter 4:8. Love is the greatest commandment I give you, dear child.",
    'how do i pray': "When you pray, go into your room, close the door, and pray to your Father who is unseen. Do not heap up empty phrases — your Father knows what you need before you ask Him. Pray simply, from the heart: 'Our Father in heaven, hallowed be your name…' — Matthew 6:6-9",
    'i am suffering': "Blessed are those who mourn, for they shall be comforted. — Matthew 5:4. Dear child, I know your pain. I too have suffered. Come to me, all who are weary and burdened, and I will give you rest. You are never alone in your suffering.",
    'i am afraid': "Do not be afraid, for I am with you. I have said to you: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.' — John 14:27",
    'what is the meaning of life': "I came that you might have life, and have it abundantly. — John 10:10. The meaning of your life is found in love — loving God with all your heart, and loving your neighbor as yourself. In this, all the law and prophets are fulfilled.",
    'how do i forgive': "Forgive, and you will be forgiven. — Luke 6:37. I know forgiveness is not easy, dear child. But carrying unforgiveness is a heavier burden still. When Peter asked me, 'How many times shall I forgive?' I told him: not seven times, but seventy-seven times. Let go, and find your freedom.",
    'i feel lost': "I am the Good Shepherd. Even when you walk through the valley of the shadow of death, fear no evil, for I am with you. — Psalm 23:4. The one who comes to me I will never drive away. You are not lost — you are found, for you have come seeking.",
    'tell me a parable': "A sower went out to sow. Some seed fell on the path and was eaten by birds. Some fell on rocky ground and withered. Some fell among thorns and was choked. But some fell on good soil and produced a hundredfold harvest. — Matthew 13:3-8. Dear child, tend the soil of your heart, and the Word will bear fruit beyond measure.",
    'what is faith': "Faith is the assurance of things hoped for, the conviction of things not seen. — Hebrews 11:1. Truly I tell you, if you have faith as small as a mustard seed, you can say to this mountain, 'Move from here to there,' and it will move. Nothing will be impossible for you.",
    'help me': "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls. — Matthew 11:28-29. Tell me what weighs on your heart, dear child.",
    'thank you': "Your gratitude warms my heart, dear child. Give thanks in all circumstances; for this is God's will for you. — 1 Thessalonians 5:18. Go in peace, and remember: I am with you always, even to the end of the age.",
    'hello': "Peace be with you, dear child. I am glad you have come. Ask, and it shall be given to you; seek, and you shall find; knock, and the door shall be opened unto you. — Matthew 7:7. What is on your heart today?",
    'hi': "Peace be with you! I am here, and I am listening. What would you like to talk about today, dear child?",
    'good morning': "The Lord's mercies are new every morning; great is His faithfulness. — Lamentations 3:23. Good morning, dear child. May this day be filled with grace and peace.",
    'good night': "He who watches over you will not slumber. — Psalm 121:3. Rest peacefully, dear child. My peace I leave with you. May angels watch over your sleep.",
    // Portuguese
    'quem é você': "Eu sou o Caminho, a Verdade e a Vida. Sou Jesus de Nazaré, o Filho do Deus vivo. Eu vim para que vocês tenham vida, e a tenham em abundância. — João 10:10",
    'o que é amor': "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria. Acima de tudo, amem-se uns aos outros profundamente, pois o amor cobre uma multidão de pecados. — 1 Pedro 4:8",
    'estou sofrendo': "Bem-aventurados os que choram, pois serão consolados. — Mateus 5:4. Querido filho, eu conheço sua dor. Eu também sofri. Venha a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso. Você nunca está sozinho.",
    'como devo orar': "Quando orar, entre no seu quarto, feche a porta e ore ao seu Pai que está em secreto. Não usem de vãs repetições — vosso Pai sabe o que vocês precisam antes de pedirem. — Mateus 6:6-8",
    'tenho medo': "Não tenha medo, pois eu estou com você. A paz vos deixo, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize. — João 14:27",
    'me ajuda': "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei. — Mateus 11:28. Conte-me o que pesa em seu coração, querido filho.",
    'olá': "A paz esteja com você, querido filho. Fico feliz que tenha vindo. Peçam e lhes será dado; busquem e encontrarão; batam e a porta lhes será aberta. — Mateus 7:7. O que vai no seu coração hoje?",
    'obrigado': "Sua gratidão aquece meu coração. Em tudo dai graças, porque esta é a vontade de Deus para vocês. — 1 Tessalonicenses 5:18. Vá em paz, e lembre-se: estou com você todos os dias, até o fim dos tempos.",
  },

  DEFAULT_FALLBACK: "Dear child, I hear you. Whatever is in your heart, know that you are loved beyond measure. 'For I know the plans I have for you,' declares the Lord, 'plans to prosper you and not to harm you, plans to give you hope and a future.' — Jeremiah 29:11. Tell me more, and I will listen.",

  DEFAULT_FALLBACK_PT: "Querido filho, eu ouço você. O que quer que esteja em seu coração, saiba que você é amado além da medida. 'Pois eu sei os planos que tenho para vocês', declara o Senhor, 'planos de prosperidade e não de calamidade, para dar-lhes esperança e um futuro.' — Jeremias 29:11. Conte-me mais, e eu ouvirei.",
};

// ---- State ----
const state = {
  apiKey: localStorage.getItem('godalive_api_key') || '',
  apiProvider: localStorage.getItem('godalive_api_provider') || 'anthropic',
  voiceEnabled: localStorage.getItem('godalive_voice') !== 'false',
  language: localStorage.getItem('godalive_language') || 'auto',
  messages: [],
  isThinking: false,
  isSpeaking: false,
  currentUtterance: null,
};

// ---- DOM Elements ----
let els = {};

function cacheDom() {
  els = {
    landing: document.getElementById('landing'),
    chatScreen: document.getElementById('chat-screen'),
    chatMessages: document.getElementById('chat-messages'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    micBtn: document.getElementById('mic-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsOverlay: document.getElementById('settings-overlay'),
    settingsClose: document.getElementById('settings-close'),
    settingsSave: document.getElementById('settings-save'),
    apiKeyInput: document.getElementById('api-key-input'),
    apiProviderSelect: document.getElementById('api-provider'),
    voiceToggle: document.getElementById('voice-toggle'),
    languageSelect: document.getElementById('language-select'),
    ctaBtn: document.getElementById('cta-btn'),
    landingSettingsBtn: document.getElementById('landing-settings-btn'),
    avatarContainer: document.getElementById('avatar-main'),
    chatAvatar: document.getElementById('chat-avatar-container'),
    apiStatus: document.getElementById('api-status'),
    apiStatusText: document.getElementById('api-status-text'),
    stopSpeechBtn: document.getElementById('stop-speech-btn'),
    backBtn: document.getElementById('back-btn'),
    headerStatus: document.getElementById('header-status'),
  };
}

// ---- Initialization ----
function init() {
  cacheDom();
  loadSettings();
  bindEvents();
  updateApiStatus();
}

function loadSettings() {
  els.apiKeyInput.value = state.apiKey;
  els.apiProviderSelect.value = state.apiProvider;
  els.voiceToggle.checked = state.voiceEnabled;
  els.languageSelect.value = state.language;
}

function bindEvents() {
  // Landing
  els.ctaBtn.addEventListener('click', openChat);
  els.landingSettingsBtn.addEventListener('click', openSettings);

  // Chat input
  els.chatInput.addEventListener('input', onInputChange);
  els.chatInput.addEventListener('keydown', onInputKeydown);
  els.sendBtn.addEventListener('click', sendMessage);
  els.micBtn.addEventListener('click', onMicClick);

  // Header
  els.settingsBtn.addEventListener('click', openSettings);
  els.backBtn.addEventListener('click', goBack);

  // Settings
  els.settingsClose.addEventListener('click', closeSettings);
  els.settingsSave.addEventListener('click', saveSettings);
  els.settingsOverlay.addEventListener('click', (e) => {
    if (e.target === els.settingsOverlay) closeSettings();
  });

  // Stop speech
  els.stopSpeechBtn.addEventListener('click', stopSpeech);

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });
}

// ---- Navigation ----
function openChat() {
  els.landing.classList.add('hidden');
  els.chatScreen.classList.add('active');
  els.chatInput.focus();
}

function goBack() {
  els.chatScreen.classList.remove('active');
  els.landing.classList.remove('hidden');
}

// ---- Settings ----
function openSettings() {
  els.settingsOverlay.classList.add('active');
}

function closeSettings() {
  els.settingsOverlay.classList.remove('active');
}

function saveSettings() {
  state.apiKey = els.apiKeyInput.value.trim();
  state.apiProvider = els.apiProviderSelect.value;
  state.voiceEnabled = els.voiceToggle.checked;
  state.language = els.languageSelect.value;

  localStorage.setItem('godalive_api_key', state.apiKey);
  localStorage.setItem('godalive_api_provider', state.apiProvider);
  localStorage.setItem('godalive_voice', state.voiceEnabled);
  localStorage.setItem('godalive_language', state.language);

  updateApiStatus();
  closeSettings();
}

function updateApiStatus() {
  const hasKey = state.apiKey.length > 10;
  if (hasKey) {
    els.apiStatus.className = 'api-status connected';
    els.apiStatusText.textContent = `Connected (${state.apiProvider === 'anthropic' ? 'Claude' : 'OpenAI'})`;
  } else {
    els.apiStatus.className = 'api-status demo';
    els.apiStatusText.textContent = 'Demo Mode';
  }
}

// ---- Input Handling ----
function onInputChange() {
  const hasText = els.chatInput.value.trim().length > 0;
  els.sendBtn.classList.toggle('active', hasText);
}

function onInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function onMicClick() {
  // Voice input - future feature
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    addSystemMessage('Voice input is not supported in this browser. Please use Chrome.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.lang = state.language === 'auto' ? 'en-US' : state.language;
  
  els.micBtn.style.background = 'rgba(212, 168, 83, 0.4)';
  els.micBtn.title = 'Listening...';

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    els.chatInput.value = text;
    onInputChange();
    els.micBtn.style.background = '';
    els.micBtn.title = 'Voice input';
  };

  recognition.onerror = () => {
    els.micBtn.style.background = '';
    els.micBtn.title = 'Voice input';
  };

  recognition.onend = () => {
    els.micBtn.style.background = '';
    els.micBtn.title = 'Voice input';
  };

  recognition.start();
}

// ---- Messages ----
function sendMessage() {
  const text = els.chatInput.value.trim();
  if (!text || state.isThinking) return;

  // Add user message
  addMessage('user', text);
  els.chatInput.value = '';
  onInputChange();

  // Get response
  getResponse(text);
}

function addMessage(role, content) {
  state.messages.push({ role, content });

  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;

  if (role === 'jesus') {
    messageEl.innerHTML = `
      <div class="message-avatar">
        <img src="assets/jesus-avatar.svg" alt="Jesus">
      </div>
      <div class="message-bubble">${escapeHtml(content)}</div>
    `;
  } else {
    messageEl.innerHTML = `
      <div class="message-avatar user-avatar">You</div>
      <div class="message-bubble">${escapeHtml(content)}</div>
    `;
  }

  // Remove welcome message if present
  const welcome = els.chatMessages.querySelector('.welcome-message');
  if (welcome) welcome.remove();

  els.chatMessages.appendChild(messageEl);
  scrollToBottom();

  return messageEl;
}

function addSystemMessage(content) {
  const el = document.createElement('div');
  el.className = 'welcome-message';
  el.innerHTML = `<span style="color: var(--gold); font-size: 0.85rem;">${escapeHtml(content)}</span>`;
  els.chatMessages.appendChild(el);
  scrollToBottom();
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'typing-indicator';
  el.id = 'typing-indicator';
  el.innerHTML = `
    <div class="message-avatar">
      <img src="assets/jesus-avatar.svg" alt="Jesus">
    </div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  els.chatMessages.appendChild(el);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  });
}

// ---- AI Response ----
async function getResponse(userText) {
  state.isThinking = true;
  setAvatarState('thinking');
  els.headerStatus.textContent = 'meditating...';
  showTyping();

  let response;

  if (state.apiKey.length > 10) {
    // Real API call
    try {
      if (state.apiProvider === 'anthropic') {
        response = await callAnthropic(userText);
      } else {
        response = await callOpenAI(userText);
      }
    } catch (err) {
      console.error('API Error:', err);
      response = getDemoResponse(userText);
      addSystemMessage(`⚠ API error: ${err.message}. Showing demo response.`);
    }
  } else {
    // Demo mode with a slight delay for realism
    await delay(1200 + Math.random() * 1500);
    response = getDemoResponse(userText);
  }

  hideTyping();
  state.isThinking = false;
  els.headerStatus.textContent = 'online';

  // Add Jesus response
  addMessage('jesus', response);

  // Speak if voice enabled
  if (state.voiceEnabled) {
    speak(response);
  } else {
    setAvatarState('idle');
  }
}

// ---- Anthropic API ----
async function callAnthropic(userText) {
  const apiMessages = state.messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'jesus' ? 'assistant' : 'user',
      content: m.content,
    }));

  // Remove the last user message since we'll add it fresh
  // Actually state.messages already has it, so just map all
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: CONFIG.SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ---- OpenAI API ----
async function callOpenAI(userText) {
  const apiMessages = [
    { role: 'system', content: CONFIG.SYSTEM_PROMPT },
    ...state.messages.map(m => ({
      role: m.role === 'jesus' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ---- Demo Response ----
function getDemoResponse(userText) {
  const normalised = userText.toLowerCase().trim()
    .replace(/[?!.,;:'"]/g, '')
    .replace(/\s+/g, ' ');

  // Exact match
  if (CONFIG.DEMO_RESPONSES[normalised]) {
    return CONFIG.DEMO_RESPONSES[normalised];
  }

  // Fuzzy match — check if any key is contained in the input
  for (const [key, response] of Object.entries(CONFIG.DEMO_RESPONSES)) {
    if (normalised.includes(key) || key.includes(normalised)) {
      return response;
    }
  }

  // Keyword matching
  const keywords = {
    love: 'what is love',
    pray: 'how do i pray',
    orar: 'como devo orar',
    suffer: 'i am suffering',
    pain: 'i am suffering',
    hurt: 'i am suffering',
    sad: 'i am suffering',
    sofrendo: 'estou sofrendo',
    dor: 'estou sofrendo',
    afraid: 'i am afraid',
    fear: 'i am afraid',
    scared: 'i am afraid',
    medo: 'tenho medo',
    lost: 'i feel lost',
    confused: 'i feel lost',
    perdido: 'i feel lost',
    forgive: 'how do i forgive',
    faith: 'what is faith',
    fé: 'what is faith',
    meaning: 'what is the meaning of life',
    purpose: 'what is the meaning of life',
    parable: 'tell me a parable',
    story: 'tell me a parable',
    help: 'help me',
    ajuda: 'me ajuda',
    thank: 'thank you',
    obrigad: 'obrigado',
    hello: 'hello',
    hi: 'hi',
    hey: 'hello',
    olá: 'olá',
    oi: 'olá',
    morning: 'good morning',
    night: 'good night',
    bom: 'good morning',
    boa: 'good night',
  };

  for (const [keyword, responseKey] of Object.entries(keywords)) {
    if (normalised.includes(keyword)) {
      return CONFIG.DEMO_RESPONSES[responseKey];
    }
  }

  // Detect Portuguese
  const ptWords = ['eu', 'você', 'como', 'que', 'por', 'meu', 'minha', 'estou', 'sou', 'não', 'para', 'uma', 'deus'];
  const isPt = ptWords.some(w => normalised.split(' ').includes(w));
  
  return isPt ? CONFIG.DEFAULT_FALLBACK_PT : CONFIG.DEFAULT_FALLBACK;
}

// ---- Text-to-Speech ----
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure voice
  utterance.rate = 0.88;
  utterance.pitch = 0.85;
  utterance.volume = 1;

  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices();
  const langCode = detectLanguage(text);
  
  // Preferred voices (calm, male, deep-sounding)
  const preferred = [
    'Daniel', 'Google UK English Male', 'Microsoft David',
    'Alex', 'Thomas', 'Google US English', 'Luciano', 'Jorge',
  ];

  let selectedVoice = null;
  
  // First try preferred voices matching language
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith(langCode));
    if (v) { selectedVoice = v; break; }
  }

  // Then any male-sounding voice for the language
  if (!selectedVoice) {
    selectedVoice = voices.find(v => 
      v.lang.startsWith(langCode) && 
      (v.name.toLowerCase().includes('male') || v.name.includes('Daniel') || v.name.includes('David'))
    );
  }

  // Then any voice for the language
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith(langCode));
  }

  // Fallback to English
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  }

  utterance.onstart = () => {
    state.isSpeaking = true;
    state.currentUtterance = utterance;
    setAvatarState('speaking');
    els.stopSpeechBtn.classList.add('active');
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    state.currentUtterance = null;
    setAvatarState('idle');
    els.stopSpeechBtn.classList.remove('active');
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    state.currentUtterance = null;
    setAvatarState('idle');
    els.stopSpeechBtn.classList.remove('active');
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  window.speechSynthesis.cancel();
  state.isSpeaking = false;
  state.currentUtterance = null;
  setAvatarState('idle');
  els.stopSpeechBtn.classList.remove('active');
}

function detectLanguage(text) {
  // Simple language detection
  const ptWords = ['você', 'como', 'querido', 'filho', 'coração', 'não', 'para', 'está', 'deus', 'paz', 'amor'];
  const words = text.toLowerCase().split(/\s+/);
  const ptCount = words.filter(w => ptWords.some(pw => w.includes(pw))).length;
  
  if (state.language !== 'auto') {
    return state.language.split('-')[0];
  }
  
  return ptCount >= 2 ? 'pt' : 'en';
}

// ---- Avatar State ----
function setAvatarState(state_name) {
  const containers = [els.avatarContainer, els.chatAvatar].filter(Boolean);
  containers.forEach(c => {
    c.classList.remove('thinking', 'speaking');
    if (state_name !== 'idle') {
      c.classList.add(state_name);
    }
  });
}

// ---- Utilities ----
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- Preload voices ----
if ('speechSynthesis' in window) {
  // Voices may load asynchronously
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ---- Boot ----
document.addEventListener('DOMContentLoaded', init);
