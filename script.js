// Global variables
let currentTranslation = '';
let translationTimeout = null;

// DOM elements
const inputTextarea = document.getElementById('inputText');
const outputContent = document.getElementById('outputContent');
const sourceLanguageSelect = document.getElementById('sourceLanguage');
const targetLanguageSelect = document.getElementById('targetLanguage');
const copyBtn = document.getElementById('copyBtn');
const speakBtn = document.getElementById('speakBtn');
const charCountSpan = document.getElementById('charCount');
// Removed detectedLanguageSpan as it's no longer in HTML

// Initialize the application
function initializeApp() {
    // Auto-clear fields on page load/refresh
    clearAllFields();
    
    // Set up event listeners
    inputTextarea.addEventListener('input', handleInput);
    inputTextarea.addEventListener('keydown', handleKeyDown);
    targetLanguageSelect.addEventListener('change', handleLanguageChange);
    sourceLanguageSelect.addEventListener('change', handleLanguageChange);
    copyBtn.addEventListener('click', copyToClipboard);
    speakBtn.addEventListener('click', speakText);

    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    // Set up auto-clear on page visibility change (browser close/reopen)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up auto-clear on beforeunload (page refresh/close)
    window.addEventListener('beforeunload', clearAllFields);

    // Initialize UI
    clearOutput();
    updateCharCount();
}

// Handle visibility change (browser tab switch, minimize, etc.)
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        // Clear fields when page becomes visible again
        clearAllFields();
    }
}

// Clear all fields and reset state
function clearAllFields() {
    inputTextarea.value = '';
    currentTranslation = '';
    clearOutput();
    updateCharCount();
    
    // Reset language selectors to default
    sourceLanguageSelect.value = 'auto';
    targetLanguageSelect.value = 'pt';
    
    // Clear any pending timeouts
    if (translationTimeout) {
        clearTimeout(translationTimeout);
        translationTimeout = null;
    }
}

// Update character count
function updateCharCount() {
    const count = inputTextarea.value.length;
    charCountSpan.textContent = `${count}/5000`;
    
    if (count > 4500) {
        charCountSpan.className = 'text-red-500 font-medium';
    } else if (count > 4000) {
        charCountSpan.className = 'text-yellow-600 font-medium';
    } else {
        charCountSpan.className = 'text-gray-500';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle input changes
function handleInput() {
    updateCharCount();
    
    // Clear previous timeout
    if (translationTimeout) {
        clearTimeout(translationTimeout);
    }
    
    const text = inputTextarea.value.trim();
    
    if (text.length === 0) {
        clearOutput();
        return;
    }
    
    // Auto-translate after 1 second of no typing
    translationTimeout = setTimeout(() => {
        if (text.length > 0) {
            translateText();
        }
    }, 1000);
}

// Handle keydown events
function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        translateText();
    }
}

// Handle language change
function handleLanguageChange() {
    const text = inputTextarea.value.trim();
    if (text.length > 0) {
        translateText();
    }
}

// Handle global keyboard shortcuts
function handleGlobalKeyDown(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case 'k':
                event.preventDefault();
                inputTextarea.focus();
                break;
            case 'c':
                // Only allow copy if user is not selecting text in input area
                if (event.target !== inputTextarea && !window.getSelection().toString() && currentTranslation) {
                    event.preventDefault();
                    copyToClipboard();
                }
                break;
        }
    }
}

