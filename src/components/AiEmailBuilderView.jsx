import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Sparkles, Download, Copy, Loader2, 
  LayoutTemplate, ImagePlus, Upload, Check, Wand2, Save, ArrowRight
} from 'lucide-react';

const GOALS = ["Announce a launch", "Drive a sale", "Build awareness", "Onboard new users", "Re-engage users", "Invite to event"];
const TONES = ["Friendly", "Professional", "Bold", "Persuasive", "Playful", "Minimal"];

const TEMPLATES = [
  { id: "single-launch", name: "Single Column · Launch", desc: "Classic 1-column launch with hero", columns: 1, img: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80&auto=format&fit=crop" },
  { id: "single-welcome", name: "Single Column · Welcome", desc: "Warm 1-column onboarding", columns: 1, img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80&auto=format&fit=crop" },
  { id: "single-digest", name: "Single Column · Digest", desc: "Long-form reading digest", columns: 1, img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80&auto=format&fit=crop" },
  { id: "two-feature", name: "Two Column · Feature", desc: "Image + text side-by-side", columns: 2, img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop" },
  { id: "two-sale", name: "Two Column · Flash Sale", desc: "Promo split with bold CTA", columns: 2, img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&auto=format&fit=crop" },
  { id: "two-event", name: "Two Column · Event", desc: "Event details + image", columns: 2, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80&auto=format&fit=crop" },
  { id: "three-grid", name: "Three Column · Feature Grid", desc: "Three benefits side-by-side", columns: 3, img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80&auto=format&fit=crop" },
  { id: "three-proof", name: "Three Column · Social Proof", desc: "Three testimonials/stats", columns: 3, img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop" },
];

export default function AiEmailBuilderView({ showToast }) {
  const navigate = useNavigate();
  const logoRef = useRef(null);

  const [step, setStep] = useState(1);
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [keyMessage, setKeyMessage] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [logo, setLogo] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [genImageLoading, setGenImageLoading] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState(0);

  const [email, setEmail] = useState(null);

  const onLogoFile = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => setLogo(String(e.target?.result || ""));
    r.readAsDataURL(f);
  };

  const generateHeroImage = () => {
    setGenImageLoading(true);
    setTimeout(() => {
      const mockImages = [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80&auto=format&fit=crop"
      ];
      const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
      setTemplate(t => ({ ...t, img: randomImg }));
      setEmail(prev => prev ? { ...prev, heroImage: randomImg } : prev);
      setGenImageLoading(false);
      if (showToast) showToast("Hero image generated successfully!");
    }, 600);
  };

  const generate = () => {
    if (!product.trim()) {
      if (showToast) showToast("Product name is required.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const generatedData = {
        subjectLines: [
          `Introducing ${product} — Your new secret weapon`,
          `Ready to transform how you ${goal.toLowerCase()}?`,
          `Discover what's possible with ${product}`
        ],
        preheader: `Built specifically for ${audience || 'modern teams'}. Check out what is new.`,
        headline: `Supercharge Your Workflow with ${product}`,
        subheadline: `Designed with a ${tone.toLowerCase()} approach to help you achieve your goals faster.`,
        bodyParagraphs: [
          `We built ${product} to solve the exact friction points you face every day. Whether you are scaling up or streamlining your process, our tool delivers results.`,
          `Join thousands of satisfied users who have already upgraded their daily routine.`
        ],
        bullets: template.columns === 1 ? [
          "Lightning fast performance & zero configuration",
          "Enterprise security standards built right in",
          "24/7 dedicated support team ready to assist"
        ] : [
          "⚡ Speed: Deploy in seconds with automated workflows.",
          "🔒 Security: Enterprise-grade encryption by default.",
          "📈 Growth: Advanced metrics to track your progress."
        ],
        ctaLabel: "Get Started", // Shorter cleaner CTA
        ctaUrl: "https://example.com",
        footerNote: `You received this email because you signed up for updates regarding ${product}. Unsubscribe at any time.`,
        heroImage: template.img,
        logo: logo,
        columns: template.columns
      };
      setEmail(generatedData);
      setActiveSubject(0);
      setStep(3);
      setLoading(false);
      if (showToast) showToast("Email generated successfully! Click any text to edit inline.");
    }, 800);
  };

  const update = (key, value) => {
    setEmail(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const buildHtml = (e) => {
    const cols = e.columns || 1;
    const bulletsHtml = cols === 1
      ? (e.bullets?.length ? `<ul style="padding-left:20px;margin:0 0 24px;">${e.bullets.map((b) => `<li style="margin-bottom:8px;font-size:15px;">${b}</li>`).join("")}</ul>` : "")
      : `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;"><tr>${e.bullets.slice(0, cols).map((b) => `<td valign="top" style="padding:8px;width:${Math.floor(100/cols)}%;font-size:14px;line-height:1.5;color:#333;"><div style="font-weight:600;margin-bottom:6px;color:#111;">${b.split(":")[0] || b}</div><div>${b.includes(":") ? b.split(":").slice(1).join(":").trim() : ""}</div></td>`).join("")}</tr></table>`;
    return `<!doctype html>
<html><head><meta charset="utf-8"><title>${e.subjectLines[activeSubject] || ""}</title></head>
<body style="margin:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  ${e.logo ? `<div style="padding:18px 28px;border-bottom:1px solid #eee;"><img src="${e.logo}" alt="logo" style="max-height:36px;display:block;"/></div>` : ""}
  ${e.heroImage ? `<img src="${e.heroImage}" alt="" style="width:100%;display:block;"/>` : ""}
  <div style="padding:32px 28px;">
    <h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;">${e.headline}</h1>
    <p style="margin:0 0 24px;color:#666;font-size:16px;">${e.subheadline}</p>
    ${e.bodyParagraphs.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${p}</p>`).join("")}
    ${bulletsHtml}
    <p style="margin:24px 0;text-align:center;">
      <a href="${e.ctaUrl}" style="background:linear-gradient(135deg,#a3ff7c,#c084fc);color:#0a0a0a;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;display:inline-block;">${e.ctaLabel}</a>
    </p>
    <p style="margin:32px 0 0;color:#888;font-size:13px;">${e.footerNote}</p>
  </div>
</div></body></html>`;
  };

  const exportHtml = () => {
    if (!email) return;
    const blob = new Blob([buildHtml(email)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(buildHtml(email));
    if (showToast) showToast("HTML copied to clipboard!");
  };

  const Editable = ({ value, onChange, as = "p", className = "" }) => {
    const Tag = as;
    return (
      <Tag
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.textContent || "")}
        className={`outline-none focus:ring-2 focus:ring-[#a3ff7c]/50 rounded px-1 -mx-1 hover:bg-[#a3ff7c]/5 transition ${className}`}
      >
        {value}
      </Tag>
    );
  };

  const StepDot = ({ n, label }) => {
    const active = step === n;
    const done = step > n;
    return (
      <button
        onClick={() => (done || active ? setStep(n) : null)}
        className={`flex items-center gap-2 text-sm font-medium transition ${active ? "opacity-100 text-white" : "opacity-60 hover:opacity-90 text-gray-400"}`}
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active || done ? "bg-gradient-to-br from-[#a3ff7c] to-[#c084fc] text-black" : "bg-[#222] text-gray-400"}`}>
          {done ? <Check className="w-4 h-4" /> : n}
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col relative overflow-y-auto custom-scrollbar z-10 animate-fade-in-up">
      
      {/* Top Navbar */}
      <div className="w-full h-16 bg-[#121212] border-b border-[#222] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium bg-[#1a1a1a] px-3 py-2 rounded-xl border border-[#333]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">AI Email Builder Studio</h1>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 relative">

        {/* Stepper Card */}
        <div className="p-4 mb-6 rounded-2xl border border-[#333] bg-[#141414] shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <StepDot n={1} label="Campaign details" />
            <div className="flex-1 h-px bg-[#333]" />
            <StepDot n={2} label="Pick template" />
            <div className="flex-1 h-px bg-[#333]" />
            <StepDot n={3} label="Preview & edit" />
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-4 max-w-2xl mx-auto shadow-2xl">
            <h2 className="font-bold text-lg text-white">Step 1 · Campaign details</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Campaign name</label>
              <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. April launch blast" className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Product / Service name *</label>
              <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g. Mailchimp Pro" className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Target audience</label>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. small business owners" className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Goal</label>
                <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Key message (optional)</label>
              <textarea value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} rows={3} placeholder="Specific points to highlight..." className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Logo (optional)</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => logoRef.current?.click()} className="bg-[#222] hover:bg-[#333] text-white text-xs px-4 py-2 rounded-xl border border-[#444] transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />{logo ? "Replace logo" : "Upload logo"}
                </button>
                {logo && <img src={logo} alt="logo" className="h-8 bg-white p-1 rounded border" />}
                {logo && <button onClick={() => setLogo("")} className="text-xs text-rose-400 hover:underline">Remove</button>}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogoFile(e.target.files?.[0])} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Hero image — generate with AI (optional)</label>
              <div className="flex gap-2">
                <input value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Describe the hero image..." className="flex-1 bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
                <button type="button" onClick={generateHeroImage} disabled={genImageLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors">
                  {genImageLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Wand2 className="w-3.5 h-3.5" />Generate</>}
                </button>
              </div>
              {template.img && <img src={template.img} alt="" className="w-full h-32 object-cover rounded-xl border border-[#333] mt-2" />}
            </div>

            <button onClick={() => setStep(2)} disabled={!product.trim()} className="w-full bg-gradient-to-r from-[#a3ff7c] to-[#c084fc] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
              Next: Choose template <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-bold text-lg text-white">Step 2 · Pick a template</h2>
              <span className="text-xs text-indigo-400 flex items-center gap-1"><LayoutTemplate className="w-3.5 h-3.5" />{template.name}</span>
            </div>

            {([1, 2, 3]).map((cols) => (
              <div key={cols} className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cols} Column{cols > 1 ? "s" : ""}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {TEMPLATES.filter((t) => t.columns === cols).map((t) => (
                    <button key={t.id} onClick={() => setTemplate(t)} className={`text-left rounded-2xl overflow-hidden border-2 transition hover:shadow-xl bg-[#0A0A0A] ${template.id === t.id ? "border-[#a3ff7c] ring-2 ring-[#c084fc]/40" : "border-[#333]"}`}>
                      <img src={t.img} alt={t.name} className="w-full h-28 object-cover" loading="lazy" />
                      <div className="p-3">
                        <div className="font-bold text-xs text-white">{t.name}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-3">
              <button onClick={() => setStep(1)} className="bg-[#222] hover:bg-[#333] text-white text-xs px-5 py-3 rounded-xl border border-[#444] transition-colors flex items-center gap-1.5 font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={generate} disabled={loading} className="flex-1 bg-gradient-to-r from-[#a3ff7c] to-[#c084fc] text-black font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Email...</> : <><Sparkles className="w-4 h-4" /> Generate Email with AI</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && email && (
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-lg text-white">Step 3 · Preview & edit</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setStep(2)} className="bg-[#222] hover:bg-[#333] text-white text-xs px-3 py-2 rounded-xl border border-[#444] flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Templates
                </button>
                <button onClick={generate} disabled={loading} className="bg-[#222] hover:bg-[#333] text-white text-xs px-3 py-2 rounded-xl border border-[#444] flex items-center gap-1">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Regenerate</>}
                </button>
                <button onClick={copyHtml} className="bg-[#222] hover:bg-[#333] text-white text-xs px-3 py-2 rounded-xl border border-[#444] flex items-center gap-1">
                  <Copy className="w-3.5 h-3.5" /> Copy HTML
                </button>
                <button onClick={exportHtml} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1 transition-all">
                  <Download className="w-3.5 h-3.5" /> Export HTML
                </button>
              </div>
            </div>

            <p className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl flex items-center gap-1.5">
              <ImagePlus className="w-3.5 h-3.5 shrink-0" /> Click any headline, paragraph, or button text in the preview below to edit inline!
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject lines ({email.subjectLines.length} options)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {email.subjectLines.map((s, i) => (
                    <button key={i} onClick={() => setActiveSubject(i)} className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition ${activeSubject === i ? "bg-gradient-to-r from-[#a3ff7c] to-[#c084fc] text-black border-transparent shadow" : "bg-[#0A0A0A] hover:bg-[#1a1a1a] text-gray-300 border-[#333]"}`}>{s}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Preheader: <Editable as="span" value={email.preheader} onChange={(v) => update("preheader", v)} /></p>
              </div>

              {/* Live Interactive Email Card Preview */}
              <div className="rounded-2xl border border-gray-200 bg-white text-[#1a1a1a] overflow-hidden max-w-[640px] mx-auto shadow-2xl">
                {email.logo && <div className="px-7 py-4 border-b border-gray-100"><img src={email.logo} alt="logo" className="h-9" /></div>}
                {email.heroImage && <img src={email.heroImage} alt="" className="w-full h-44 object-cover" />}
                <div className="p-7 space-y-4">
                  <Editable as="h1" className="text-2xl font-bold leading-tight" value={email.headline} onChange={(v) => update("headline", v)} />
                  <Editable as="p" className="text-[#666] text-base" value={email.subheadline} onChange={(v) => update("subheadline", v)} />
                  
                  {email.bodyParagraphs.map((p, i) => (
                    <Editable key={i} as="p" className="text-[15px] leading-relaxed text-gray-700" value={p} onChange={(v) => {
                      const next = [...email.bodyParagraphs]; next[i] = v; update("bodyParagraphs", next);
                    }} />
                  ))}

                  {email.bullets?.length > 0 && (email.columns || 1) === 1 && (
                    <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                      {email.bullets.map((b, i) => (
                        <Editable key={i} as="li" className="text-[15px]" value={b} onChange={(v) => {
                          const next = [...email.bullets]; next[i] = v; update("bullets", next);
                        }} />
                      ))}
                    </ul>
                  )}

                  {(email.columns || 1) > 1 && (
                    <div className={`grid gap-4 pt-2 ${email.columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                      {email.bullets.slice(0, email.columns).map((b, i) => (
                        <div key={i} className="text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <Editable as="p" className="font-bold text-[#111] mb-1" value={(b.split(":")[0] || b)} onChange={(v) => {
                            const rest = b.includes(":") ? ": " + b.split(":").slice(1).join(":").trim() : "";
                            const next = [...email.bullets]; next[i] = v + rest; update("bullets", next);
                          }} />
                          <Editable as="p" className="text-[#555] text-xs leading-relaxed" value={b.includes(":") ? b.split(":").slice(1).join(":").trim() : "Add description..."} onChange={(v) => {
                            const head = b.split(":")[0] || b;
                            const next = [...email.bullets]; next[i] = head + ": " + v; update("bullets", next);
                          }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 text-center">
                    <div className="max-w-[220px] mx-auto">
                      <span className="block font-bold py-3 rounded-xl shadow-lg cursor-pointer text-sm" style={{ background: "linear-gradient(135deg,#a3ff7c,#c084fc)", color: "#0a0a0a" }}>
                        <Editable as="span" value={email.ctaLabel} onChange={(v) => update("ctaLabel", v)} />
                      </span>
                    </div>
                  </div>

                  <Editable as="p" className="text-xs text-[#888] pt-4 text-center border-t border-gray-100 mt-6" value={email.footerNote} onChange={(v) => update("footerNote", v)} />
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}