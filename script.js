// Elementos DOM
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const sourceLangSelect = document.getElementById('sourceLangSelect');
const targetLangSelect = document.getElementById('targetLangSelect');
const detectedLang = document.getElementById('detectedLang');
const detectedLangText = document.getElementById('detectedLangText');
const translationPath = document.getElementById('translationPath');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const speakSourceBtn = document.getElementById('speakSourceBtn');
const swapBtn = document.getElementById('swapBtn');
// REMOVIDO: const translateBtn = document.getElementById('translateBtn');
const charCount = document.getElementById('charCount');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Estado da aplicação
let isTranslating = false;
let currentTranslation = null;
let autoTranslateTimeout = null;
let lastTranslatedText = '';
let lastSourceLang = '';
let lastTargetLang = '';

// Controle de áudio
let isPlayingAudio = false;
let currentUtterance = null;

// Configurações de tradução automática
const AUTO_TRANSLATE_DELAY = 1500; // 1.5 segundos de delay
const MIN_TEXT_LENGTH = 3; // Mínimo de caracteres para traduzir

// Mapeamento de idiomas para nomes
const LANGUAGE_NAMES = {
    'en': 'Inglês',
    'pt': 'Português', 
    'es': 'Espanhol',
    'fr': 'Francês',
    'de': 'Alemão',
    'it': 'Italiano'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeEventListeners();
    updateUI();
    updateCharCount();
    sourceText.focus();
    loadState();
    
    // Forçar atualização inicial da UI
    setTimeout(() => {
        console.log('Forcing initial UI update...');
        updateUI();
    }, 100);
    
    console.log('Sistema de tradução multilíngue inicializado');
});

// Event Listeners
function initializeEventListeners() {
    // Texto de origem
    sourceText.addEventListener('input', handleSourceTextChange);
    sourceText.addEventListener('paste', handlePaste);
    sourceText.addEventListener('keydown', handleKeyDown);
    
    // Seletores de idioma
    sourceLangSelect.addEventListener('change', handleLanguageChange);
    targetLangSelect.addEventListener('change', handleLanguageChange);
    
    // Botões de controle
    clearBtn.addEventListener('click', handleClear);
    copyBtn.addEventListener('click', handleCopy);
    speakBtn.addEventListener('click', () => handleSpeak(currentTranslation?.text, lastTargetLang));
    speakSourceBtn.addEventListener('click', () => handleSpeak(sourceText.value, getSourceLanguage()));
    swapBtn.addEventListener('click', handleSwap);
    // REMOVIDO: translateBtn.addEventListener('click', handleTranslate);
    
    // Fechar mensagens de erro
    errorMessage.addEventListener('click', hideError);
}

// Manipuladores de eventos
// Manipulação de texto de origem com tradução automática
function handleSourceTextChangeWithAutoTranslate() {
    const text = sourceText.value.trim();
    
    // Mostrar indicador de digitação
    if (text.length > 0) {
        typingIndicator.classList.add('active');
        autoTranslateIndicator.classList.add('active');
    } else {
        typingIndicator.classList.remove('active');
        autoTranslateIndicator.classList.remove('active');
    }
    
    // Limpar timeout anterior
    if (autoTranslateTimeout) {
        clearTimeout(autoTranslateTimeout);
        autoTranslateTimeout = null;
    }
    
    // Atualizar UI imediatamente
    updateUI();
    
    // Se o texto está vazio, limpar tradução
    if (!text) {
        targetText.value = '';
        currentTranslation = '';
        lastTranslatedText = '';
        typingIndicator.classList.remove('active');
        autoTranslateIndicator.classList.remove('active');
        return;
    }
    
    // Se o texto é muito curto, não traduzir
    if (text.length < MIN_TEXT_LENGTH) {
        return;
    }
    
    // Se o texto não mudou significativamente, não traduzir novamente
    if (text === lastTranslatedText) {
        typingIndicator.classList.remove('active');
        return;
    }
    
    // Configurar novo timeout para tradução automática
    autoTranslateTimeout = setTimeout(() => {
        if (sourceText.value.trim() === text && !isTranslating) {
            typingIndicator.classList.remove('active');
            performTranslation(text);
        }
    }, AUTO_TRANSLATE_DELAY);
}

