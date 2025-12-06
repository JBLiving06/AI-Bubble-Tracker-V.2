import React, { useState, useEffect, useMemo } from 'react';

// Gauge configuration with all 10 indicators
const GAUGES = [
  {
    id: 'capex-revenue',
    name: 'CapEx-to-Revenue',
    category: 'Financial Fundamentals',
    description: 'Hyperscaler AI infrastructure spend vs revenue',
    unit: 'ratio',
    automated: true,
    thresholds: { safe: 0.30, warning: 0.50 },
    format: (v) => v.toFixed(2),
    inverted: false,
  },
  {
    id: 'gdp-dependence',
    name: 'GDP Dependence',
    category: 'Economic Impact',
    description: 'GDP growth reliance on datacenter buildout',
    unit: '%',
    automated: false,
    thresholds: { safe: 0.5, warning: 1.5 },
    format: (v) => `${v.toFixed(1)}%`,
    inverted: false,
  },
  {
    id: 'market-concentration',
    name: 'Market Concentration',
    category: 'Market Structure',
    description: 'AI megacap dominance in equity markets',
    unit: 'index',
    automated: true,
    thresholds: { safe: 40, warning: 70 },
    format: (v) => v.toFixed(0),
    inverted: false,
  },
  {
    id: 'application-maturity',
    name: 'Application Maturity',
    category: 'Product Adoption',
    description: 'Production AI apps beyond pilots',
    unit: 'score',
    automated: false,
    thresholds: { safe: 60, warning: 35 },
    format: (v) => v.toFixed(0),
    inverted: true, // Lower is worse
  },
  {
    id: 'infrastructure-strain',
    name: 'Infrastructure Strain',
    category: 'Physical Infrastructure',
    description: 'Grid, water, and cooling capacity stress',
    unit: 'index',
    automated: false,
    thresholds: { safe: 40, warning: 70 },
    format: (v) => v.toFixed(0),
    inverted: false,
  },
  {
    id: 'valuation-metrics',
    name: 'Valuation Heat',
    category: 'Market Valuation',
    description: 'P/E ratios vs historical norms',
    unit: 'P/E',
    automated: true,
    thresholds: { safe: 22, warning: 30 },
    format: (v) => v.toFixed(1),
    inverted: false,
  },
  {
    id: 'debt-financing',
    name: 'Debt & Leverage',
    category: 'Financial Leverage',
    description: 'Debt-to-equity in AI buildout',
    unit: 'ratio',
    automated: true,
    thresholds: { safe: 0.5, warning: 1.0 },
    format: (v) => v.toFixed(2),
    inverted: false,
  },
  {
    id: 'regulatory-risk',
    name: 'Regulatory Risk',
    category: 'Policy & Regulation',
    description: 'Antitrust and policy headwinds',
    unit: 'score',
    automated: false,
    thresholds: { safe: 40, warning: 70 },
    format: (v) => v.toFixed(0),
    inverted: false,
  },
  {
    id: 'geographic-concentration',
    name: 'Geographic Concentration',
    category: 'Geographic Risk',
    description: 'Infrastructure clustering in few regions',
    unit: 'index',
    automated: false,
    thresholds: { safe: 50, warning: 75 },
    format: (v) => v.toFixed(0),
    inverted: false,
  },
  {
    id: 'sentiment-speculation',
    name: 'Sentiment & Speculation',
    category: 'Market Sentiment',
    description: 'IPO activity, retail flows, media hype',
    unit: 'index',
    automated: true,
    thresholds: { safe: 50, warning: 75 },
    format: (v) => v.toFixed(0),
    inverted: false,
  },
];

