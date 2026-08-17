import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Star, Mail, Phone, MessageCircle, Upload, 
  Download, ArrowLeft, Save, Activity, Edit2, Trash2, BarChart2, CheckCircle2 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, deleteDoc, onSnapshot, collection, addDoc, query, where, updateDoc } from 'firebase/firestore';

const presetIconSVGs = {
  Instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  Facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  Review: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000" stroke="#000000" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  Email: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  Phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  WhatsApp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 9a1.5 1.5 0 0 0 3 0 1.5 1.5 0 0 0-3 0Z"/></svg>`
};

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
  app = initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase initialization skipped or non-browser environment detected.", e);
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
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async () => {
    if (!auth) return console.error("Firebase not configured");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      triggerToast("Successfully signed in with Google");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
      triggerToast("Signed out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-200 font-sans selection:bg-blue-500/30 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setCurrentView('home')}>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">eTOOLS</span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
              <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-xs bg-[#27272a] hover:bg-[#3f3f46] text-white px-3 py-1.5 rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 active:scale-95">
            Sign in with Google
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="pb-20 flex-grow">
        {currentView === 'home' ? (
          <HomeView onViewChange={setCurrentView} showToast={triggerToast} />
        ) : currentView === 'qr' ? (
          <QRToolView onViewChange={setCurrentView} user={user} showToast={triggerToast} />
        ) : (
          <div className="p-10 text-center text-gray-400">Tool under construction</div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 flex flex-col items-center justify-center gap-2 text-center bg-[#09090b]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center border border-white/20">
            <QrCode className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide">eTOOLS</span>
        </div>
        <p className="text-gray-400 text-xs max-w-md">Free online tools for everyday tasks. No sign-up required.</p>
        <p className="text-gray-600 text-[11px] mt-2">© 2026 eTools Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

function HomeView({ onViewChange, showToast }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Generators"];

  // Displaying only QR Code Generator for now
  const dummyTools = [
    { title: "QR Code Generator", desc: "Generate QR codes instantly from any text or URL", cat: "Generators", active: true },
  ];

  const filteredTools = activeCategory === "All" 
    ? dummyTools 
    : dummyTools.filter(t => t.cat.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">eTools Hub</h1>
        <p className="text-gray-400 text-base sm:text-lg mb-5">Complete suite of digital tools for your daily needs.</p>
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          All tools are free to use
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-[#18181b] text-gray-400 hover:bg-[#27272a] hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredTools.map((tool, idx) => (
          <div 
            key={idx}
            onClick={() => tool.active ? onViewChange('qr') : showToast(`${tool.title} is coming soon!`)}
            className={`group relative flex flex-col justify-between bg-[#121214] rounded-2xl p-5 border border-white/5 hover:bg-[#18181b] hover:border-white/10 transition-all cursor-pointer h-44 ${tool.active ? 'ring-1 ring-blue-500/50' : ''}`}
          >
            {tool.active && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            )}
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors">{tool.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{tool.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRToolView({ onViewChange, user, showToast }) {
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

    const q = query(collection(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      projects.sort((a, b) => b.createdAt - a.createdAt);
      setSavedProjects(projects);
    }, (error) => {
      console.error("Error fetching Firestore projects: ", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Generate initial QR code on view mount
  useEffect(() => {
    handleGenerate();
  }, []);

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
    }, 300);
  };

  const handleDownloadPNG = async () => {
    if (!generatedUrl) return;

    try {
      const sizeNum = parseInt(size.split('x')[0]) || 512;
      const response = await fetch(generatedUrl);
      const blob = await response.blob();
      const qrImgUrl = URL.createObjectURL(blob);

      const baseImg = new Image();
      baseImg.src = qrImgUrl;
      await new Promise((resolve, reject) => {
        baseImg.onload = resolve;
        baseImg.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = sizeNum;
      canvas.height = sizeNum;
      const ctx = canvas.getContext('2d');

      // 1. Draw base QR Code image
      ctx.drawImage(baseImg, 0, 0, sizeNum, sizeNum);
      URL.revokeObjectURL(qrImgUrl);

      // 2. Draw logo overlay on center if selected
      if (centerIcon !== 'None') {
        const overlaySize = Math.floor(sizeNum * 0.22);
        const centerX = (sizeNum - overlaySize) / 2;
        const centerY = (sizeNum - overlaySize) / 2;
        const pad = Math.max(4, Math.floor(overlaySize * 0.12));

        // Draw solid background badge
        ctx.fillStyle = lightColor || '#FFFFFF';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(centerX - pad, centerY - pad, overlaySize + pad * 2, overlaySize + pad * 2, Math.floor(pad * 2));
        } else {
          ctx.rect(centerX - pad, centerY - pad, overlaySize + pad * 2, overlaySize + pad * 2);
        }
        ctx.fill();

        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = Math.max(1, Math.floor(sizeNum / 256));
        ctx.stroke();

        // Draw icon onto badge
        let iconSrc = null;
        if (centerIcon === 'Custom' && customLogoUrl) {
          iconSrc = customLogoUrl;
        } else if (presetIconSVGs[centerIcon]) {
          iconSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(presetIconSVGs[centerIcon])}`;
        }

        if (iconSrc) {
          const iconImg = new Image();
          iconImg.src = iconSrc;
          await new Promise((resolve) => {
            iconImg.onload = resolve;
            iconImg.onerror = resolve;
          });
          ctx.drawImage(iconImg, centerX, centerY, overlaySize, overlaySize);
        }
      }

      // Convert canvas to downloadable image
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("PNG downloaded with center logo!");
    } catch (err) {
      console.error("PNG compositing error:", err);
      // Fallback download if composite fails
      const link = document.createElement('a');
      link.href = generatedUrl;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("PNG downloaded!");
    }
  };

  const handleDownloadSVG = async () => {
    if (!text.trim()) return;
    try {
      const cleanDark = darkColor.replace('#', '');
      const cleanLight = lightColor.replace('#', '');
      const sizeNum = size.split('x')[0];
      
      const svgApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${sizeNum}x${sizeNum}&data=${encodeURIComponent(text)}&color=${cleanDark}&bgcolor=${cleanLight}&margin=${margin}&ecc=${errorCorrection}&format=svg`;
      
      const response = await fetch(svgApiUrl);
      let svgText = await response.text();
      
      // Inject center logo overlay into vector SVG cleanly using data-uri image tag
      if (centerIcon !== 'None') {
        const sizeVal = parseInt(sizeNum);
        const overlaySize = Math.floor(sizeVal * 0.22);
        const centerX = (sizeVal - overlaySize) / 2;
        const centerY = (sizeVal - overlaySize) / 2;
        const pad = Math.max(4, Math.floor(overlaySize * 0.12));
        const badgeX = centerX - pad;
        const badgeY = centerY - pad;
        const badgeDim = overlaySize + pad * 2;
        const rx = Math.floor(pad * 2);
        
        let logoSvgSnippet = `<rect x="${badgeX}" y="${badgeY}" width="${badgeDim}" height="${badgeDim}" rx="${rx}" fill="#${cleanLight}" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>`;
        
        let iconSrc = null;
        if (centerIcon === 'Custom' && customLogoUrl) {
          iconSrc = customLogoUrl;
        } else if (presetIconSVGs[centerIcon]) {
          iconSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(presetIconSVGs[centerIcon])}`;
        }

        if (iconSrc) {
          logoSvgSnippet += `<image href="${iconSrc}" x="${centerX}" y="${centerY}" width="${overlaySize}" height="${overlaySize}" preserveAspectRatio="xMidYMid meet"/>`;
        }
        
        if (logoSvgSnippet) {
          svgText = svgText.replace('</svg>', `${logoSvgSnippet}</svg>`);
        }
      }

      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qrcode-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      showToast("SVG with center logo downloaded!");
    } catch (err) {
      console.error("SVG Download failed:", err);
      showToast("Failed to download SVG");
    }
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
        await updateDoc(doc(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects', editingId), payload);
        showToast("Project updated successfully!");
      } else {
        payload.createdAt = Date.now();
        payload.scans = Math.floor(Math.random() * 120) + 12;
        await addDoc(collection(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects'), payload);
        showToast("Project saved to your dashboard!");
      }
      setProjectName('');
      setEditingId(null);
    } catch (error) {
      console.error("Error saving project:", error);
      showToast("Failed to save project.");
    }
    setIsSaving(false);
  };

  const handleEdit = (project) => {
    setProjectName(project.projectName);
    setEditingId(project.id);
    
    const conf = project.config;
    setText(conf.text || '');
    setSize(conf.size || '512x512');
    setErrorCorrection(conf.errorCorrection || 'H');
    setDarkColor(conf.darkColor || '#000000');
    setLightColor(conf.lightColor || '#FFFFFF');
    setMargin(conf.margin || '4');
    setCenterIcon(conf.centerIcon || 'None');
    setCustomLogoUrl(conf.customLogoUrl || null);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => handleGenerate(), 100);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects', id));
      showToast("Project deleted.");
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
        setErrorCorrection('H');
        showToast("Custom logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Please upload an image file (PNG, JPG, SVG).');
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
    <div className="max-w-[1200px] mx-auto px-6 pt-6">
      {/* Back Button */}
      <button 
        onClick={() => onViewChange('home')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-xs font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      {/* Tool Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2">QR Code Generator</h1>
        <p className="text-gray-400 text-sm">Generate QR codes instantly from any text or URL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Panel: Form Controls */}
        <div className="bg-[#121214] rounded-2xl p-6 border border-white/10 space-y-6">
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Text or URL</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text, URL, or any data..."
              className="w-full h-28 bg-[#18181b] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-3">Center Icon</label>
            <div className="grid grid-cols-4 gap-2.5">
              {icons.map((item) => (
                <div key={item.id} className="relative">
                  {item.id === 'Custom' ? (
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-full w-full flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer min-h-[58px] ${
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
                      <Upload className={`w-4 h-4 mb-1 ${isDragging ? 'animate-bounce' : ''}`} />
                      <span className="text-[11px] text-center">{customLogoUrl ? 'Uploaded' : 'Custom'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCenterIcon(item.id);
                        if (item.id !== 'None') setErrorCorrection('H');
                      }}
                      className={`w-full flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all min-h-[58px] ${
                        centerIcon === item.id 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      {item.id === 'None' ? (
                        <span className="text-xs font-medium">None</span>
                      ) : (
                        <>
                          {item.icon && <item.icon className="w-4 h-4 mb-1" />}
                          <span className="text-[11px]">{item.label}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {centerIcon !== 'None' && (
              <p className="text-[11px] text-gray-400 italic mt-2">Tip: use error correction "High" when adding a logo.</p>
            )}
          </div>

          <div className="pt-2 border-t border-white/5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-200">Advanced Options</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Size (px)</label>
                <select 
                  value={size} 
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="256x256">256px</option>
                  <option value="512x512">512px</option>
                  <option value="1024x1024">1024px</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Error Correction</label>
                <select 
                  value={errorCorrection} 
                  onChange={(e) => setErrorCorrection(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Dark Color</label>
                <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg overflow-hidden p-1 gap-2">
                  <input 
                    type="color" 
                    value={darkColor} 
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="w-7 h-7 bg-transparent cursor-pointer rounded border-0"
                  />
                  <input 
                    type="text" 
                    value={darkColor.toUpperCase()} 
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none w-full uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Light Color</label>
                 <div className="flex items-center bg-[#18181b] border border-white/10 rounded-lg overflow-hidden p-1 gap-2">
                  <input 
                    type="color" 
                    value={lightColor} 
                    onChange={(e) => setLightColor(e.target.value)}
                    className="w-7 h-7 bg-transparent cursor-pointer rounded border-0"
                  />
                  <input 
                    type="text" 
                    value={lightColor.toUpperCase()} 
                    onChange={(e) => setLightColor(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none w-full uppercase"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Margin</label>
              <select 
                value={margin} 
                onChange={(e) => setMargin(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.99] text-xs"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="bg-[#121214] rounded-2xl p-8 border border-white/10 flex flex-col items-center justify-center min-h-[460px] shadow-xl text-center relative">
          {!generatedUrl ? (
             <div className="flex flex-col items-center space-y-4">
               <div className="w-16 h-16 bg-[#18181b] border border-white/10 rounded-2xl flex items-center justify-center text-gray-600">
                 <QrCode className="w-8 h-8" />
               </div>
               <p className="text-sm font-medium text-gray-400">Your QR code will appear here</p>
             </div>
          ) : (
            <div className="flex flex-col items-center w-full space-y-6">
              <div className="relative inline-block bg-white p-4 rounded-2xl shadow-2xl border border-white/20">
                <img 
                  src={generatedUrl} 
                  alt="Generated QR Code" 
                  className="max-w-full h-auto rounded-lg max-h-[320px] object-contain"
                />
                
                {/* Overlay Icon Logic */}
                {centerIcon !== 'None' && centerIcon !== 'Custom' && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-2 rounded-lg shadow-md flex items-center justify-center border border-black/10" style={{ width: '22%', height: '22%' }}>
                        {icons.find(i => i.id === centerIcon)?.icon && React.createElement(icons.find(i => i.id === centerIcon).icon, { 
                          className: "w-full h-full text-black" 
                        })}
                      </div>
                   </div>
                )}

                {centerIcon === 'Custom' && customLogoUrl && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-2 rounded-lg shadow-md overflow-hidden flex items-center justify-center border border-black/10" style={{ width: '24%', height: '24%' }}>
                        <img src={customLogoUrl} alt="Custom Center Logo" className="w-full h-full object-contain" />
                      </div>
                   </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-sm">
                 <div className="grid grid-cols-2 gap-2.5">
                   <button 
                     onClick={handleDownloadPNG}
                     className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                   >
                     <Download className="w-4 h-4" /> Download PNG
                   </button>
                   <button 
                     onClick={handleDownloadSVG}
                     className="w-full bg-[#18181b] hover:bg-[#27272a] text-white border border-white/10 text-xs font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                   >
                     <Download className="w-4 h-4 text-blue-400" /> Download SVG
                   </button>
                 </div>

                 {user ? (
                    <div className="bg-[#18181b] border border-white/10 p-3 rounded-xl flex flex-col gap-2.5 text-left">
                      <label className="text-xs text-gray-300 font-semibold">Save to Dashboard</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           value={projectName}
                           onChange={(e) => setProjectName(e.target.value)}
                           placeholder="Project Name (e.g. Website QR)"
                           className="flex-1 bg-[#121214] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                         />
                         <button 
                           onClick={handleSaveProject}
                           disabled={isSaving || !projectName.trim()}
                           className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                         >
                           <Save className="w-3.5 h-3.5" />
                           {editingId ? 'Update' : 'Save'}
                         </button>
                      </div>
                    </div>
                 ) : (
                    <p className="text-xs text-center text-gray-500">
                      Sign in with Google to save projects & track analytics.
                    </p>
                 )}
              </div>
            </div>
          )}
        </div>

      </div>

      {user && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <Activity className="w-5 h-5 text-blue-500" />
               Your Saved Projects
             </h2>
          </div>
          
          {savedProjects.length === 0 ? (
             <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                  <BarChart2 className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-xs text-gray-400">You haven't saved any QR codes yet. Generate and save one above!</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedProjects.map((project) => (
                   <div key={project.id} className={`bg-[#121214] border rounded-2xl p-5 transition-all ${editingId === project.id ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="flex justify-between items-start mb-4">
                         <div>
                           <h3 className="text-sm font-semibold text-white mb-1">{project.projectName}</h3>
                           <p className="text-[10px] text-gray-500">
                              Created {new Date(project.createdAt || Date.now()).toLocaleDateString()}
                           </p>
                         </div>
                         <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(project)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit Design">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(project.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Project">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-[#18181b] p-3 rounded-xl border border-white/5">
                         <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                           <Activity className="w-5 h-5 text-blue-500" />
                         </div>
                         <div>
                            <p className="text-lg font-bold text-white">{project.scans?.toLocaleString() || 0}</p>
                            <p className="text-[10px] text-gray-400">Total Scans (Analytics)</p>
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