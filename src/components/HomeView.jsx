import React, { useState } from 'react';
import { 
  Image as ImageIcon, QrCode, Type, Minimize2, FileText, 
  BarChart2, BarChart3, Sparkles, Download, Globe, 
  ScanText, ImagePlus, Code, Layers, Image, Palette, FileImage, 
  SpellCheck, FileArchive, RefreshCw, ShieldCheck, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const toolThemes = [
  {
    bgHover: "hover:bg-cyan-500/[0.03]",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400",
    iconGlow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    lineGradient: "from-transparent via-cyan-400 to-transparent",
    borderHover: "hover:border-cyan-500/30",
    cardGlow: "hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.15)]"
  },
  {
    bgHover: "hover:bg-rose-500/[0.03]",
    iconBg: "bg-gradient-to-br from-fuchsia-600 to-rose-500",
    iconGlow: "shadow-[0_0_20px_rgba(244,63,94,0.4)]",
    lineGradient: "from-transparent via-rose-500 to-transparent",
    borderHover: "hover:border-rose-500/30",
    cardGlow: "hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.15)]"
  },
  {
    bgHover: "hover:bg-emerald-500/[0.03]",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    iconGlow: "shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    lineGradient: "from-transparent via-emerald-400 to-transparent",
    borderHover: "hover:border-emerald-500/30",
    cardGlow: "hover:shadow-[0_20px_40px_-15px_rgba(52,211,153,0.15)]"
  },
  {
    bgHover: "hover:bg-violet-500/[0.03]",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-500",
    iconGlow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
    lineGradient: "from-transparent via-purple-500 to-transparent",
    borderHover: "hover:border-purple-500/30",
    cardGlow: "hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)]"
  },
  {
    bgHover: "hover:bg-orange-500/[0.03]",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    iconGlow: "shadow-[0_0_20px_rgba(249,115,22,0.4)]",
    lineGradient: "from-transparent via-orange-500 to-transparent",
    borderHover: "hover:border-orange-500/30",
    cardGlow: "hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)]"
  }
];

export default function HomeView({ showToast }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Generators", "PDF", "Text Tools", "Media", "Developer"];

  const dummyTools = [
    { title: "QR Code Generator", desc: "Generate tracking-ready QR matrices instantly. Customize colors, logos, and error resilience.", cat: "Generators", active: true, path: '/qr', icon: QrCode },
    { title: "PDF to Image Converter", desc: "Convert PDF pages to high-quality JPG or PNG images instantly with customizable resolution.", cat: "PDF", active: true, path: '/pdf-to-image', icon: FileText },
    { title: "Chart Generator Pro", desc: "Create stunning, interactive charts with advanced customization and export options.", cat: "Generators", active: true, path: '/chart-generator', icon: BarChart3 },
    { title: "Text Case Converter", desc: "Instantly format your typography architecture. Switch between camel, snake, pascal, and more.", cat: "Text Tools", active: true, path: '/text-case', icon: Type },
    { title: "Image Compressor", desc: "Reduce payload sizes without losing visual fidelity. Smart compression algorithms.", cat: "Media", active: true, path: '/image-compressor', icon: Image },
    { title: "Website Image Downloader", desc: "Extract and bulk download all visual assets from any website URL, bypassing CORS protections.", cat: "Media", active: true, path: '/image-downloader', icon: Globe },
    { title: "Image to Text (OCR)", desc: "Extract text from images using advanced optical character recognition technology.", cat: "Media", active: true, path: '/image-to-text', icon: ScanText },
    { title: "AI Image Upscaler", desc: "Enhance and upscale your images up to 16x without losing quality using advanced processing.", cat: "Media", active: true, path: '/image-upscaler', icon: ImagePlus },
   // { title: "JSON Formatter", desc: "Beautify, validate, and parse complex JSON data architectures in real-time.", cat: "Developer", active: false, path: '/json-fmt', icon: Code },
   // { title: "CSS Shadow Builder", desc: "Craft perfect, buttery-smooth CSS box shadows with an intuitive visual editor.", cat: "Developer", active: false, path: '/css-shadow', icon: Layers },
   // { title: "Gradient Generator", desc: "Mix and export beautiful linear and radial CSS gradients for your next project.", cat: "Generators", active: false, path: '/gradient-gen', icon: Sparkles },
    { title: "AI Color Genie", desc: "Generate perfect, UI-ready color palettes using AI based on cinematic themes or moods.", cat: "Generators", active: true, path: '/ai-colors', icon: Palette }, // <-- NEW TOOL
    { title: "Image to PDF", desc: "Convert multiple images into a single, high-quality A4 PDF document instantly.", cat: "PDF", active: true, path: '/image-to-pdf', icon: FileImage }, // <-- NEW TOOL
    { title: "AI Grammar Checker", desc: "Check your text for grammar, spelling, and punctuation errors with advanced AI analysis.", cat: "Text Tools", active: true, path: '/grammar-checker', icon: SpellCheck }, // <-- NEW TOOL
    { title: "GIF Compressor Pro", desc: "Advanced bulk compression for GIF media. Reduce file size while retaining quality and aspect ratios.", cat: "Media", active: true, path: '/gif-compressor', icon: FileArchive }, // <-- NEW TOOL
    { title: "Image Format Converter", desc: "Batch convert images between PNG, JPG, and WebP. Full control over quality and transparency.", cat: "Media", active: true, path: '/image-converter', icon: RefreshCw }, // <-- NEW TOOL
    { title: "PDF to Word", desc: "Convert PDF documents into editable Word (.docx) files. (Requires backend integration for layout parsing).", cat: "PDF", active: true, path: '/pdf-to-word', icon: FileText }, // <-- NEW TOOL
    { title: "Plagiarism Checker", desc: "100% Accurate, free & Trustworthy. Check your content for plagiarism against billions of web pages.", cat: "Text Tools", active: true, path: '/plagiarism-checker', icon: ShieldCheck }, // <-- NEW TOOL
  ];

  const filteredTools = activeCategory === "All" 
    ? dummyTools 
    : dummyTools.filter(t => t.cat.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 max-w-[1600px] mx-auto">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center mb-8 sm:mb-12 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 sm:gap-3 bg-[#050505]/80 border border-white/[0.08] backdrop-blur-2xl px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 sm:mb-5 shadow-2xl hover:scale-105 transition-transform cursor-default">
          <div className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500"></span>
          </div>
          <span className="text-gray-300">All tools are 100% free</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20 mb-3 sm:mb-4 tracking-tighter leading-[1.1] filter drop-shadow-sm px-2">
          Supercharge your workflow.
        </h1>
        
        <p className="text-gray-400 text-sm sm:text-base lg:text-xl max-w-2xl font-light leading-relaxed px-4">
          A meticulously crafted suite of digital utilities designed for creators, developers, and makers who demand perfection.
        </p>
      </div>

      {/* Modern Filter Categories */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 animate-fade-in-up delay-100 relative z-20">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-semibold tracking-wide transition-all duration-300 ${
              activeCategory === cat 
                ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] scale-105' 
                : 'bg-white/[0.02] backdrop-blur-md text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 animate-fade-in-up delay-200">
        {filteredTools.map((tool, idx) => {
          const IconComponent = tool.icon;
          const theme = toolThemes[idx % toolThemes.length];

          return (
            <div 
              key={idx}
              onClick={() => tool.active ? navigate(tool.path) : showToast(`${tool.title} is coming soon!`)}
              className={`group relative flex flex-col justify-between bg-[#050505]/60 backdrop-blur-3xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/[0.05] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer min-h-[160px] sm:min-h-[200px] overflow-hidden
                ${tool.active ? `${theme.bgHover} ${theme.borderHover} ${theme.cardGlow} hover:-translate-y-1 sm:hover:-translate-y-2` : 'opacity-40 hover:opacity-80'}
              `}
            >
              {tool.active && (
                <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${theme.lineGradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center ease-out`}></div>
              )}
              
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 ${tool.active ? `${theme.iconBg} ${theme.iconGlow}` : 'bg-white/10'}`}>
                  {IconComponent && <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${tool.active ? 'text-white' : 'text-gray-500'}`} />}
                </div>

                {!tool.active && (
                  <span className="bg-white/5 border border-white/10 text-gray-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                    Soon
                  </span>
                )}
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h3 className="text-white font-bold sm:font-extrabold text-sm sm:text-base tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all leading-tight">
                    {tool.title}
                  </h3>
                </div>
                <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed font-light line-clamp-2 sm:line-clamp-3">
                  {tool.desc}
                </p>
              </div>

              <div className="absolute -bottom-6 -right-6 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none transform group-hover:scale-150 group-hover:-rotate-12 hidden sm:block">
                {IconComponent && <IconComponent className="w-28 h-28 text-white" strokeWidth={1} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}