function handleSourceTextChange() {
    updateCharCount();
    updateUI();
    
    // Limpar tradução anterior se o texto mudou significativamente
    const currentText = sourceText.value.trim();
    if (Math.abs(currentText.length - lastTranslatedText.length) > 10) {
        clearTranslation();
    }
    
    // Configurar tradução automática
    if (autoTranslateTimeout) {
        clearTimeout(autoTranslateTimeout);
    }
    
    if (currentText.length >= MIN_TEXT_LENGTH) {
        autoTranslateTimeout = setTimeout(() => {
            if (!isTranslating && currentText !== lastTranslatedText) {
                handleTranslate();
            }
        }, AUTO_TRANSLATE_DELAY);
    }
}

function handleLanguageChange() {
    // Limpar tradução quando idiomas mudarem
    clearTranslation();
    hideDetectedLanguage();
    updateUI();
    
    // Traduzir automaticamente se há texto
    const text = sourceText.value.trim();
    if (text.length >= MIN_TEXT_LENGTH) {
        setTimeout(() => handleTranslate(), 500);
    }
}

function getSourceLanguage() {
    return sourceLangSelect.value === 'auto' ? (lastSourceLang || 'en') : sourceLangSelect.value;
}

function updateCharCount() {
    const count = sourceText.value.length;
    charCount.textContent = count;
    
    // Mudar cor se próximo do limite
    if (count > 4500) {
        charCount.style.color = '#ea4335';
    } else if (count > 4000) {
        charCount.style.color = '#fbbc04';
    } else {
        charCount.style.color = '#9aa0a6';
    }
}

function handlePaste(event) {
    // Permitir paste normal, mas limpar tradução
    setTimeout(() => {
        clearTranslation();
        updateCharCount();
        updateUI();
    }, 10);
}

function handleKeyDown(event) {
    // Ctrl+Enter para traduzir
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleTranslate();
    }
}

async function handleTranslate() {
    const text = sourceText.value.trim();
    if (!text) return;
    
    await performTranslation(text);
}

async function performTranslation(text) {
    if (!text.trim() || isTranslating) return;
    
    isTranslating = true;
    lastTranslatedText = text;
    
    setTranslating(true);
    hideError();
    hideDetectedLanguage();
    
    try {
        const sourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;
        
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text.trim(),
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Armazenar informações da tradução
        currentTranslation = {
            source: text.trim(),
            text: data.translation,
            timestamp: Date.now()
        };
        
        lastSourceLang = data.detected_language || sourceLang;
        lastTargetLang = targetLang;
        
        // Mostrar idioma detectado se foi detecção automática
        if (sourceLang === 'auto' && data.detected_language) {
            showDetectedLanguage(data.detected_language);
        }
        
        displayTranslation(data.translation, text);
        
    } catch (error) {
        console.error('Erro na tradução:', error);
        showError(getErrorMessage(error));
    } finally {
        setTranslating(false);
    }
}

function handleClear() {
    sourceText.value = '';
    clearTranslation();
    sourceText.focus();
    updateCharCount();
}

function handleCopy() {
    if (currentTranslation?.text) {
        navigator.clipboard.writeText(currentTranslation.text).then(() => {
            // Feedback visual
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1000);
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            showError('Erro ao copiar texto');
        });
    }
}

function handleSpeak(text, lang) {
    if (!text || !('speechSynthesis' in window)) return;
    
    // Parar qualquer fala anterior
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    speechSynthesis.speak(utterance);
}

function handleSpeakSource() {
    const text = sourceText.value.trim();
    
    if (!text || !('speechSynthesis' in window)) {
        return;
    }

    // Se já está reproduzindo, parar a reprodução atual
    if (isPlayingAudio) {
        stopCurrentAudio();
        return;
    }

    // Parar qualquer fala em andamento
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Controle de estado
    isPlayingAudio = true;
    currentUtterance = utterance;
    
    // Feedback visual durante a fala
    speakSourceBtn.style.color = '#4285f4';
    speakSourceBtn.title = 'Parar áudio';
    
    utterance.onend = () => {
        resetAudioState();
    };
    
    utterance.onerror = () => {
        resetAudioState();
        showError('Erro ao reproduzir áudio');
    };

    speechSynthesis.speak(utterance);
}