// Simulated current readings (would come from API in production)
const MOCK_READINGS = {
  'capex-revenue': { value: 0.42, trend: 'rising', lastUpdate: '2025-12-05' },
  'gdp-dependence': { value: 0.8, trend: 'stable', lastUpdate: '2025-12-01' },
  'market-concentration': { value: 58, trend: 'rising', lastUpdate: '2025-12-05' },
  'application-maturity': { value: 48, trend: 'improving', lastUpdate: '2025-12-01' },
  'infrastructure-strain': { value: 52, trend: 'rising', lastUpdate: '2025-12-01' },
  'valuation-metrics': { value: 34.2, trend: 'rising', lastUpdate: '2025-12-05' },
  'debt-financing': { value: 0.68, trend: 'stable', lastUpdate: '2025-12-05' },
  'regulatory-risk': { value: 45, trend: 'rising', lastUpdate: '2025-12-01' },
  'geographic-concentration': { value: 62, trend: 'stable', lastUpdate: '2025-12-01' },
  'sentiment-speculation': { value: 61, trend: 'rising', lastUpdate: '2025-12-05' },
};

// Risk level calculation
function getRiskLevel(gauge, value) {
  const { thresholds, inverted } = gauge;
  if (inverted) {
    if (value >= thresholds.safe) return 'safe';
    if (value >= thresholds.warning) return 'warning';
    return 'danger';
  } else {
    if (value <= thresholds.safe) return 'safe';
    if (value <= thresholds.warning) return 'warning';
    return 'danger';
  }
}

