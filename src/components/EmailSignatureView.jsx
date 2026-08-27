import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Copy, Download, Sparkles, 
  Code, BookmarkCheck, Trash2, CheckCircle2, LayoutTemplate 
} from 'lucide-react';

const TEMPLATES = [
  { id: 1, name: "Minimal Professional", desc: "Clean & standard corporate" },
  { id: 2, name: "Corporate Left Accent", desc: "Vertical brand bar" },
  { id: 3, name: "Modern Centered", desc: "Symmetric center-aligned" },
  { id: 4, name: "Premium Dark", desc: "Optimized for dark mode" },
  { id: 5, name: "Creative Personal Brand", desc: "Circular initial avatar" },
  { id: 6, name: "Split Layout with Photo", desc: "Side-by-side profile picture" },
];

export default function EmailSignatureView({ showToast }) {
  const navigate = useNavigate();
  const signatureRef = useRef(null);

  const [templateId, setTemplateId] = useState(1);
  const [signatureName, setSignatureName] = useState("Work Signature");
  const [savedList, setSavedList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "Aarav Mehta",
    jobTitle: "Head of Product Design",
    company: "Northwind Studio",
    phone: "+1 (415) 555-0132",
    mobile: "+1 (415) 555-0199",
    email: "aarav@northwind.studio",
    website: "www.northwind.studio",
    address: "220 Market Street, San Francisco, CA",
    tagline: "Designing calm interfaces for ambitious teams.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
  });

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('saved_email_signatures') || '[]');
    setSavedList(loaded);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateHtml = () => {
    switch (templateId) {
      case 2:
        return `
          <table cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 14px; line-height: 1.5;">
            <tr>
              <td style="width: 4px; background-color: #4f46e5; padding: 0;"></td>
              <td style="padding-left: 16px;">
                <div style="font-weight: 700; font-size: 16px; color: #111;">${formData.fullName}</div>
                <div style="color: #4f46e5; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${formData.jobTitle} | ${formData.company}</div>
                <div style="font-size: 12px; color: #555; margin-bottom: 8px;">${formData.tagline}</div>
                <div style="font-size: 12px; color: #444;">
                  ${formData.phone ? `Phone: ${formData.phone}<br/>` : ''}
                  ${formData.email ? `Email: <a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a><br/>` : ''}
                  ${formData.website ? `Web: <a href="https://${formData.website}" style="color: #4f46e5; text-decoration: none;">${formData.website}</a>` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
      case 3:
        return `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 14px; line-height: 1.5; text-align: center;">
            <div style="font-weight: 700; font-size: 17px; color: #111; margin-bottom: 2px;">${formData.fullName}</div>
            <div style="color: #4f46e5; font-weight: 600; font-size: 13px; margin-bottom: 6px;">${formData.jobTitle} &bull; ${formData.company}</div>
            <div style="font-size: 12px; color: #666; font-style: italic; margin-bottom: 12px;">"${formData.tagline}"</div>
            <div style="font-size: 12px; color: #444;">
              ${formData.phone ? `${formData.phone} &bull; ` : ''}
              ${formData.email ? `<a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a> &bull; ` : ''}
              ${formData.website ? `<a href="https://${formData.website}" style="color: #4f46e5; text-decoration: none;">${formData.website}</a>` : ''}
            </div>
          </div>
        `;
      case 4:
        return `
          <table cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f1115; color: #f3f4f6; font-size: 14px; line-height: 1.5; padding: 16px; border-radius: 8px;">
            <tr>
              <td>
                <div style="font-weight: 700; font-size: 16px; color: #ffffff;">${formData.fullName}</div>
                <div style="color: #818cf8; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${formData.jobTitle} &bull; <span style="color: #9ca3af;">${formData.company}</span></div>
                <div style="font-size: 12px; color: #9ca3af; margin-bottom: 10px;">${formData.tagline}</div>
                <div style="font-size: 12px; color: #d1d5db;">
                  ${formData.phone ? `T: <a href="tel:${formData.phone}" style="color: #818cf8; text-decoration: none;">${formData.phone}</a><br/>` : ''}
                  ${formData.email ? `E: <a href="mailto:${formData.email}" style="color: #818cf8; text-decoration: none;">${formData.email}</a><br/>` : ''}
                  ${formData.website ? `W: <a href="https://${formData.website}" style="color: #818cf8; text-decoration: none;">${formData.website}</a>` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
      case 5:
        return `
          <table cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 14px; line-height: 1.5;">
            <tr>
              <td style="padding-right: 14px; vertical-align: top;">
                <div style="width: 48px; height: 48px; background: #4f46e5; color: #fff; font-weight: bold; border-radius: 50%; text-align: center; line-height: 48px; font-size: 18px;">${formData.fullName.charAt(0)}</div>
              </td>
              <td style="vertical-align: top; border-left: 2px solid #e5e7eb; padding-left: 14px;">
                <div style="font-weight: 700; font-size: 16px; color: #111;">${formData.fullName}</div>
                <div style="color: #4f46e5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${formData.jobTitle}</div>
                <div style="font-size: 12px; color: #555; margin-bottom: 8px;">${formData.tagline}</div>
                <div style="font-size: 12px; color: #444;">
                  ${formData.email ? `<a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a> &bull; ` : ''}
                  ${formData.website ? `<a href="https://${formData.website}" style="color: #4f46e5; text-decoration: none;">${formData.website}</a>` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
      case 6:
        return `
          <table cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 14px; line-height: 1.5;">
            <tr>
              <td style="padding-right: 16px; vertical-align: top;">
                <img src="${formData.avatarUrl}" alt="${formData.fullName}" width="64" height="64" style="border-radius: 50%; object-fit: cover; display: block;" />
              </td>
              <td style="vertical-align: top;">
                <div style="font-weight: 700; font-size: 16px; color: #111;">${formData.fullName}</div>
                <div style="color: #4f46e5; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${formData.jobTitle} &bull; ${formData.company}</div>
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">${formData.tagline}</div>
                <div style="font-size: 12px; color: #444;">
                  ${formData.phone ? `P: ${formData.phone}<br/>` : ''}
                  ${formData.email ? `E: <a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a>` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
      default:
        return `
          <table cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; font-size: 14px; line-height: 1.5;">
            <tr>
              <td style="padding-right: 16px; vertical-align: top;">
                <div style="font-weight: 700; font-size: 16px; color: #111;">${formData.fullName}</div>
                <div style="color: #4f46e5; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${formData.jobTitle} &bull; <span style="color: #555;">${formData.company}</span></div>
                <div style="color: #666; font-size: 12px; font-style: italic; margin-bottom: 10px;">${formData.tagline}</div>
                <div style="font-size: 12px; color: #444;">
                  ${formData.phone ? `T: <a href="tel:${formData.phone}" style="color: #4f46e5; text-decoration: none;">${formData.phone}</a><br/>` : ''}
                  ${formData.email ? `E: <a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a><br/>` : ''}
                  ${formData.website ? `W: <a href="https://${formData.website}" style="color: #4f46e5; text-decoration: none;">${formData.website}</a><br/>` : ''}
                  ${formData.address ? `A: ${formData.address}` : ''}
                </div>
              </td>
            </tr>
          </table>
        `;
    }
  };

  const handleCopySignature = async () => {
    if (!signatureRef.current) return;
    const range = document.createRange();
    range.selectNode(signatureRef.current);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    try {
      document.execCommand('copy');
      if (showToast) showToast("Signature copied to clipboard! Paste directly into your email client.");
    } catch {
      if (showToast) showToast("Failed to copy signature.");
    }
    window.getSelection().removeAllRanges();
  };

  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(generateHtml());
    if (showToast) showToast("Raw HTML copied to clipboard!");
  };

  const handleSaveSignature = () => {
    if (!signatureName.trim()) {
      if (showToast) showToast("Please provide a name for this signature file.");
      return;
    }
    const newSignature = {
      id: Date.now(),
      name: signatureName.trim(),
      templateId,
      formData,
      html: generateHtml(),
      createdAt: new Date().toLocaleDateString()
    };
    const updated = [newSignature, ...savedList];
    setSavedList(updated);
    localStorage.setItem('saved_email_signatures', JSON.stringify(updated));
    if (showToast) showToast(`Saved signature as "${signatureName}"!`);
  };

  const handleLoadSignature = (item) => {
    setTemplateId(item.templateId);
    setFormData(item.formData);
    setSignatureName(item.name);
    if (showToast) showToast(`Loaded "${item.name}"`);
  };

  const handleDeleteSignature = (e, id) => {
    e.stopPropagation();
    const updated = savedList.filter(item => item.id !== id);
    setSavedList(updated);
    localStorage.setItem('saved_email_signatures', JSON.stringify(updated));
    if (showToast) showToast("Signature deleted.");
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generateHtml()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${signatureName.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast("HTML file downloaded!");
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col overflow-y-auto custom-scrollbar relative z-10 animate-fade-in-up">
      
      {/* Top Navbar */}
      <div className="w-full h-16 bg-[#121212] border-b border-[#222] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium bg-[#1a1a1a] px-3 py-2 rounded-xl border border-[#333]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">Email Signature Generator</h1>
          </div>
        </div>
      </div>

      <main className="max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* Top Full-Width Template Selector Bar */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" /> Choose Signature Template Style ({TEMPLATES.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {TEMPLATES.map(t => {
              const isSelected = templateId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`group relative text-left p-3 rounded-2xl border transition-all flex flex-col justify-between
                    ${isSelected 
                      ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.15)]' 
                      : 'bg-[#0A0A0A] border-[#333] hover:border-gray-600 hover:bg-[#121212]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-500 text-white' : 'bg-[#222] text-gray-400'}`}>
                      0{t.id}
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold transition-colors truncate ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                      {t.name}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Form Panel */}
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[72vh] custom-scrollbar">
            
            {/* File Name & Save Box */}
            <div className="bg-[#0A0A0A] border border-[#333] p-4 rounded-2xl space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Signature File Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={signatureName} 
                  onChange={(e) => setSignatureName(e.target.value)} 
                  placeholder="e.g. Work Signature" 
                  className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={handleSaveSignature}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 shrink-0"
                >
                  <BookmarkCheck className="w-4 h-4" /> Save
                </button>
              </div>

              {savedList.length > 0 && (
                <div className="pt-2 border-t border-[#222]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Saved Files ({savedList.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                    {savedList.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => handleLoadSignature(item)}
                        className="group flex items-center gap-1.5 bg-[#18181f] hover:bg-[#22222d] border border-[#333] px-2.5 py-1 rounded-lg text-xs text-gray-300 cursor-pointer transition"
                      >
                        <span className="font-semibold text-indigo-400">{item.name}</span>
                        <button onClick={(e) => handleDeleteSignature(e, item.id)} className="text-gray-500 hover:text-rose-400 ml-1">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Your Details</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Job Title</label>
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Company</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400">Website</label>
                  <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400">Bio / Tagline</label>
                <textarea name="tagline" rows={2} value={formData.tagline} onChange={handleChange} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-6 shadow-2xl flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</h3>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{signatureName}</span>
                </div>
                <div className={`p-6 rounded-2xl shadow-xl min-h-[220px] flex items-center ${templateId === 4 ? 'bg-[#0f1115]' : 'bg-white'}`}>
                  <div ref={signatureRef} className="w-full" dangerouslySetInnerHTML={{ __html: generateHtml() }} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopySignature}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Signature
                  </button>
                  <button 
                    onClick={handleCopyHtml}
                    className="bg-[#222] hover:bg-[#333] text-white font-bold text-xs px-4 py-3 rounded-xl border border-[#333] transition-colors flex items-center gap-1.5"
                  >
                    <Code className="w-4 h-4" /> HTML
                  </button>
                  <button 
                    onClick={handleDownloadHtml}
                    className="bg-[#222] hover:bg-[#333] text-white font-bold text-xs px-4 py-3 rounded-xl border border-[#333] transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> .HTML
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 text-center">
                  Tip: Click "Copy Signature" and paste directly into Gmail or Outlook settings.
                </p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}