
import React, { useState, useEffect, useRef } from 'react';

interface LiveOverlayProps {
  username: string;
  onClose: () => void;
}

export default function LiveOverlay({ username, onClose }: LiveOverlayProps) {
  // 1. State for the input text
  const [inputValue, setInputValue] = useState("");
  
  // 2. State for the chat list
  const [comments, setComments] = useState([
    { user: "kevin_g", text: "Le son est pas fort 🔊", isMe: false },
    { user: "marie_soleil", text: "Allo de Trois-Rivières! 👋", isMe: false },
    { user: "j-p_tremblay", text: "C'est ou ça exactement?", isMe: false },
  ]);

  // Ref to auto-scroll to bottom of chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll whenever comments change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Simulate incoming comments
  useEffect(() => {
    const interval = setInterval(() => {
      const newComments = [
        { user: "mathieu_qc", text: "Aweye le gros!", isMe: false },
        { user: "sophie_mtl", text: "Cône orange spotted 🚧", isMe: false },
        { user: "luc_d", text: "🔥🔥🔥", isMe: false },
        { user: "val_t", text: "Ben voyons donc!", isMe: false },
      ];
      const randomComment = newComments[Math.floor(Math.random() * newComments.length)];
      setComments((prev) => [...prev.slice(-10), randomComment]); // Keep list manageable
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // 3. LOGIC: Handle sending your own comment
  const handleSend = () => {
    if (!inputValue.trim()) return; // Don't send empty messages

    const myComment = { 
      user: "Moi", 
      text: inputValue,
      isMe: true 
    };

    setComments(prev => [...prev, myComment]);
    setInputValue(""); // Clear input
  };

  // Allow sending by pressing "Enter"
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Video Placeholder */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.6,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent, rgba(0,0,0,0.8))'
      }}>
        <img 
          src="https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=2079&auto=format&fit=crop" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Live Stream"
        />
      </div>

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '48px 16px 16px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: 999,
          padding: '4px 12px 4px 6px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(to right, #facc15, #ca8a04)', // Yellow gradient
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: 16 }}>👤</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{username}</span>
            <span style={{ color: '#d1d5db', fontSize: 10 }}>3.4k spectateurs</span>
          </div>
          <div style={{
            backgroundColor: '#dc2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: 4,
            marginLeft: 8,
            boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
            animation: 'pulse 2s infinite'
          }}>
            EN DIRECT
          </div>
        </div>
        
        <button onClick={onClose} style={{
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.2)',
          padding: 0,
          borderRadius: '50%',
          backdropFilter: 'blur(12px)',
          border: 'none',
          cursor: 'pointer',
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>✕</span>
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Chat & Controls */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
      }}>
        {/* Chat Area */}
        <div style={{
          height: 200,
          overflowY: 'auto',
          maskImage: 'linear-gradient(to bottom, transparent, black 20%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%)',
          scrollbarWidth: 'none'
        }}>
          {comments.map((c, i) => (
            <div key={i} style={{
              marginBottom: 8,
              fontSize: 14,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              animation: 'fade-in-up 0.3s ease-out',
              textAlign: c.isMe ? 'right' : 'left'
            }}>
              <span style={{ 
                fontWeight: 'bold', 
                color: c.isMe ? '#facc15' : '#D4AF37', 
                opacity: 1, 
                marginRight: 8 
              }}>
                {c.user}:
              </span>
              <span>{c.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Jase un peu..." 
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 999,
                padding: '10px 40px 10px 16px',
                color: 'white',
                outline: 'none',
                backdropFilter: 'blur(12px)',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
            <button 
              onClick={handleSend}
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ➤
            </button>
          </div>
          
          {/* Reaction Button */}
          <button style={{
            background: 'linear-gradient(135deg, #D4AF37, #b8860b)',
            padding: 0,
            width: 44,
            height: 44,
            borderRadius: '50%',
            color: 'black',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s'
          }}
          onClick={(e) => {
            e.currentTarget.style.transform = "scale(0.9)";
            setTimeout(() => e.currentTarget.style.transform = "scale(1)", 100);
          }}
          >
             🔥
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}
