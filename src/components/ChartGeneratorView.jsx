import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, Activity, Edit2, Trash2, BarChart2, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Layers, Zap, UploadCloud, ChevronDown, Palette } from 'lucide-react';
import { doc, deleteDoc, onSnapshot, collection, addDoc, query, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import * as XLSX from 'xlsx';

const defaultData = [
  { name: 'Q1', value1: 105, value2: 70 },
  { name: 'Q2', value1: 180, value2: 140 },
  { name: 'Q3', value1: 140, value2: 170 },
  { name: 'Q4', value1: 240, value2: 190 }
];

const defaultColors = ['#8b5cf6', '#34d399', '#f43f5e', '#0ea5e9', '#f59e0b', '#06b6d4', '#ec4899', '#10b981'];

export default function ChartGeneratorView({ user, showToast }) {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const dataImportRef = useRef(null);
  
  const [chartTitle, setChartTitle] = useState('My Chart');
  const [chartType, setChartType] = useState('Bar Chart'); 
  const [chartDataStr, setChartDataStr] = useState(JSON.stringify(defaultData, null, 2));
  const [chartData, setChartData] = useState(defaultData);
  const [colors, setColors] = useState(defaultColors);
  const [dataError, setDataError] = useState('');

  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'artifacts', 'etools-app', 'users', user.uid, 'chart_projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => projects.push({ id: doc.id, ...doc.data() }));
      projects.sort((a, b) => b.createdAt - a.createdAt);
      setSavedProjects(projects);
    });
    return () => unsubscribe();
  }, [user]);

  const handleDataChange = (e) => {
    const val = e.target.value;
    setChartDataStr(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setChartData(parsed);
        setDataError('');
      } else {
        setDataError('Data must be a JSON array of objects.');
      }
    } catch (err) {
      setDataError('Invalid JSON format.');
    }
  };

  const handleDataImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let parsedData = [];
      
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const rows = text.split('\n').filter(r => r.trim());
        const headers = rows[0].split(',').map(h => h.trim());
        parsedData = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((h, i) => {
            const val = values[i] ? values[i].trim() : '';
            obj[h] = isNaN(Number(val)) || val === '' ? val : Number(val);
          });
          return obj;
        });
      } else if (file.name.match(/\.xlsx?$/)) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        showToast("Unsupported file format.");
        return;
      }

      if (parsedData.length > 0) {
        setChartData(parsedData);
        setChartDataStr(JSON.stringify(parsedData, null, 2));
        setDataError('');
        showToast("Data imported successfully!");
      } else {
        showToast("The imported file is empty.");
      }
    } catch (error) {
      console.error("Import error:", error);
      showToast("Failed to parse the file.");
    }
    e.target.value = null; 
  };

  const applyTemplate = (type) => {
    let newData = [];
    if (type === 'Sales') {
      newData = [
        { name: 'Jan', sales: 4000, profit: 2400 },
        { name: 'Feb', sales: 3000, profit: 1398 },
        { name: 'Mar', sales: 2000, profit: 9800 },
        { name: 'Apr', sales: 2780, profit: 3908 },
        { name: 'May', sales: 1890, profit: 4800 },
      ];
      setChartType('Area Chart');
    } else if (type === 'Performance') {
      newData = [
        { name: 'Week 1', score: 85 },
        { name: 'Week 2', score: 90 },
        { name: 'Week 3', score: 95 },
        { name: 'Week 4', score: 88 },
      ];
      setChartType('Line Chart');
    } else if (type === 'Demographics') {
      newData = [
        { name: '18-24', count: 400 },
        { name: '25-34', count: 300 },
        { name: '35-44', count: 300 },
        { name: '45+', count: 200 },
      ];
      setChartType('Pie Chart');
    }
    setChartDataStr(JSON.stringify(newData, null, 2));
    setChartData(newData);
    setColors([...defaultColors]); // Reset colors on template change
    setDataError('');
    showToast(`${type} template applied`);
  };

  const handleColorChange = (index, newColor) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  const exportChart = (format) => {
    const svgNode = chartRef.current?.querySelector('svg');
    if (!svgNode) return showToast("Chart not ready");

    const clonedSvg = svgNode.cloneNode(true);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.style.backgroundColor = '#050505';

    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    if (format === 'svg') {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartTitle.replace(/\s+/g, '-').toLowerCase() || 'chart'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("SVG Downloaded!");
    } else if (format === 'png') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = clonedSvg.clientWidth * 2 || 1600;
        canvas.height = clonedSvg.clientHeight * 2 || 800;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${chartTitle.replace(/\s+/g, '-').toLowerCase() || 'chart'}.png`;
        link.click();
        URL.revokeObjectURL(url);
        showToast("PNG Downloaded!");
      };
      img.src = url;
    }
  };

  const handleSaveProject = async () => {
    if (!user || !projectName.trim()) return;
    setIsSaving(true);
    const payload = {
      userId: user.uid,
      projectName: projectName,
      config: { chartTitle, chartType, chartData, colors },
      updatedAt: Date.now()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'artifacts', 'etools-app', 'users', user.uid, 'chart_projects', editingId), payload);
        showToast("Project updated successfully!");
      } else {
        payload.createdAt = Date.now();
        await addDoc(collection(db, 'artifacts', 'etools-app', 'users', user.uid, 'chart_projects'), payload);
        showToast("Chart saved to your dashboard!");
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
    setChartTitle(conf.chartTitle || 'My Chart');
    setChartType(conf.chartType || 'Bar Chart');
    setChartData(conf.chartData || []);
    setChartDataStr(JSON.stringify(conf.chartData || [], null, 2));
    setColors(conf.colors || [...defaultColors]);
  };

  const getDataKeys = () => {
    if (!chartData || chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter(k => k !== 'name');
  };

  const renderChart = () => {
    const keys = getDataKeys();
    
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[#121214]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
            <p className="text-white font-bold text-xs mb-2">{label}</p>
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-gray-400 capitalize">{entry.name}:</span>
                <span className="text-white font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        );
      }
      return null;
    };

    // Increased bottom margin to 30 to make room for the spaced-out legend
    const sharedMargin = { top: 20, right: 30, left: 0, bottom: 30 };
    // Increased paddingTop to 24px to visually separate the legend from the X-axis
    const legendStyle = { fontSize: '12px', paddingTop: '24px' };

    switch (chartType) {
      case 'Line Chart':
        return (
          <LineChart data={chartData} margin={sharedMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        );
      case 'Area Chart':
        return (
          <AreaChart data={chartData} margin={sharedMargin}>
            <defs>
              {keys.map((key, i) => (
                <linearGradient key={`color${key}`} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            {keys.map((key, i) => (
              <Area key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={3} fillOpacity={1} fill={`url(#color${key})`} />
            ))}
          </AreaChart>
        );
      case 'Pie Chart':
      case 'Donut Chart':
        const pieKey = keys[0] || 'value';
        const isDonut = chartType === 'Donut Chart';
        return (
          <PieChart margin={{ bottom: 20 }}>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            <Pie data={chartData} dataKey={pieKey} nameKey="name" cx="50%" cy="50%" innerRadius={isDonut ? 70 : 0} outerRadius={120} paddingAngle={2} stroke="none">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case 'Scatter Plot':
        return (
          <LineChart data={chartData} margin={sharedMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke="none" fill={colors[i % colors.length]} dot={{ r: 6, fill: colors[i % colors.length] }} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        );
      case 'Radar Chart':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData} margin={{ bottom: 30 }}>
            <PolarGrid stroke="#ffffff1a" />
            <PolarAngleAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
            <PolarRadiusAxis stroke="#9ca3af" fontSize={10} angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            {keys.map((key, i) => (
              <Radar key={key} name={key} dataKey={key} stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.5} />
            ))}
          </RadarChart>
        );
      case 'Bar Chart':
      case 'Grouped Bar':
      case 'Stacked Bar':
      default:
        const isStacked = chartType === 'Stacked Bar';
        return (
          <BarChart data={chartData} margin={sharedMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
            <Legend wrapperStyle={legendStyle} verticalAlign="bottom" />
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} stackId={isStacked ? "a" : undefined} fill={colors[i % colors.length]} radius={isStacked ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 pt-4 animate-fade-in-up max-w-[1600px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      
      {/* Inline Header */}
      <div className="relative flex items-center justify-center mb-6 shrink-0">
        <button onClick={() => navigate('/')} className="absolute left-0 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase">
          <div className="p-1.5 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
              Chart Generator Pro
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1 hidden sm:block">
              Create stunning, interactive charts with advanced customization
            </p>
        </div>
      </div>

      {/* Quick Templates Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white/[0.02] p-2.5 rounded-2xl border border-white/[0.05] backdrop-blur-md shrink-0 w-max mx-auto">
        <div className="flex items-center gap-2 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Templates
        </div>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button onClick={() => applyTemplate('Sales')} className="bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">Sales Dashboard</button>
        <button onClick={() => applyTemplate('Performance')} className="bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">Performance</button>
        <button onClick={() => applyTemplate('Demographics')} className="bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">Demographics</button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative min-h-0 pb-6">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-4 bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex flex-col relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-5 shrink-0">
            <label className="text-[10px] font-bold tracking-widest text-gray-300 uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" /> Chart Configuration
            </label>
          </div>

          <div className="space-y-5 flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Chart Title</label>
              <input 
                type="text" 
                value={chartTitle} 
                onChange={(e) => setChartTitle(e.target.value)} 
                className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-inner"
              />
            </div>

            <div className="shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Chart Type</label>
              <div className="relative">
                <select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)} 
                  className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-3 pr-10 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="Bar Chart">Bar Chart</option>
                  <option value="Grouped Bar">Grouped Bar</option>
                  <option value="Stacked Bar">Stacked Bar</option>
                  <option value="Line Chart">Line Chart</option>
                  <option value="Area Chart">Area Chart</option>
                  <option value="Pie Chart">Pie Chart</option>
                  <option value="Donut Chart">Donut Chart</option>
                  <option value="Scatter Plot">Scatter Plot</option>
                  <option value="Radar Chart">Radar Chart</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* NEW: Dynamic Color Palette Picker */}
            <div className="shrink-0 pt-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-fuchsia-400" /> Color Palette
              </label>
              <div className="flex flex-wrap gap-2">
                {getDataKeys().map((key, index) => (
                  <div key={key} className="flex items-center gap-1.5 bg-black/40 border border-white/[0.05] p-1.5 px-2 rounded-lg hover:border-white/20 transition-colors">
                    <input
                      type="color"
                      value={colors[index % colors.length]}
                      onChange={(e) => handleColorChange(index % colors.length, e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-[10px] text-gray-300 uppercase font-medium max-w-[60px] truncate" title={key}>{key}</span>
                  </div>
                ))}
                {getDataKeys().length === 0 && (
                  <span className="text-[10px] text-gray-600">No data points to color</span>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-white/[0.05]">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Data Source (JSON)</label>
                <div className="flex gap-2">
                  {dataError && <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{dataError}</span>}
                  
                  <button 
                    onClick={() => dataImportRef.current?.click()}
                    className="text-[9px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <UploadCloud className="w-3 h-3" /> Import CSV/XLSX
                  </button>
                  <input type="file" ref={dataImportRef} onChange={handleDataImport} accept=".csv, .xlsx, .xls" className="hidden" />
                </div>
              </div>
              <textarea 
                value={chartDataStr}
                onChange={handleDataChange}
                className={`flex-1 w-full bg-black/40 border ${dataError ? 'border-rose-500/50' : 'border-white/[0.05]'} rounded-xl p-4 text-xs text-white/90 focus:outline-none focus:border-blue-500/50 resize-none font-mono shadow-inner custom-scrollbar`}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Preview & Export */}
        <div className="lg:col-span-8 bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex flex-col relative z-10 min-h-0">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-lg font-bold text-white tracking-tight">{chartTitle}</h2>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold flex gap-3">
              <span>{chartData?.length || 0} Data points</span>
              <span className="w-px h-3 bg-white/10"></span>
              <span className="text-blue-400">{chartType}</span>
            </div>
          </div>
          
          {/* Recharts Canvas */}
          <div className="flex-1 w-full relative min-h-0 bg-black/20 rounded-2xl border border-white/[0.03] p-4 flex items-center justify-center shadow-inner" ref={chartRef}>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No valid data to render</p>
            )}
          </div>

          <div className="mt-5 shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-white/[0.05]">
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => exportChart('png')} className="flex-1 sm:flex-none bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.05] text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <Download className="w-3.5 h-3.5" /> Export PNG
              </button>
              <button onClick={() => exportChart('svg')} className="flex-1 sm:flex-none bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.05] text-[10px] font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
                <Download className="w-3.5 h-3.5 text-blue-400" /> Export SVG
              </button>
            </div>

            {user ? (
              <div className="flex gap-2 w-full sm:w-auto">
                  <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project Name..." className="flex-1 sm:w-48 bg-black/20 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                  <button onClick={handleSaveProject} disabled={isSaving || !projectName.trim()} className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    <Save className="w-3.5 h-3.5" /> {editingId ? 'Update' : 'Save'}
                  </button>
              </div>
            ) : (
              <p className="text-[10px] text-gray-600 uppercase tracking-wider">Sign in to save projects</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}