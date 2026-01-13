import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // --- AAPKA RENDER BACKEND URL ---
  const API_URL = "https://devvault-backend-5mjy.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // localhost ki jagah API_URL use kiya hai
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        
        if (onLogin) onLogin(); 
        
        alert("Login Successful! 🚀");
        navigate('/'); 
      } else {
        alert(data.error || "Login fail ho gaya");
      }
    } catch (err) { 
      console.error("Login Error:", err);
      alert("Server se connect nahi ho paa raha!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-blue-500 mb-6 text-center italic tracking-tighter uppercase">DevVault Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white transition-all" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white transition-all" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] text-white"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account? <Link to="/signup" className="text-blue-500 font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;