function stopCurrentAudio() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    resetAudioState();
}

function resetAudioState() {
    isPlayingAudio = false;
    currentUtterance = null;
    
    // Resetar feedback visual dos botões
    speakBtn.style.color = '';
    speakBtn.title = 'Ouvir tradução';
    speakSourceBtn.style.color = '';
    speakSourceBtn.title = 'Ouvir texto em inglês';
}

function handleSwap() {
    if (!currentTranslation || sourceLangSelect.value === 'auto') return;
    
    // Trocar textos
    const sourceValue = sourceText.value;
    const targetValue = targetText.value;
    
    sourceText.value = targetValue;
    targetText.value = sourceValue;
    
    // Trocar idiomas
    const sourceLang = sourceLangSelect.value;
    const targetLang = targetLangSelect.value;
    
    sourceLangSelect.value = targetLang;
    targetLangSelect.value = sourceLang;
    
    // Limpar estado
    currentTranslation = null;
    hideDetectedLanguage();
    updateCharCount();
    updateUI();
    
    // Traduzir automaticamente se há texto
    if (sourceText.value.trim()) {
        setTimeout(() => handleTranslate(), 500);
    }
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter para traduzir
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!isTranslating && sourceText.value.trim()) {
            handleTranslate();
        }
    }
    
    // Ctrl/Cmd + K para limpar
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        handleClear();
    }
    
    // Ctrl/Cmd + C quando o foco está na tradução
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
        document.activeElement === targetText) {
        event.preventDefault();
        handleCopy();
    }
}

// Funções auxiliares
function updateUI() {
    const hasSourceText = sourceText.value.trim().length > 0;
    const hasTranslation = currentTranslation && currentTranslation.text;
    
    // Debug: verificar se os elementos existem
    console.log('updateUI called:', { hasSourceText, hasTranslation });
    console.log('Elements found:', {
        clearBtn: !!clearBtn,
        copyBtn: !!copyBtn,
        speakBtn: !!speakBtn,
        speakSourceBtn: !!speakSourceBtn,
        swapBtn: !!swapBtn,
        // REMOVIDO translateBtn
    });
    
    // Atualizar visibilidade dos botões - usar 'inline-flex' em vez de 'flex'
    if (clearBtn) {
        clearBtn.style.display = hasSourceText ? 'inline-flex' : 'none';
        console.log('clearBtn display:', clearBtn.style.display);
    }
    if (copyBtn) {
        copyBtn.style.display = hasTranslation ? 'inline-flex' : 'none';
        console.log('copyBtn display:', copyBtn.style.display);
    }
    if (speakBtn) {
        speakBtn.style.display = hasTranslation ? 'inline-flex' : 'none';
        console.log('speakBtn display:', speakBtn.style.display);
    }
    if (speakSourceBtn) {
        speakSourceBtn.style.display = hasSourceText ? 'inline-flex' : 'none';
        console.log('speakSourceBtn display:', speakSourceBtn.style.display);
    }
    if (swapBtn) {
        swapBtn.style.display = hasTranslation ? 'inline-flex' : 'none';
        console.log('swapBtn display:', swapBtn.style.display);
    }
    
    // REMOVIDO: lógica de translateBtn
    
    // Atualizar placeholder da caixa de tradução
    if (targetText) {
        if (hasTranslation) {
            targetText.removeAttribute('data-placeholder');
        } else {
            targetText.setAttribute('data-placeholder', 'A tradução aparecerá aqui...');
        }
    }
    
    // Atualizar indicadores
    if (loadingIndicator) {
        loadingIndicator.style.display = isTranslating ? 'block' : 'none';
    }
    
    // Auto-resize do textarea
    if (sourceText) {
        autoResize(sourceText);
    }
}

function setTranslating(translating) {
    isTranslating = translating;
    
    if (translating) {
        loadingIndicator.classList.remove('hidden');
        // Desabilitar botões durante tradução
        clearBtn.disabled = true;
        copyBtn.disabled = true;
        speakBtn.disabled = true;
        speakSourceBtn.disabled = true;
    } else {
        loadingIndicator.classList.add('hidden');
        // Reabilitar botões após tradução
        clearBtn.disabled = false;
        copyBtn.disabled = false;
        speakBtn.disabled = false;
        speakSourceBtn.disabled = false;
    }
    
    updateUI();
}

