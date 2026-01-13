import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allResources, setAllResources] = useState([]); 
  const [showModal, setShowModal] = useState(false); 
  const [file, setFile] = useState(null); 
  const [newResource, setNewResource] = useState({ title: '', type: 'PDF', desc: '', link: '' });
  const navigate = useNavigate();

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.reload(); // Page refresh karke App.jsx ko login par bhejne ke liye
  };

  // 1. Database se Data Fetch karna
  const fetchResources = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/resources');
      const data = await res.json();
      setAllResources(data);
    } catch (err) {
      console.error("Data fetch error:", err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // 2. Naya Data Save karna
  const handleAddResource = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', newResource.title);
    formData.append('type', newResource.type);
    formData.append('desc', newResource.desc);
    formData.append('ownerId', localStorage.getItem('userId')); // Login user ki ID

    let finalLink = newResource.link.trim();
    if (finalLink && !finalLink.startsWith('http')) {
      finalLink = 'https://' + finalLink;
    }
    formData.append('link', finalLink);

    if (file) {
      formData.append('pdfFile', file);
    }

    try {
      const res = await fetch('http://localhost:5000/api/add', {
        method: 'POST',
        body: formData 
      });

      if (res.ok) {
        setShowModal(false);
        setNewResource({ title: '', type: 'PDF', desc: '', link: '' });
        setFile(null);
        fetchResources(); 
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // 3. Data Delete karna
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Kya aap ise delete karna chahte hain?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/delete/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) fetchResources();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const filteredResources = allResources.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      {/* Navbar with Logout */}
      <nav className="flex justify-between items-center px-6 md:px-10 py-5 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="text-2xl font-black text-blue-500 tracking-tighter cursor-pointer italic">DEVVAULT</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 text-sm active:scale-95"
          >
            + Add Resource
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center pt-16 pb-10 px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-6 leading-tight">
          Manage Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">CS Library.</span>
        </h1>
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 p-2 rounded-2xl flex items-center mb-16 shadow-2xl focus-within:border-blue-500/50 transition-all">
          <span className="pl-4 text-slate-500">🔍</span>
          <input 
            type="text" 
            placeholder="Search notes, links, or code..." 
            className="w-full bg-transparent p-4 outline-none text-lg text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-10 pb-20 max-w-7xl mx-auto">
        {filteredResources.length > 0 ? (
          filteredResources.map((item) => (
            <div 
              key={item._id} 
              onClick={() => item.link && window.open(item.link, "_blank")}
              className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group relative hover:-translate-y-1 shadow-lg"
            >
              <button 
                onClick={(e) => handleDelete(e, item._id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all p-2 z-10 bg-slate-800 rounded-lg"
              >
                🗑️
              </button>

              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${item.type === 'PDF' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {item.type}
                </div>
                <span className="text-2xl">{item.type === 'PDF' ? '📄' : '💻'}</span>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1 uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                {item.desc || "No description provided."}
              </p>
              
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-blue-500 text-[11px] font-bold tracking-wider">
                  {item.link ? "VIEW DOCUMENT ↗" : "NO FILE ATTACHED"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 opacity-50 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-xl italic">No resources found. Click "Add Resource" to start! 🚀</p>
          </div>
        )}
      </div>

      {/* --- ADD RESOURCE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-500">📥</span> Add to Vault
            </h2>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Title</label>
                <input required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 text-white" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase">Option 1: Paste Link</label>
                <input 
                  placeholder="https://google-drive-link.com" 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 text-white"
                  value={newResource.link}
                  onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                />
              </div>

              <div className="py-2 flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-slate-800"></div>
                <span className="text-xs text-slate-600 font-bold">OR</span>
                <div className="flex-1 h-[1px] bg-slate-800"></div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-bold uppercase">Option 2: Upload PDF</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Type</label>
                  <select className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 text-white" value={newResource.type} onChange={(e) => setNewResource({...newResource, type: e.target.value})}>
                    <option value="PDF">PDF / Notes</option>
                    <option value="CODE">Code Snippet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Description</label>
                <textarea className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-blue-500 h-20 resize-none text-white" value={newResource.desc} onChange={(e) => setNewResource({...newResource, desc: e.target.value})}></textarea>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 rounded-xl font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20">Save Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;