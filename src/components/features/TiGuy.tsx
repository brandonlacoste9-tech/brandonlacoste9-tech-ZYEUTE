/**
 * Ti-Guy - The Zyeuté Mascot & AI Assistant
 * A friendly Quebec beaver that helps users navigate the app
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'tiguy';
  timestamp: Date;
}

const TI_GUY_RESPONSES: Record<string, string[]> = {
  greeting: [
    "Allô! Moi c'est Ti-Guy, ton petit castor préféré! 🦫",
    "Salut mon ami! Comment ça va aujourd'hui? ⚜️",
    "Heille! Content de te jaser! 🇨🇦",
  ],
  help: [
    "Je peux t'aider à naviguer l'app! Pose-moi n'importe quelle question! 💡",
    "T'as besoin d'aide? Je suis là pour toi! 🦫",
  ],
  upload: [
    "Pour uploader une photo ou vidéo, clique sur le + en bas! 📸",
    "Veux-tu créer du contenu? Va dans la section Upload! 🎥",
  ],
  fire: [
    "Les feux 🔥 c'est comme des likes, mais en plus hot! Plus t'en reçois, plus ton contenu est malade!",
    "Donne des feux aux posts que tu trouves sick! C'est notre système de rating! 🔥",
  ],
  story: [
    "Les Stories disparaissent après 24 heures! Parfait pour du contenu éphémère! ⏰",
    "Crée une Story en cliquant sur ton avatar en haut du feed! ✨",
  ],
  quebec: [
    "Zyeuté, c'est fait au Québec, pour le Québec! On célèbre notre culture! 🇨🇦⚜️",
    "Utilise des hashtags québécois comme #514 #450 #quebec #montreal! 🏔️",
  ],
  gifts: [
    "Tu peux envoyer des cadeaux virtuels aux créateurs que tu aimes! 🎁",
    "Les cadeaux supportent nos créateurs québécois! C'est comme un tip! 💰",
  ],
  default: [
    "Hmm, je comprends pas trop... Peux-tu reformuler? 🤔",
    "Je suis un petit castor, pas Google! Essaie une autre question! 😅",
    "Désolé, j'ai pas compris! Je suis encore en train d'apprendre! 🦫",
  ],
};

const QUICK_ACTIONS = [
  { label: "Comment ça marche?", key: "help" },
  { label: "Upload une photo", key: "upload" },
  { label: "C'est quoi les feux?", key: "fire" },
  { label: "Stories?", key: "story" },
];

export const TiGuy: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        addTiGuyMessage('greeting');
      }, 500);
    }
  }, [isOpen]);

  // Add Ti-Guy message
  const addTiGuyMessage = (responseKey: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = TI_GUY_RESPONSES[responseKey] || TI_GUY_RESPONSES.default;
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'tiguy',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000);
  };

  // Handle user message
  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // Determine response
    const lowerText = messageText.toLowerCase();
    let responseKey = 'default';

    if (lowerText.includes('upload') || lowerText.includes('poster') || lowerText.includes('publier')) {
      responseKey = 'upload';
    } else if (lowerText.includes('feu') || lowerText.includes('fire') || lowerText.includes('like')) {
      responseKey = 'fire';
    } else if (lowerText.includes('story') || lowerText.includes('histoire')) {
      responseKey = 'story';
    } else if (lowerText.includes('québec') || lowerText.includes('quebec') || lowerText.includes('montréal')) {
      responseKey = 'quebec';
    } else if (lowerText.includes('cadeau') || lowerText.includes('gift') || lowerText.includes('tip')) {
      responseKey = 'gifts';
    } else if (lowerText.includes('aide') || lowerText.includes('help') || lowerText.includes('comment')) {
      responseKey = 'help';
    } else if (lowerText.includes('allo') || lowerText.includes('salut') || lowerText.includes('bonjour')) {
      responseKey = 'greeting';
    }

    addTiGuyMessage(responseKey);
  };

  // Handle quick action
  const handleQuickAction = (key: string, label: string) => {
    handleSendMessage(label);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 w-16 h-16 bg-gold-gradient rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform edge-glow-strong animate-bounce"
          aria-label="Ouvre Ti-Guy"
        >
          <span className="text-3xl">🦫</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden card-edge">
          {/* Header */}
          <div className="bg-gold-gradient p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <span className="text-2xl">🦫</span>
              </div>
              <div>
                <h3 className="text-black font-bold">Ti-Guy</h3>
                <p className="text-black/70 text-xs">Ton assistant québécois</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-black/10 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-black">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'tiguy' && (
                  <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🦫</span>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[70%] p-3 rounded-2xl text-sm',
                    message.sender === 'user'
                      ? 'bg-gold-gradient text-black'
                      : 'bg-white/10 text-white'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center">
                  <span className="text-lg">🦫</span>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="p-3 border-t border-white/10 bg-black/50">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => handleQuickAction(action.key, action.label)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white text-xs transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-black/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pose une question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:border-gold-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-gold-gradient rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
              >
                <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TiGuy;