function displayTranslation(translation, sourceTextValue) {
    currentTranslation = {
        text: translation,
        source: sourceTextValue
    };
    
    // Garantir que a tradução seja exibida corretamente no div de destino
    if (targetText) {
        targetText.textContent = translation;
        // Remover o placeholder quando há conteúdo
        targetText.removeAttribute('data-placeholder');
    }
    
    updateUI();
}

function clearTranslation() {
    currentTranslation = '';
    if (targetText) {
        targetText.textContent = '';
        // Restaurar o placeholder quando não há conteúdo
        targetText.setAttribute('data-placeholder', 'A tradução aparecerá aqui...');
    }
    hideDetectedLanguage();
    updateUI();
}

function showDetectedLanguage(langCode) {
    // Verificar se langCode é uma string válida
    const safeLanguageCode = typeof langCode === 'string' ? langCode : String(langCode || 'unknown');
    const langName = LANGUAGE_NAMES[safeLanguageCode] || safeLanguageCode.toUpperCase();
    detectedLangText.textContent = `Detectado: ${langName}`;
    detectedLang.style.display = 'block';
    
    // Atualizar caminho de tradução
    const targetLangName = LANGUAGE_NAMES[targetLangSelect.value] || targetLangSelect.value.toUpperCase();
    translationPath.textContent = `${langName} → ${targetLangName}`;
    translationPath.style.display = 'block';
}

function hideDetectedLanguage() {
    detectedLang.style.display = 'none';
    translationPath.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function getErrorMessage(error) {
    if (error.message.includes('Failed to fetch')) {
        return 'Erro de conexão. Verifique se o servidor está rodando.';
    } else if (error.message.includes('HTTP')) {
        return 'Erro no servidor. Tente novamente em alguns instantes.';
    } else if (error.message.includes('timeout')) {
        return 'Tempo limite excedido. Tente novamente.';
    } else {
        return error.message || 'Erro desconhecido. Tente novamente.';
    }
}

// Funcionalidades adicionais
function detectLanguage(text) {
    // Detecção simples baseada em caracteres comuns
    const englishPattern = /^[a-zA-Z0-9\s.,!?;:'"()\-]+$/;
    const portuguesePattern = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/;
    
    if (portuguesePattern.test(text)) {
        return 'pt';
    } else if (englishPattern.test(text)) {
        return 'en';
    } else {
        return 'unknown';
    }
}

// Auto-resize do textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
}

// Aplicar auto-resize ao textarea de origem
sourceText.addEventListener('input', function() {
    autoResize(this);
});

// Funcionalidade de arrastar e soltar
sourceText.addEventListener('dragover', function(event) {
    event.preventDefault();
    this.style.borderColor = '#4285f4';
});

sourceText.addEventListener('dragleave', function(event) {
    event.preventDefault();
    this.style.borderColor = '';
});

sourceText.addEventListener('drop', function(event) {
    event.preventDefault();
    this.style.borderColor = '';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function(e) {
                sourceText.value = e.target.result;
                handleSourceTextChange();
            };
            reader.readAsText(file);
        } else {
            showError('Apenas arquivos de texto são suportados');
        }
    }
});

// Salvar estado no localStorage
function saveState() {
    const state = {
        sourceText: sourceText.value,
        translation: currentTranslation
    };
    localStorage.setItem('translatorState', JSON.stringify(state));
}

function loadState() {
    try {
        const saved = localStorage.getItem('translatorState');
        if (saved) {
            const state = JSON.parse(saved);
            if (state.sourceText) {
                sourceText.value = state.sourceText;
                handleSourceTextChange();
            }
            if (state.translation) {
                currentTranslation = state.translation;
                targetText.textContent = state.translation.text;
                updateUI();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar estado salvo:', error);
    }
}

// Salvar estado periodicamente
setInterval(saveState, 5000);

// Carregar estado ao inicializar
window.addEventListener('load', loadState);

// Salvar estado antes de sair
window.addEventListener('beforeunload', saveState);