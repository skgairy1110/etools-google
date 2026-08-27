import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Camera, Monitor, Tablet, Smartphone, 
  Download, Globe, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

const normalizeUrl = (raw) => {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
};

export default function WebsiteScreenshotView({ showToast }) {
  const navigate = useNavigate();

  const [url, setUrl] = useState("https://example.com");
  const [device, setDevice] = useState("desktop");
  const [format, setFormat] = useState("png");
  const [fullPage, setFullPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [capturedFor, setCapturedFor] = useState("");
  const [screenshotSize, setScreenshotSize] = useState("");

  useEffect(() => {
    if (!loading) return;
    const maxProgress = stage === "downloading" ? 94 : 86;
    const timer = window.setInterval(() => {
      setProgress((value) => Math.min(value + (fullPage ? 3 : 6), maxProgress));
    }, 700);
    return () => window.clearInterval(timer);
  }, [fullPage, loading, stage]);

  const capture = async () => {
    const target = normalizeUrl(url);
    if (!target) {
      if (showToast) showToast("Please provide a website URL.");
      return;
    }
    try {
      const parsed = new URL(target);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported protocol");
    } catch {
      if (showToast) showToast("That does not look like a valid URL.");
      return;
    }

    setLoading(true);
    setStage("connecting");
    setProgress(8);
    setErrorMessage("");
    setImageUrl(null);
    setScreenshotSize("");

    try {
      const vp = VIEWPORTS[device];
      const params = new URLSearchParams({
        url: target,
        meta: "false",
        "viewport.width": String(vp.width),
        "viewport.height": String(vp.height),
        "viewport.deviceScaleFactor": "1",
        "screenshot.type": format,
        waitUntil: "networkidle0",
        timeout: "45s",
        cache: "false",
      });

      if (fullPage) {
        params.set("screenshot.fullPage", "true");
      } else {
        params.set("screenshot", "true");
      }

      const apiUrl = `https://api.microlink.io/?${params.toString()}`;
      setStage("rendering");
      setProgress((value) => Math.max(value, 28));

      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), fullPage ? 90000 : 60000);
      
      let res;
      try {
        res = await fetch(apiUrl, { headers: { Accept: "application/json" }, signal: controller.signal });
      } finally {
        window.clearTimeout(timer);
      }

      setProgress((value) => Math.max(value, 45));
      const body = await res.text();
      let json;
      try {
        json = JSON.parse(body);
      } catch {
        throw new Error("Screenshot service returned an unreadable response. Please try again.");
      }

      if (!res.ok || json.status !== "success") {
        const serviceMessage = json?.data?.url || json?.message || json?.error;
        throw new Error(serviceMessage || `Screenshot service returned ${res.status}`);
      }

      if (!json.data?.screenshot?.url) {
        throw new Error(json.message || "Screenshot service could not capture this page");
      }

      const shotUrl = json.data.screenshot.url;
      const shot = json.data.screenshot;

      setStage("downloading");
      setProgress(90);

      const imgRes = await fetch(shotUrl);
      if (!imgRes.ok) throw new Error("Could not download screenshot image");
      const blob = await imgRes.blob();
      const objectUrl = URL.createObjectURL(blob);

      setImageUrl(objectUrl);
      setCapturedFor(target);
      setScreenshotSize(
        [shot.width && shot.height ? `${shot.width}×${shot.height}` : "", shot.size_pretty || ""]
          .filter(Boolean)
          .join(" · ")
      );
      setStage("ready");
      setProgress(100);
      if (showToast) showToast("Screenshot ready!");
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : "Capture failed";
      setErrorMessage(message);
      setStage("error");
      setProgress(0);
      if (showToast) showToast(message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!imageUrl) return;
    try {
      const a = document.createElement("a");
      const host = capturedFor ? new URL(capturedFor).hostname.replace(/\./g, "-") : "screenshot";
      a.href = imageUrl;
      a.download = `${host}-${device}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (showToast) showToast("Screenshot downloaded!");
    } catch (e) {
      console.error(e);
    }
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
            <Camera className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">Website Screenshot Capture</h1>
          </div>
        </div>

        {imageUrl && (
          <button 
            onClick={download}
            className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            <Download className="w-3.5 h-3.5" /> Download {format.toUpperCase()}
          </button>
        )}
      </div>

      <main className="max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {/* Controls Card */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400">Website URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") capture(); }}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button 
                onClick={capture} 
                disabled={loading} 
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#222] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 sm:w-40"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Capturing...</>
                ) : (
                  <><Camera className="h-4 w-4" /> Capture</>
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Device</label>
              <select value={device} onChange={(e) => setDevice(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="desktop">Desktop · 1280×800</option>
                <option value="tablet">Tablet · 768×1024</option>
                <option value="mobile">Mobile · 375×812</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Format</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Full page capture</label>
              <div className="flex items-center h-10 gap-3 px-3 rounded-xl border border-[#333] bg-[#0A0A0A]">
                <input
                  type="checkbox"
                  id="full-page"
                  checked={fullPage}
                  onChange={(e) => setFullPage(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="full-page" className="cursor-pointer text-xs text-gray-300 font-medium">
                  {fullPage ? "Capture entire page" : "Viewport only"}
                </label>
              </div>
            </div>
          </div>

          {(loading || stage === "error") && (
            <div className="space-y-3 rounded-2xl border border-[#333] bg-[#0A0A0A] p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400" />
                  )}
                  <span className="truncate font-semibold text-white">
                    {stage === "connecting" && "Connecting to screenshot renderer"}
                    {stage === "rendering" && (fullPage ? "Rendering and stitching full page..." : "Rendering visible viewport...")}
                    {stage === "downloading" && "Preparing preview and download..."}
                    {stage === "error" && errorMessage}
                  </span>
                </div>
                {loading && <span className="text-gray-400 font-mono">{progress}%</span>}
              </div>
              {loading && (
                <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Card */}
        {imageUrl && (
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Preview</h3>
                <p className="text-xs text-gray-400 truncate max-w-md">{capturedFor}</p>
                {screenshotSize && <p className="text-[11px] text-indigo-400 mt-0.5">{screenshotSize}</p>}
              </div>
              <button onClick={download} className="bg-[#222] hover:bg-[#333] text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-[#333] transition-colors flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Download {format.toUpperCase()}
              </button>
            </div>
            
            {/* Unrestricted width scrollable container preserving true aspect ratio */}
            <div className="rounded-2xl border border-[#333] bg-black max-h-[750px] overflow-auto custom-scrollbar p-4 flex justify-center">
              <img
                src={imageUrl}
                alt={`Screenshot of ${capturedFor}`}
                className="w-full h-auto object-contain rounded-lg shadow-lg"
                style={{ width: device === 'desktop' ? '1280px' : device === 'tablet' ? '768px' : '375px', maxWidth: 'none' }}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}