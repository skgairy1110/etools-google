import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Star, Mail, Phone, MessageCircle, Upload, 
  Download, ArrowLeft, Save, Activity, Edit2, Trash2, BarChart2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, deleteDoc, onSnapshot, collection, addDoc, query, where, updateDoc } from 'firebase/firestore';

// Your exact Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD6fC68W2XqgyYzehwY0upFy-QdUQE-sWM",
  authDomain: "etools-login.firebaseapp.com",
  projectId: "etools-login",
  storageBucket: "etools-login.firebasestorage.app",
  messagingSenderId: "184497331244",
  appId: "1:184497331244:web:250ff03682579b79d24589",
  measurementId: "G-V2888ZRY11"
};

let app, auth, db, analytics;
try {
  // Initialize Firebase, Analytics, Auth, and Database
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not configured properly.", e);
}

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) return console.error("Firebase not configured");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src="etools-logo.png" alt="eTools Hub Logo" className="h-8 object-contain" />
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
              <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-xs bg-[#27272a] hover:bg-[#3f3f46] text-white px-3 py-1.5 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20">
            Sign in with Google
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="pb-20">
        {currentView === 'home' ? (
          <HomeView onViewChange={setCurrentView} />
        ) : currentView === 'qr' ? (
          <QRToolView onViewChange={setCurrentView} user={user} />
        ) : (
          <div className="p-10 text-center">Tool under construction</div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2 opacity-80">
           <img src="etools-logo.png" alt="eTools Hub Logo" className="h-6 object-contain" />
        </div>
        <p className="text-gray-400 text-sm">Free online tools for everyday tasks. No sign-up required.</p>
        <p className="text-gray-600 text-xs mt-4">© 2026 eTools Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function HomeView({ onViewChange }) {
  const categories = ["All", "Image", "PDF", "Text", "Generators", "Utilities"];
  
  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">eTools Hub</h1>
        <p className="text-gray-300 text-lg mb-6">Complete suite of digital tools for your daily needs.</p>
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          All tools are free to use
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              cat === "All" 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#18181b] text-gray-400 hover:bg-[#27272a] hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => onViewChange('qr')}
            className={`group relative flex flex-col bg-[#121214] rounded-2xl p-5 border border-white/5 hover:bg-[#18181b] hover:border-white/10 transition-all cursor-pointer overflow-hidden ring-1 ring-blue-500/50`}
          >
            <div className={`absolute top-0 left-0 w-full h-[2px] opacity-70 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-current to-transparent text-blue-500`}></div>
            <div className="mb-4">
               <QrCode className={`w-8 h-8 text-blue-500`} strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold mb-2">QR Code Generator</h3>
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">Generate QR codes instantly from any text or URL</p>
          </div>
      </div>
    </div>
  );
}

function QRToolView({ onViewChange, user }) {
  const [text, setText] = useState('');
  const [centerIcon, setCenterIcon] = useState('None');
  const [size, setSize] = useState('512x512');
  const [errorCorrection, setErrorCorrection] = useState('H');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [margin, setMargin] = useState('4');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Custom Drag & Drop Image State
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);

  // Database Save State
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || !db) return;

    const q = query(collection(db, 'qr_projects'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      // Sort locally (newest first)
      projects.sort((a, b) => b.createdAt - a.createdAt);
      setSavedProjects(projects);
    }, (error) => {
      console.error("Error fetching projects: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerate = () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    
    const cleanDark = darkColor.replace('#', '');
    const cleanLight = lightColor.replace('#', '');
    const sizeNum = size.split('x')[0];
    
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${sizeNum}x${sizeNum}&data=${encodeURIComponent(text)}&color=${cleanDark}&bgcolor=${cleanLight}&margin=${margin}&ecc=${errorCorrection}`;
    
    setTimeout(() => {
      setGeneratedUrl(apiUrl);
      setIsGenerating(false);
    }, 500);
  };

  const handleSaveProject = async () => {
    if (!user || !projectName.trim()) return;
    
    setIsSaving(true);
    const payload = {
      userId: user.uid,
      projectName: projectName,
      config: {
        text, size, errorCorrection, darkColor, lightColor, margin, centerIcon, customLogoUrl
      },
      updatedAt: Date.now()
    };

    try {
      if (editingId) {
        // Update existing project
        await updateDoc(doc(db, 'qr_projects', editingId), payload);
      } else {
        // Save new project
        payload.createdAt = Date.now();
        payload.scans = Math.floor(Math.random() * 500); // Give them some fun mock analytics
        await addDoc(collection(db, 'qr_projects'), payload);
      }
      setProjectName('');
      setEditingId(null);
    } catch (error) {
      console.error("Error saving project:", error);
    }
    setIsSaving(false);
  };

  const handleEdit = (project) => {
    setProjectName(project.projectName);
    setEditingId(project.id);
    
    // Load config back into the form
    const conf = project.config;
    setText(conf.text || '');
    setSize(conf.size || '512x512');
    setErrorCorrection(conf.errorCorrection || 'H');
    setDarkColor(conf.darkColor || '#000000');
    setLightColor(conf.lightColor || '#FFFFFF');
    setMargin(conf.margin || '4');
    setCenterIcon(conf.centerIcon || 'None');
    setCustomLogoUrl(conf.customLogoUrl || null);
    
    // Scroll to top and generate preview automatically
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => handleGenerate(), 100);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'qr_projects', id));
      if (editingId === id) {
        setEditingId(null);
        setProjectName('');
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target.result);
        setCenterIcon('Custom');
        setErrorCorrection('H'); // Auto set to High for custom logo
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (PNG, JPG, etc).');
    }
  };

  const icons = [
    { id: 'None', label: 'None', icon: null },
    { id: 'Instagram', label: 'Instagram', icon: InstagramIcon },
    { id: 'Facebook', label: 'Facebook', icon: FacebookIcon },
    { id: 'Review', label: 'Review', icon: Star },
    { id: 'Email', label: 'Email', icon: Mail },
    { id: 'Phone', label: 'Phone', icon: Phone },
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'Custom', label: 'Custom', icon: Upload },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-8">
      {/* Back Button */}
      <button 
        onClick={() => onViewChange('home')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      {/* Tool Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-500 mb-3">QR Code Generator</h1>
        <p className="text-gray-400">Generate QR codes instantly from any text or URL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Controls */}
        <div className="bg-[#121214] rounded-3xl p-8 border border-white/5">
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-200 mb-2">Text or URL</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, or any data..."
              className="w-full h-32 bg-[#18181b] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-200 mb-3">Center Icon</label>
            <div className="grid grid-cols-4 gap-3">
              {icons.map((item) => (
                <div key={item.id} className="relative">
                  {item.id === 'Custom' ? (
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-full w-full flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        centerIcon === 'Custom' 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : isDragging 
                            ? 'bg-blue-500/20 border-blue-500 border-dashed text-blue-400'
                            : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*"
                        className="hidden" 
                      />
                      <Upload className={`w-5 h-5 mb-1 ${isDragging ? 'animate-bounce' : ''}`} />
                      <span className="text-xs text-center">{isDragging ? 'Drop it!' : 'Upload logo'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCenterIcon(item.id);
                        if (item.id !== 'None') setErrorCorrection('H');
                      }}
                      className={`w-full flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        centerIcon === item.id 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      {item.id === 'None' ? (
                        <span className="text-sm font-medium h-6 flex items-center">None</span>
                      ) : (
                        <>
                          {item.icon && <item.icon className="w-5 h-5 mb-1" />}
                          <span className="text-xs">{item.label}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {centerIcon !== 'None' && (
              <p className="text-xs text-gray-500 mt-2">Tip: use error correction "High" when adding a logo.</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-4">Advanced Options</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Size (px)</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="256x256">256px</option>
                  <option value="512x512">512px</option>
                  <option value="1024x1024">1024px</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Error Correction</label>
                <select 
                  value={errorCorrection} 
                  onChange={(e) => setErrorCorrection(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Dark Color</label>
                <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg overflow-hidden">
                  <input 
                    type="color" 
                    value={darkColor} 
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-10 h-10 p-1 bg-transparent cursor-pointer border-none"
                  />
                  <input 
                    type="text" 
                    value={darkColor.toUpperCase()} 
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="bg-transparent border-none text-sm text-white focus:outline-none w-full px-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Light Color</label>
                 <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg overflow-hidden">
                  <input 
                    type="color" 
                    value={lightColor} 
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-10 h-10 p-1 bg-transparent cursor-pointer border-none"
                  />
                  <input 
                    type="text" 
                    value={lightColor.toUpperCase()} 
                    onChange={(e) => setLightColor(e.target.value)}
                    className="bg-transparent border-none text-sm text-white focus:outline-none w-full px-2"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-1">Margin</label>
              <select 
                value={margin} 
                onChange={(e) => setMargin(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="0">0</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </div>

        {/* Right Panel: Preview & Saving */}
        <div className="bg-[#121214] rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[500px]">
          {!generatedUrl ? (
             <div className="flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-[#18181b] border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                 <QrCode className="w-8 h-8 text-gray-600" />
               </div>
               <p className="text-gray-400">Your QR code will appear here</p>
             </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="relative inline-block bg-white p-2 rounded-xl shadow-2xl">
                <img 
                  src={generatedUrl} 
                  alt="Generated QR Code" 
                  className="max-w-full max-h-[400px] object-contain rounded-lg"
                />
                
                {/* Overlay Icon Logic */}
                {centerIcon !== 'None' && centerIcon !== 'Custom' && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center" style={{ width: '20%', height: '20%' }}>
                        {icons.find(i => i.id === centerIcon)?.icon && React.createElement(icons.find(i => i.id === centerIcon).icon, { 
                          className: "w-full h-full text-black" 
                        })}
                      </div>
                   </div>
                )}

                {centerIcon === 'Custom' && customLogoUrl && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-1.5 rounded-md shadow-sm overflow-hidden flex items-center justify-center" style={{ width: '24%', height: '24%' }}>
                        <img src={customLogoUrl} alt="Custom Center Logo" className="w-full h-full object-contain" />
                      </div>
                   </div>
                )}
              </div>
              
              <div className="mt-8 flex flex-col gap-4 w-full max-w-sm">
                 <button 
                   onClick={() => {
                     const link = document.createElement('a');
                     link.href = generatedUrl;
                     link.download = 'qrcode.png';
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                   }}
                   className="w-full bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <Download className="w-4 h-4" /> Download
                 </button>

                 {user ? (
                    <div className="bg-[#18181b] border border-white/5 p-4 rounded-xl flex flex-col gap-3">
                      <label className="text-sm text-gray-300 font-medium">Save to Dashboard</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={projectName}
                           onChange={(e) => setProjectName(e.target.value)}
                           placeholder="Project Name (e.g., Summer Promo)"
                           className="flex-1 bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                         />
                         <button 
                           onClick={handleSaveProject}
                           disabled={isSaving || !projectName.trim()}
                           className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                         >
                           <Save className="w-4 h-4" />
                           {editingId ? 'Update' : 'Save'}
                         </button>
                      </div>
                    </div>
                 ) : (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Sign in to save projects and view analytics.
                    </p>
                 )}
              </div>
            </div>
          )}
        </div>

      </div>

      {}
      {user && (
        <div className="mt-16 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
               <Activity className="w-6 h-6 text-blue-500" />
               Your Saved Projects
             </h2>
          </div>
          
          {savedProjects.length === 0 ? (
             <div className="bg-[#121214] border border-white/5 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <BarChart2 className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">You haven't saved any QR codes yet. Generate and save one above to see your analytics!</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map((project) => (
                   <div key={project.id} className={`bg-[#121214] border rounded-2xl p-6 transition-all ${editingId === project.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="flex justify-between items-start mb-6">
                         <div>
                           <h3 className="text-lg font-semibold text-white mb-1">{project.projectName}</h3>
                           <p className="text-xs text-gray-500">
                              Created {new Date(project.createdAt).toLocaleDateString()}
                           </p>
                         </div>
                         <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(project)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Design">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Project">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-[#18181b] p-4 rounded-xl border border-white/5">
                         <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                           <Activity className="w-6 h-6 text-blue-500" />
                         </div>
                         <div>
                            <p className="text-2xl font-bold text-white">{project.scans?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-400 mt-1">Total Scans (Mock Analytics)</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}