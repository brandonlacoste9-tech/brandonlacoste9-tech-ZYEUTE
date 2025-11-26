
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Courriel de confirmation envoyé! 📧");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#050505",
      color: "#fff",
      fontFamily: "sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Background Image with Overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1519178555425-49722c69b352?q=80&w=2070&auto=format&fit=crop" 
          alt="Montreal Night" 
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
        />
        <div style={{ 
          position: "absolute", 
          inset: 0, 
          background: "linear-gradient(to top, #050505 10%, rgba(5,5,5,0.8) 50%, rgba(5,5,5,0.4) 100%)" 
        }} />
      </div>

      {/* Login Card */}
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        width: "100%", 
        maxWidth: 400, 
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24
      }}>
        
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, border: "2px dashed #D4AF37", borderRadius: 16, marginBottom: 16, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)" }}>
            <div style={{ 
               width: 0, 
               height: 0, 
               borderTop: "10px solid transparent",
               borderBottom: "10px solid transparent",
               borderLeft: "16px solid #D4AF37",
               marginLeft: 4
             }} />
          </div>
          <h1 style={{ 
            fontSize: 36, 
            fontWeight: 900, 
            margin: 0, 
            background: "linear-gradient(to right, #C6934B, #F3C982)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent",
            letterSpacing: "2px",
            textTransform: "uppercase"
          }}>
            Zyeuté
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 14, marginTop: 8 }}>Connecte-toi à la culture d'icitte.</p>
        </div>

        {/* Auth Buttons Container */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* 1. Google (Hero) */}
          <button 
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            style={{
              width: "100%",
              background: "#ffffff",
              color: "#000000",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transition: "transform 0.1s"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          {/* 2. Secondary Row (Facebook & Apple) */}
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => handleOAuthLogin('facebook')}
              disabled={loading}
              style={{
                flex: 1,
                background: "#1877F2", // Facebook Blue
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Facebook"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button 
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading}
              style={{
                flex: 1,
                background: "#1A1A1A", // Apple Dark
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 12,
                padding: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Apple"
            >
              <svg width="24" height="24" viewBox="0 0 384 512" fill="white">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 66.2 23.9 122.2 52.4 167.7 20.3 32.9 50.5 68.8 84.9 69.4 33.7.6 47.8-21.5 87.7-21.5 40.9 0 53 21.5 90.1 21.5 29.5 0 54.3-27.1 75-57.8 19.5-28.5 27.6-55.8 28-57.3-.2-.2-53.9-20.6-53.4-66.8zM221.3 95.8c18.5-22.6 30.6-53.5 27.1-85-27 1.1-59.7 18-79.1 41.5-17.6 21.1-32.9 55-27.7 85.8 29.7 2.3 61.2-19.4 79.7-42.3z"/>
              </svg>
            </button>
          </div>

        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, color: "#666", textTransform: "uppercase" }}>ou courriel</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", fontSize: 12, padding: 12, borderRadius: 8, textAlign: "center" }}>
              {error}
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="Courriel" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "14px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box"
            }}
            required
          />

          <input 
            type="password" 
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "14px",
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box"
            }}
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              background: "linear-gradient(to right, #C6934B, #F3C982)",
              color: "#000",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: 8
            }}
          >
            {loading ? "Chargement..." : (isSignUp ? "Créer mon compte" : "Me connecter")}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
          {isSignUp ? "Déjà membre ?" : "Nouveau sur Zyeuté ?"}
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: "transparent",
              border: "none",
              color: "#D4AF37",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: 6
            }}
          >
            {isSignUp ? "Se connecter" : "S'inscrire"}
          </button>
        </div>

      </div>
    </div>
  );
}
