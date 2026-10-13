import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Message d'accueil de l'assistant
const SALUTATION = "Bonjour et bienvenue chez ABRISIA Plan ! 🏡\n\nJe suis Assistant ABRISIA, votre assistant virtuel.\n\nQue vous souhaitiez construire une maison, un chalet ou un garage, je suis ici pour répondre à vos questions, vous présenter les options disponibles et vous aider à donner forme à votre projet.\n\nComment puis-je vous aider aujourd'hui ?";
// Une conversation sans activité depuis 24 h est remplacée par une nouvelle
const DUREE_CONVERSATION_MS = 24 * 60 * 60 * 1000;

const nouvelleSession = () => {
  const id = 'chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  try {
    localStorage.setItem('abrisia_chat_session', id);
    localStorage.setItem('abrisia_chat_activite', String(Date.now()));
  } catch {}
  return id;
};

const sessionExistante = () => {
  try {
    const id = localStorage.getItem('abrisia_chat_session');
    const derniere = Number(localStorage.getItem('abrisia_chat_activite') || 0);
    if (id && Date.now() - derniere < DUREE_CONVERSATION_MS) return id;
  } catch {}
  return nouvelleSession();
};

// Met en gras les mots entourés de ** (ex. **plan de maison**)
const boldify = (text, key) => text.split(/\*\*([^*]+)\*\*/g).map((part, i) => (
  i % 2 === 1 ? <strong key={`${key}-${i}`}>{part}</strong> : part
));

// Rend les adresses web cliquables dans les réponses de l'assistant
const linkify = (text) => text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
  /^https?:\/\//.test(part) ? (
    <a key={i} href={part.replace(/[.,;:!?)]+$/, '')} className="text-teal-700 underline break-all">
      {part}
    </a>
  ) : boldify(part, i)
));

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [sessionId, setSessionId] = useState(sessionExistante);

  const recommencer = () => {
    setSessionId(nouvelleSession());
    setMessages([{ role: 'assistant', content: SALUTATION }]);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load history when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/chatbot/chat/history/${sessionId}`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setMessages(data.data.map(m => ({ role: m.role, content: m.content })));
      } else {
        setMessages([{ role: 'assistant', content: SALUTATION }]);
      }
    } catch {
      setMessages([{ role: 'assistant', content: SALUTATION }]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    try { localStorage.setItem('abrisia_chat_activite', String(Date.now())); } catch {}
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add placeholder for assistant
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    // Le serveur abandonne après ~35 s ; on ne fait jamais attendre plus d'une minute
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, session_id: sessionId }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error('Erreur serveur');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';
      let finished = false;

      // Chaque ligne « data: ... » contient un morceau de texte encodé en JSON
      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // ligne incomplète : on attend la suite

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { finished = true; break; }
          try {
            fullContent += JSON.parse(data);
          } catch {
            fullContent += data;
          }
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: fullContent };
            return updated;
          });
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
        };
        return updated;
      });
    } finally {
      clearTimeout(timer);
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          data-testid="chatbot-toggle-btn"
          aria-label="Ouvrir le chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          data-testid="chatbot-window"
        >
          {/* Header */}
          <div className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="font-semibold text-sm leading-tight">Assistant ABRISIA</p>
                <p className="text-xs text-teal-200">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
            <button
              onClick={recommencer}
              className="text-white/80 hover:text-white transition-colors"
              title="Nouvelle conversation"
              aria-label="Nouvelle conversation"
              data-testid="chatbot-reset-btn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              data-testid="chatbot-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" data-testid="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={`msg-${idx}`}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-teal-700" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-700 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                  }`}
                >
                  {(msg.content && <span className="whitespace-pre-wrap">{linkify(msg.content)}</span>) || (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> L'assistant réfléchit...
                    </span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                data-testid="chatbot-input"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full bg-teal-700 hover:bg-teal-800 w-9 h-9 flex-shrink-0"
                data-testid="chatbot-send-btn"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
