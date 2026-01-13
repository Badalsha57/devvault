import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // --- AAPKA RENDER BACKEND URL ---
  const API_URL = "https://devvault-backend-5mjy.onrender.com";

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // localhost ko API_URL se replace kiya
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account Created! Please Login.");
        navigate('/login');
      } else {
        alert(data.error || "Signup fail ho gaya");
      }
    } catch (err) { 
      console.error("Signup error:", err); 
      alert("Server se connection nahi ho paa raha!");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-blue-500 mb-6 text-center italic tracking-tighter uppercase">CREATE ACCOUNT</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white" 
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
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] text-white"
          >
            Register Now
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;