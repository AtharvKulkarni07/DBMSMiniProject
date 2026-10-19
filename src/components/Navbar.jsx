import React from 'react';
import {
  DatabaseIcon,
  VirusIcon,
  TableIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CodeIcon,
  ShieldCheckIcon,
  RefreshCwIcon
} from './Icons';

export const Navbar = ({ activeTab, setActiveTab, dbStatus, onReconnect, onResetDb, pendingFeedCount, openAlertCount }) => {
  const navItems = [
    { id: 'overview', label: 'Surveillance Hub', icon: ActivityIcon },
    { id: 'cases', label: 'Cases Registry', icon: VirusIcon },
    { id: 'labs', label: 'Diagnostic Labs & Cursors', icon: TableIcon, badge: pendingFeedCount > 0 ? `${pendingFeedCount} Feed` : null },
    { id: 'alerts', label: 'Outbreak Early Warning', icon: AlertTriangleIcon, badge: openAlertCount > 0 ? `${openAlertCount}` : null, badgeColor: 'bg-rose-500' },
    { id: 'dbms-lab', label: 'DBMS Practical Workbench', icon: CodeIcon, highlight: true },
    { id: 'schema', label: 'ER Model & BCNF', icon: ShieldCheckIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Organizational Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex flex-wrap justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span className="font-medium text-slate-200 tracking-wide uppercase">
            National Epidemiology & Disease Surveillance Bureau (NEDSB)
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">Ministry of Health & Family Welfare — DBMS Mini Project</span>
        </div>

        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${dbStatus?.isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-mono text-[11px]">
              {dbStatus?.isConnected ? `MySQL: ${dbStatus.host}:${dbStatus.port}/${dbStatus.database}` : 'In-Memory Simulator (Port 3306 Offline)'}
            </span>
            <button
              onClick={onReconnect}
              title="Click to probe & reconnect to local MySQL"
              className="ml-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 px-2 py-0.5 rounded border border-slate-700 transition"
            >
              {dbStatus?.isConnected ? 'Re-check' : 'Connect MySQL'}
            </button>
          </div>

          <a
            href="https://github.com/AtharvKulkarni07/DBMSMiniProject"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition flex items-center space-x-1"
          >
            <span>GitHub Repository</span>
            <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-1.5 rounded">v1.0</span>
          </a>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
              <DatabaseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 text-base leading-tight tracking-tight">
                Epidemiology & Surveillance DB
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Relational Design & Practical Implementation System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-teal-800 font-semibold shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${item.highlight && !isActive ? 'text-teal-700 font-semibold' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white ${item.badgeColor || 'bg-teal-600'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Secondary Action */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetDb}
              title="Reset sample records or run schema.sql / seed.sql"
              className="text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs transition"
            >
              <RefreshCwIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset Seed Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 ${
                activeTab === item.id ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'text-slate-600'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
