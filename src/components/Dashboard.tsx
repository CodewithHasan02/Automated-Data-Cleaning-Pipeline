import React, { useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle, BarChart2, MessageSquare, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DataViewer from './DataViewer';
import EDAViewer from './EDAViewer';
import Chatbot from './Chatbot';
import BeforeAfterGraph from './BeforeAfterGraph';
import { processData } from '../utils/dataProcessing';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [cleanedData, setCleanedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'eda'>('data');
  const [cleaningStats, setCleaningStats] = useState<{ rowsRemoved: number, nullsFilled: number } | null>(null);
  const [visualizationRequest, setVisualizationRequest] = useState<{ type: string; column?: string; columns?: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setRawData(results.data);
          setCleanedData([]); // Reset cleaned data on new upload
          setCleaningStats(null);
          setVisualizationRequest(null);
        }
      });
    }
  };

  const handlePreprocess = async () => {
    if (!rawData.length) return;
    setIsProcessing(true);
    
    // Simulate processing time for UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { cleaned, stats } = processData(rawData);
    setCleanedData(cleaned);
    setCleaningStats(stats);
    setIsProcessing(false);
  };

  const handleVisualizationRequest = (details: { type: string; column?: string; columns?: string[] }) => {
    setVisualizationRequest(details);
    setActiveTab('eda');
  };

  const handleDownloadCleaned = () => {
    if (!cleanedData.length) return;
    // Fully cleaned data: Outlier rows deleted, Empty rows deleted, Numeric nulls filled with mean, Categorical nulls filled with mode
    // NO Cleaning_Status or Cleaning_Audit_Logs columns
    const exportData = cleanedData
      .filter(row => !row._isDeleted)
      .map(row => {
        const { _isDeleted, _isOutlier, _isModified, _cleaningLogs, ...rest } = row;
        return rest;
      });
      
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cleaned_${file?.name || 'data.csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAudit = () => {
    if (!cleanedData.length) return;
    // Audit data: contain this two column like it was fully raw format and uncleaned data
    const exportData = cleanedData.map(row => {
      const { _isDeleted, _isOutlier, _isModified, _cleaningLogs, ...rest } = row;
      
      let status = 'CLEAN';
      if (_isDeleted) {
        status = _isOutlier ? 'REMOVED (OUTLIER)' : 'REMOVED (EMPTY)';
      }
      else if (_isModified) status = 'MODIFIED (FILLED)';

      return {
        ...rest,
        'Cleaning_Status': status,
        'Cleaning_Audit_Logs': (_cleaningLogs || []).join(' | ')
      };
    });
      
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_report_${file?.name || 'data.csv'}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-full bg-[#040B16] text-white">
      {/* Left Sidebar - Chatbot */}
      <div className="w-full md:w-80 shrink-0 bg-[#0B1121] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shadow-sm z-20">
        <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-emerald-500/5 sticky top-0 md:top-[72px] z-30">
          <MessageSquare className="w-5 h-5 text-brand-green" />
          <h2 className="font-semibold text-white">AI Assistant</h2>
        </div>
        <div className="h-[500px] md:h-[calc(100vh-130px)] md:sticky md:top-[128px] flex flex-col overflow-hidden">
          <Chatbot 
            dataContext={cleanedData.length > 0 ? cleanedData : rawData} 
            onVisualizationRequest={handleVisualizationRequest}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0B1121] border-b border-white/10 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-4 md:gap-0 sticky top-[72px]">
          <h1 className="text-xl font-bold text-white">Data Pipeline</h1>
          
          <div className="flex items-center gap-4">
            {!file ? (
              <label className="cursor-pointer bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
                <UploadCloud className="w-4 h-4" /> Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-md border border-white/10">
                  <FileText className="w-4 h-4 text-brand-green" />
                  <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">({rawData.length} rows)</span>
                </div>
                
                {cleanedData.length === 0 ? (
                  <button 
                    onClick={handlePreprocess}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {isProcessing ? 'Cleaning...' : 'Preprocess Data'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleDownloadCleaned}
                      className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download Cleaned
                    </button>
                    <button 
                      onClick={handleDownloadAudit}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <FileText className="w-4 h-4" /> Download Audit Report
                    </button>
                    <button 
                      onClick={() => { setFile(null); setRawData([]); setCleanedData([]); setVisualizationRequest(null); }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 bg-[#040B16]">
          {!file ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-2xl bg-[#0B1121] p-8 text-center">
              <UploadCloud className="w-16 h-16 mb-4 text-gray-600" />
              <h2 className="text-2xl font-bold text-white mb-2">Automated Data Cleaning Pipeline</h2>
              <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                Upload your messy CSV files and let our AI instantly handle missing values, formatting, and outliers. It saves you lots of time so you can jump straight into analysis.
              </p>
              <label className="cursor-pointer bg-gradient-to-r from-[#34d399] to-[#10b981] hover:from-[#10b981] hover:to-[#059669] text-white px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
                <UploadCloud className="w-5 h-5" /> Browse Files
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              
              {/* Stats Banner & Graph */}
              <AnimatePresence>
                {cleaningStats && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    <div className="lg:col-span-2 bg-[#0B1121] border border-white/10 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <CheckCircle className="w-6 h-6 text-brand-green" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Cleaning Complete</h3>
                          <p className="text-sm text-gray-400">Your dataset has been optimized and is ready for analysis.</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 md:gap-8 bg-white/5 px-6 py-4 rounded-lg border border-white/5">
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-white">{rawData.length}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Raw Rows</div>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/10"></div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-red-400">-{cleaningStats.rowsRemoved}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rows Removed</div>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/10"></div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-amber-400">{cleaningStats.nullsFilled}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nulls Filled</div>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/10"></div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-blue-400">{cleaningStats.outliersHandled}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outliers Detected</div>
                        </div>
                        <div className="hidden md:block w-px h-8 bg-white/10"></div>
                        <div className="text-center flex-1">
                          <div className="text-2xl font-bold text-brand-green">{cleanedData.filter(r => !r._isDeleted).length}</div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Final Rows</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-1 h-[250px]">
                      <BeforeAfterGraph 
                        rawDataLength={rawData.length} 
                        cleanedDataLength={cleanedData.filter(r => !r._isDeleted).length} 
                        nullsFilled={cleaningStats.nullsFilled} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                  Data View
                </button>
                <button 
                  onClick={() => setActiveTab('eda')}
                  disabled={cleanedData.length === 0}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'eda' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-400 hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <BarChart2 className="w-4 h-4" /> EDA & Visualizations
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 bg-[#0B1121] rounded-xl border border-white/10 shadow-sm overflow-hidden">
                {activeTab === 'data' ? (
                  <DataViewer 
                    rawData={rawData} 
                    cleanedData={cleanedData.filter(r => !r._isDeleted)} 
                  />
                ) : (
                  <EDAViewer data={cleanedData.filter(r => !r._isDeleted)} requestedVisualization={visualizationRequest} />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