// Gauge visualization component
function GaugeMeter({ gauge, reading, isSelected, onSelect }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const riskLevel = getRiskLevel(gauge, reading.value);
  
  // Calculate needle angle (0-180 degrees, left to right)
  const getAngle = () => {
    const { thresholds, inverted } = gauge;
    const max = inverted ? thresholds.safe * 1.5 : thresholds.warning * 1.5;
    const min = 0;
    const normalized = Math.min(Math.max(reading.value, min), max);
    return (normalized / max) * 180;
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(getAngle()), 100);
    return () => clearTimeout(timer);
  }, [reading.value]);

  const riskColors = {
    safe: { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
    warning: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
    danger: { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
  };

  const trendIcons = {
    rising: '↗',
    falling: '↘',
    stable: '→',
    improving: '↗',
    worsening: '↘',
  };

  return (
    <div
      onClick={() => onSelect(gauge.id)}
      className={`
        relative p-5 rounded-xl cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-slate-800/90 ring-2 ring-cyan-500/50 scale-[1.02]' 
          : 'bg-slate-800/60 hover:bg-slate-800/80'
        }
      `}
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: isSelected 
          ? `0 0 30px ${riskColors[riskLevel].glow}` 
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`
              w-2 h-2 rounded-full
              ${gauge.automated ? 'bg-cyan-400' : 'bg-amber-400'}
            `} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {gauge.category}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">{gauge.name}</h3>
        </div>
        <div className={`
          px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
          ${riskLevel === 'safe' ? 'bg-emerald-500/20 text-emerald-400' : ''}
          ${riskLevel === 'warning' ? 'bg-amber-500/20 text-amber-400' : ''}
          ${riskLevel === 'danger' ? 'bg-red-500/20 text-red-400' : ''}
        `}>
          {riskLevel}
        </div>
      </div>

      {/* Gauge SVG */}
      <div className="relative flex justify-center mb-4">
        <svg viewBox="0 0 200 110" className="w-full max-w-[180px]">
          {/* Background arc segments */}
          <defs>
            <linearGradient id={`grad-safe-${gauge.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id={`grad-warning-${gauge.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id={`grad-danger-${gauge.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${gauge.id}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Arc background */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Safe zone */}
          <path
            d="M 20 100 A 80 80 0 0 1 80 30"
            fill="none"
            stroke={`url(#grad-safe-${gauge.id})`}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Warning zone */}
          <path
            d="M 80 30 A 80 80 0 0 1 140 40"
            fill="none"
            stroke={`url(#grad-warning-${gauge.id})`}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Danger zone */}
          <path
            d="M 140 40 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={`url(#grad-danger-${gauge.id})`}
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Needle */}
          <g 
            style={{ 
              transformOrigin: '100px 100px',
              transform: `rotate(${animatedValue - 90}deg)`,
              transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={riskColors[riskLevel].primary}
              strokeWidth="3"
              strokeLinecap="round"
              filter={`url(#glow-${gauge.id})`}
            />
            <circle
              cx="100"
              cy="100"
              r="8"
              fill={riskColors[riskLevel].primary}
              filter={`url(#glow-${gauge.id})`}
            />
            <circle
              cx="100"
              cy="100"
              r="4"
              fill="#0f172a"
            />
          </g>
        </svg>
      </div>

      {/* Value display */}
      <div className="text-center mb-3">
        <span 
          className="text-2xl font-mono font-bold"
          style={{ color: riskColors[riskLevel].primary }}
        >
          {gauge.format(reading.value)}
        </span>
        <span className="text-slate-500 text-sm ml-2">
          {trendIcons[reading.trend]}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>{gauge.automated ? 'Auto' : 'Manual'}</span>
        <span>{reading.lastUpdate}</span>
      </div>
    </div>
  );
}

// Overall risk assessment header
function RiskAssessment({ gauges, readings }) {
  const riskCounts = useMemo(() => {
    return gauges.reduce(
      (acc, gauge) => {
        const level = getRiskLevel(gauge, readings[gauge.id].value);
        acc[level]++;
        return acc;
      },
      { safe: 0, warning: 0, danger: 0 }
    );
  }, [gauges, readings]);

  const overallRisk = useMemo(() => {
    if (riskCounts.danger >= 4) return 'BUBBLE';
    if (riskCounts.danger >= 2) return 'OVERHEATING';
    if (riskCounts.danger >= 1 || riskCounts.warning >= 5) return 'CAUTION';
    return 'NORMAL';
  }, [riskCounts]);

  const riskConfig = {
    NORMAL: { 
      color: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.1)',
      label: 'Normal Market',
      action: 'Continue standard monitoring',
    },
    CAUTION: { 
      color: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.1)',
      label: 'Caution',
      action: 'Increase vigilance, review positions',
    },
    OVERHEATING: { 
      color: '#f97316', 
      bg: 'rgba(249, 115, 22, 0.1)',
      label: 'Overheating',
      action: 'Reduce exposure, tighten risk management',
    },
    BUBBLE: { 
      color: '#ef4444', 
      bg: 'rgba(239, 68, 68, 0.1)',
      label: 'Bubble Territory',
      action: 'Defensive positioning recommended',
    },
  };

  const config = riskConfig[overallRisk];

  return (
    <div 
      className="rounded-2xl p-6 mb-8"
      style={{ 
        background: `linear-gradient(135deg, ${config.bg}, rgba(15, 23, 42, 0.8))`,
        border: `1px solid ${config.color}40`,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Risk level display */}
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
              boxShadow: `0 0 40px ${config.color}20`,
            }}
          >
            <span 
              className="text-4xl font-black"
              style={{ color: config.color }}
            >
              {riskCounts.danger}
            </span>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">
              Current Assessment
            </div>
            <div 
              className="text-2xl font-bold tracking-tight"
              style={{ color: config.color }}
            >
              {config.label}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {config.action}
            </div>
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{riskCounts.safe}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Safe</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400">{riskCounts.warning}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{riskCounts.danger}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Danger</div>
          </div>
        </div>
      </div>

      {/* Progress bar showing distribution */}
      <div className="mt-6 h-2 rounded-full overflow-hidden bg-slate-700/50 flex">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(riskCounts.safe / 10) * 100}%` }}
        />
        <div 
          className="h-full bg-amber-500 transition-all duration-500"
          style={{ width: `${(riskCounts.warning / 10) * 100}%` }}
        />
        <div 
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${(riskCounts.danger / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Detail panel for selected gauge
function GaugeDetail({ gauge, reading }) {
  if (!gauge) return null;

  const riskLevel = getRiskLevel(gauge, reading.value);

  return (
    <div className="bg-slate-800/60 rounded-xl p-6 backdrop-blur-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{gauge.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{gauge.description}</p>
        </div>
        <span className={`
          px-3 py-1 rounded-lg text-xs font-bold uppercase
          ${gauge.automated ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}
        `}>
          {gauge.automated ? 'Automated' : 'Manual'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Current</div>
          <div className="text-2xl font-mono font-bold text-slate-100">
            {gauge.format(reading.value)}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Safe Below</div>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            {gauge.format(gauge.thresholds.safe)}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Danger Above</div>
          <div className="text-2xl font-mono font-bold text-red-400">
            {gauge.format(gauge.thresholds.warning)}
          </div>
        </div>
      </div>

      {/* Threshold visualization */}
      <div className="relative h-8 rounded-lg overflow-hidden bg-slate-900/50 mb-6">
        <div 
          className="absolute inset-y-0 left-0 bg-emerald-500/30"
          style={{ 
            width: `${(gauge.thresholds.safe / (gauge.thresholds.warning * 1.5)) * 100}%` 
          }}
        />
        <div 
          className="absolute inset-y-0 bg-amber-500/30"
          style={{ 
            left: `${(gauge.thresholds.safe / (gauge.thresholds.warning * 1.5)) * 100}%`,
            width: `${((gauge.thresholds.warning - gauge.thresholds.safe) / (gauge.thresholds.warning * 1.5)) * 100}%`
          }}
        />
        <div 
          className="absolute inset-y-0 right-0 bg-red-500/30"
          style={{ 
            width: `${(0.5 * gauge.thresholds.warning / (gauge.thresholds.warning * 1.5)) * 100}%` 
          }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded shadow-lg"
          style={{ 
            left: `${(reading.value / (gauge.thresholds.warning * 1.5)) * 100}%`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
          }}
        />
      </div>

      {/* Historical placeholder */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-dashed border-slate-700">
        <div className="text-center text-slate-500 text-sm">
          90-day trend chart would render here
        </div>
      </div>
    </div>
  );
}

// Main dashboard component
export default function AIBubbleTracker() {
  const [selectedGauge, setSelectedGauge] = useState(null);
  const [readings, setReadings] = useState(MOCK_READINGS);
  const [lastRefresh, setLastRefresh] = useState(new Date().toISOString());

  const selectedGaugeData = GAUGES.find(g => g.id === selectedGauge);

  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #111827 50%, #0f172a 100%)',
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs uppercase tracking-widest">Live Monitoring</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
              AI Bubble Tracker
            </h1>
            <p className="text-slate-500 mt-2">
              10 gauges · 5 automated · 5 manual assessment
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLastRefresh(new Date().toISOString())}
              className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium
                         hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <div className="text-slate-600 text-xs">
              {new Date(lastRefresh).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto">
        {/* Risk assessment header */}
        <RiskAssessment gauges={GAUGES} readings={readings} />

        {/* Gauges grid with optional detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gauges */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {GAUGES.map((gauge) => (
                <GaugeMeter
                  key={gauge.id}
                  gauge={gauge}
                  reading={readings[gauge.id]}
                  isSelected={selectedGauge === gauge.id}
                  onSelect={setSelectedGauge}
                />
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1">
            {selectedGaugeData ? (
              <GaugeDetail 
                gauge={selectedGaugeData} 
                reading={readings[selectedGaugeData.id]} 
              />
            ) : (
              <div className="bg-slate-800/40 rounded-xl p-6 border border-dashed border-slate-700 h-full flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="text-4xl mb-3">◎</div>
                  <div className="text-sm">Select a gauge to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Automated gauge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Manual assessment</span>
          </div>
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Safe
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Danger
            </span>
          </div>
        </div>

        {/* Framework note */}
        <div className="mt-8 text-center text-slate-600 text-xs">
          Rule of thumb: 1 red = caution · 2-3 red = overheating · 4+ red = bubble territory
        </div>
      </div>
    </div>
  );
}
