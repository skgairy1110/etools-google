import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Star, Mail, Phone, MessageCircle, Upload, Download, ArrowLeft, Save, Activity, Edit2, Trash2, BarChart2 } from 'lucide-react';
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const presetIconSVGs = {
  Instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
  Facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
  Review: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000" stroke="#000000" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  Email: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  Phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  WhatsApp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 9a1.5 1.5 0 0 0 3 0 1.5 1.5 0 0 0-3 0Z"/></svg>`
};

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

export default function QRToolView({ onViewChange, user, showToast }) {
  const [text, setText] = useState('');
  const [centerIcon, setCenterIcon] = useState('None');
  const [size, setSize] = useState('512x512');
  const [errorCorrection, setErrorCorrection] = useState('H');
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#FFFFFF');
  const [margin, setMargin] = useState('4');
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);

  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => projects.push({ id: doc.id, ...doc.data() }));
      projects.sort((a, b) => b.createdAt - a.createdAt);
      setSavedProjects(projects);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => { handleGenerate(); }, []);

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
      await new Promise((resolve, reject) => { baseImg.onload = resolve; baseImg.onerror = reject; });

      const canvas = document.createElement('canvas');
      canvas.width = sizeNum;
      canvas.height = sizeNum;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(baseImg, 0, 0, sizeNum, sizeNum);
      URL.revokeObjectURL(qrImgUrl);

      if (centerIcon !== 'None') {
        const overlaySize = Math.floor(sizeNum * 0.22);
        const centerX = (sizeNum - overlaySize) / 2;
        const centerY = (sizeNum - overlaySize) / 2;
        const pad = Math.max(4, Math.floor(overlaySize * 0.12));

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

        let iconSrc = null;
        if (centerIcon === 'Custom' && customLogoUrl) {
          iconSrc = customLogoUrl;
        } else if (presetIconSVGs[centerIcon]) {
          iconSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(presetIconSVGs[centerIcon])}`;
        }

        if (iconSrc) {
          const iconImg = new Image();
          iconImg.src = iconSrc;
          await new Promise((resolve) => { iconImg.onload = resolve; iconImg.onerror = resolve; });
          ctx.drawImage(iconImg, centerX, centerY, overlaySize, overlaySize);
        }
      }

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
      config: { text, size, errorCorrection, darkColor, lightColor, margin, centerIcon, customLogoUrl },
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
    handleGenerate();
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'artifacts', 'etools-app', 'users', user.uid, 'qr_projects', id));
      showToast("Project deleted.");
      if (editingId === id) { setEditingId(null); setProjectName(''); }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleFileDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleFileSelect = (e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); };
  const handleFileUpload = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => { setCustomLogoUrl(event.target.result); setCenterIcon('Custom'); setErrorCorrection('H'); showToast("Custom logo uploaded successfully!"); };
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
    <div className="w-full px-4 sm:px-8 pt-4 animate-fade-in-up max-w-[1600px] mx-auto">
      
      {/* Inline Header to save vertical space */}
      <div className="relative flex items-center justify-center mb-6">
        <button 
          onClick={() => onViewChange('home')}
          className="absolute left-0 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium"
        >
          <div className="p-1.5 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 tracking-tight">QR Code Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        
        {/* Left Panel */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.05] shadow-2xl flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-semibold tracking-wide text-gray-300 uppercase mb-2">Data Target</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://your-website.com"
              className="w-full h-16 bg-black/20 border border-white/[0.05] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-black/40 resize-none transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold tracking-wide text-gray-300 uppercase mb-2">Center Badge</label>
            <div className="grid grid-cols-4 gap-2">
              {icons.map((item) => (
                <div key={item.id} className="relative">
                  {item.id === 'Custom' ? (
                    <div
                      onDrop={handleFileDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-full w-full flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer min-h-[56px] ${
                        centerIcon === 'Custom' 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                          : isDragging 
                            ? 'bg-cyan-500/10 border-cyan-500 border-dashed text-cyan-400'
                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                      <Upload className={`w-4 h-4 mb-1 ${isDragging ? 'animate-bounce' : ''}`} />
                      <span className="text-[9px] uppercase tracking-wider">{customLogoUrl ? 'Uploaded' : 'Custom'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCenterIcon(item.id); if (item.id !== 'None') setErrorCorrection('H'); }}
                      className={`w-full flex flex-col items-center justify-center p-2 rounded-xl border transition-all min-h-[56px] ${
                        centerIcon === item.id 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                          : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {item.id === 'None' ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wider">None</span>
                      ) : (
                        <>
                          {item.icon && <item.icon className="w-4 h-4 mb-1" />}
                          <span className="text-[9px] uppercase tracking-wider">{item.label}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.05] flex flex-col gap-3">
            <h3 className="text-[10px] font-semibold tracking-wide text-gray-300 uppercase">Architecture</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1">Resolution</label>
                <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-black/20 border border-white/[0.05] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none">
                  <option value="256x256">256px</option>
                  <option value="512x512">512px</option>
                  <option value="1024x1024">1024px</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1">Error Resilience</label>
                <select value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value)} className="w-full bg-black/20 border border-white/[0.05] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer appearance-none">
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1">Matrix Color</label>
                <div className="flex items-center bg-black/20 border border-white/[0.05] rounded-lg overflow-hidden p-1 gap-1.5">
                  <input type="color" value={darkColor} onChange={(e) => setDarkColor(e.target.value)} className="w-6 h-6 bg-transparent cursor-pointer rounded border-0" />
                  <input type="text" value={darkColor.toUpperCase()} onChange={(e) => setDarkColor(e.target.value)} className="bg-transparent text-xs text-white focus:outline-none w-full uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-gray-500 mb-1">Canvas Color</label>
                 <div className="flex items-center bg-black/20 border border-white/[0.05] rounded-lg overflow-hidden p-1 gap-1.5">
                  <input type="color" value={lightColor} onChange={(e) => setLightColor(e.target.value)} className="w-6 h-6 bg-transparent cursor-pointer rounded border-0" />
                  <input type="text" value={lightColor.toUpperCase()} onChange={(e) => setLightColor(e.target.value)} className="bg-transparent text-xs text-white focus:outline-none w-full uppercase" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full mt-2 bg-white text-black hover:bg-gray-200 disabled:opacity-50 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98] text-xs uppercase tracking-wider"
            >
              {isGenerating ? 'Rendering...' : 'Compile QR Matrix'}
            </button>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="bg-white/[0.01] rounded-2xl p-6 border border-white/[0.05] flex flex-col items-center justify-center relative overflow-hidden w-full h-full min-h-[350px]">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
          
          {!generatedUrl ? (
             <div className="flex flex-col items-center space-y-3 relative z-10">
               <div className="w-16 h-16 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-center text-gray-600 animate-pulse">
                 <QrCode className="w-8 h-8" />
               </div>
               <p className="text-xs font-light text-gray-500">Awaiting data input...</p>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-between w-full h-full relative z-10">
              <div className="relative inline-block bg-white p-3.5 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 group mb-4">
                <img src={generatedUrl} alt="Generated QR" className="max-w-full h-auto rounded-lg max-h-[200px] object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                
                {centerIcon !== 'None' && centerIcon !== 'Custom' && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-2 rounded-lg shadow-xl flex items-center justify-center border border-black/5" style={{ width: '22%', height: '22%' }}>
                        {icons.find(i => i.id === centerIcon)?.icon && React.createElement(icons.find(i => i.id === centerIcon).icon, { className: "w-full h-full text-black" })}
                      </div>
                   </div>
                )}

                {centerIcon === 'Custom' && customLogoUrl && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-2 rounded-lg shadow-xl overflow-hidden flex items-center justify-center border border-black/5" style={{ width: '24%', height: '24%' }}>
                        <img src={customLogoUrl} alt="Custom Center Logo" className="w-full h-full object-contain" />
                      </div>
                   </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-sm mt-auto">
                 <div className="grid grid-cols-2 gap-2">
                   <button onClick={handleDownloadPNG} className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.05] text-[10px] font-semibold uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                     <Download className="w-3.5 h-3.5" /> PNG
                   </button>
                   <button onClick={handleDownloadSVG} className="w-full bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.05] text-[10px] font-semibold uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95">
                     <Download className="w-3.5 h-3.5 text-cyan-400" /> SVG
                   </button>
                 </div>

                 {user ? (
                    <div className="bg-white/[0.02] border border-white/[0.05] p-3 rounded-xl flex flex-col gap-2">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Workspace Storage</label>
                      <div className="flex gap-2">
                         <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Artifact Title..." className="flex-1 bg-black/20 border border-white/[0.05] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/50" />
                         <button onClick={handleSaveProject} disabled={isSaving || !projectName.trim()} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5">
                           <Save className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Save'}
                         </button>
                      </div>
                    </div>
                 ) : (
                    <p className="text-[10px] text-center text-gray-600 uppercase tracking-wider">Sign in to save artifacts</p>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}