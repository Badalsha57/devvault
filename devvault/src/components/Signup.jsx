import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Account Created! Please Login.");
        navigate('/login');
      } else {
        alert(data.error);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-black text-blue-500 mb-6 text-center italic tracking-tighter">CREATE ACCOUNT</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none focus:border-blue-500 text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full py-4 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">Register Now</button>
        </form>
        <p className="mt-6 text-center text-slate-400 text-sm">Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Log In</Link></p>
      </div>
    </div>
  );
}

export default Signup;