// Show error message
function showError(message) {
    outputContent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full py-12 text-red-500">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <p class="font-medium">${message}</p>
        </div>
    `;
}



// Clear function for keyboard shortcut
function clearAll() {
    inputTextarea.value = '';
    updateCharCount();
    clearOutput();
    inputTextarea.focus();
}

// Main translation function
async function translateText() {
    const text = inputTextarea.value.trim();
    if (!text) return;
    
    showLoading();
    
    try {
        const sourceLang = sourceLanguageSelect.value;
        const targetLang = targetLanguageSelect.value;
        
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLang,
                target_lang: targetLang
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentTranslation = data.translation;
            
            // Display translation with animation
            const translationContainer = document.createElement('div');
            translationContainer.className = 'opacity-0 translate-y-2 transition-all duration-500';
            translationContainer.innerHTML = `
                <div class="text-google-text text-lg leading-relaxed whitespace-pre-wrap p-4">${escapeHtml(data.translation)}</div>
            `;
            
            outputContent.innerHTML = '';
            outputContent.className = 'min-h-80 bg-google-bg border border-google-border rounded-lg';
            outputContent.appendChild(translationContainer);
            
            // Trigger animation
            setTimeout(() => {
                translationContainer.classList.remove('opacity-0', 'translate-y-2');
                translationContainer.classList.add('opacity-100', 'translate-y-0');
            }, 50);
            
            // Language detection removed from UI
            
            // Enable buttons with animation
            copyBtn.disabled = false;
            speakBtn.disabled = false;
            copyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            speakBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            copyBtn.classList.add('transition-all', 'duration-200', 'hover:scale-105');
            speakBtn.classList.add('transition-all', 'duration-200', 'hover:scale-105');
            
        } else {
            showError(data.error || 'Erro na tradução');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showError('Erro de conexão. Verifique sua internet.');
    }
}

// Remove duplicate functions - using the main translation display logic above

// Show loading state
function showLoading() {
    outputContent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-google-accent mb-4"></div>
            <p class="text-google-text font-medium">Traduzindo...</p>
        </div>
    `;
}

function clearOutput() {
    outputContent.innerHTML = `
        <div class="text-center">
            <i class="fas fa-comments text-4xl text-google-muted mb-4"></i>
            <p>A tradução aparecerá aqui...</p>
        </div>
    `;
    copyBtn.disabled = true;
    speakBtn.disabled = true;
    copyBtn.classList.add('opacity-50', 'cursor-not-allowed');
    speakBtn.classList.add('opacity-50', 'cursor-not-allowed');
    copyBtn.classList.remove('transition-all', 'duration-200', 'hover:scale-105');
    speakBtn.classList.remove('transition-all', 'duration-200', 'hover:scale-105');
    currentTranslation = '';
}

// Button actions
function copyToClipboard() {
    if (!currentTranslation) return;
    
    navigator.clipboard.writeText(currentTranslation).then(() => {
        showToast('Texto copiado para a área de transferência!', 'success');
        
        // Visual feedback with Google colors
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        copyBtn.classList.add('bg-green-600', 'scale-95');
        copyBtn.classList.remove('bg-google-surface', 'hover:bg-google-hover');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('bg-green-600', 'scale-95');
            copyBtn.classList.add('bg-google-surface', 'hover:bg-google-hover');
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar:', err);
        showToast('Erro ao copiar texto', 'error');
    });
}

function speakText() {
    if (!currentTranslation) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentTranslation);
    
    // Set language based on target language
    const targetLang = targetLanguageSelect.value;
    utterance.lang = getLanguageCodeForSpeech(targetLang);
    
    // Speech settings
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Visual feedback with Google colors and animation
    const originalText = speakBtn.innerHTML;
    speakBtn.innerHTML = '<i class="fas fa-stop animate-pulse"></i> Parar';
    speakBtn.classList.add('bg-google-accent', 'scale-95');
    speakBtn.classList.remove('bg-google-surface', 'hover:bg-google-hover');
    
    utterance.onend = () => {
        speakBtn.innerHTML = originalText;
        speakBtn.classList.remove('bg-google-accent', 'scale-95');
        speakBtn.classList.add('bg-google-surface', 'hover:bg-google-hover');
    };
    
    utterance.onerror = (event) => {
        console.error('Erro na síntese de voz:', event.error);
        speakBtn.innerHTML = originalText;
        speakBtn.classList.remove('bg-google-accent', 'scale-95');
        speakBtn.classList.add('bg-google-surface', 'hover:bg-google-hover');
        showToast('Erro na reprodução de áudio', 'error');
    };
    
    speechSynthesis.speak(utterance);
}



// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        const text = inputTextarea.value.trim();
        if (!isTranslating && text) {
            translateText(text);
        }
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
        document.activeElement !== inputTextarea && currentTranslation) {
        event.preventDefault();
        copyToClipboard();
    }
    
    // Ctrl+L to clear
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        clearAll();
    }
    
    if (event.key === 'Escape') {
        if (isTranslating) {
            setTranslatingState(false);
        }
    }
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getLanguageCodeForSpeech(code) {
    const speechCodes = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        'hi': 'hi-IN'
    };
    return speechCodes[code] || code;
}

function getLanguageName(code) {
    const languages = {
        'pt': 'Português',
        'en': 'Inglês', 
        'es': 'Espanhol',
        'fr': 'Francês',
        'de': 'Alemão',
        'it': 'Italiano',
        'ja': 'Japonês',
        'ko': 'Coreano',
        'zh': 'Chinês',
        'ru': 'Russo',
        'ar': 'Árabe',
        'hi': 'Hindi',
        'nl': 'Holandês',
        'sv': 'Sueco',
        'da': 'Dinamarquês',
        'no': 'Norueguês',
        'fi': 'Finlandês',
        'pl': 'Polonês',
        'cs': 'Tcheco',
        'sk': 'Eslovaco',
        'hu': 'Húngaro',
        'ro': 'Romeno',
        'bg': 'Búlgaro',
        'hr': 'Croata',
        'sr': 'Sérvio',
        'sl': 'Esloveno',
        'et': 'Estoniano',
        'lv': 'Letão',
        'lt': 'Lituano',
        'uk': 'Ucraniano',
        'be': 'Bielorrusso',
        'mk': 'Macedônio',
        'sq': 'Albanês',
        'mt': 'Maltês',
        'is': 'Islandês',
        'ga': 'Irlandês',
        'cy': 'Galês',
        'eu': 'Basco',
        'ca': 'Catalão',
        'gl': 'Galego',
        'tr': 'Turco',
        'he': 'Hebraico',
        'fa': 'Persa',
        'ur': 'Urdu',
        'bn': 'Bengali',
        'ta': 'Tâmil',
        'te': 'Telugu',
        'ml': 'Malaiala',
        'kn': 'Canarês',
        'gu': 'Gujarati',
        'pa': 'Punjabi',
        'mr': 'Marati',
        'ne': 'Nepalês',
        'si': 'Cingalês',
        'my': 'Birmanês',
        'km': 'Khmer',
        'lo': 'Laosiano',
        'ka': 'Georgiano',
        'am': 'Amárico',
        'sw': 'Suaíli',
        'zu': 'Zulu',
        'af': 'Africâner',
        'th': 'Tailandês',
        'vi': 'Vietnamita',
        'id': 'Indonésio',
        'ms': 'Malaio',
        'tl': 'Filipino'
    };
    return languages[code] || code.toUpperCase();
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0`;
    
    // Set colors based on type using Google color scheme
    const colors = {
        'success': 'bg-green-600 text-white',
        'error': 'bg-red-600 text-white',
        'info': 'bg-blue-600 text-white',
        'warning': 'bg-yellow-600 text-white'
    };
    
    toast.className += ` ${colors[type] || colors.info}`;
    
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)} text-lg"></i>
        <span class="text-sm font-medium">${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
        toast.classList.add('translate-x-0', 'opacity-100');
    }, 50);
    
    // Animate out
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle',
        'warning': 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .translating-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--text-secondary);
        text-align: center;
    }
    
    .translating-indicator i {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--accent-primary);
    }
    
    .error-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        color: var(--error);
        text-align: center;
    }
    
    .error-message i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .translation-text {
        padding: 1rem;
        line-height: 1.6;
        word-wrap: break-word;
    }
`;
document.head.appendChild(style);