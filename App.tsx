import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { parseAndAggregateCSV } from './services/dataService';
import { analyzeDataWithGemini } from './services/geminiService';
import { AggregatedBA, AnalysisResult, AppState } from './types';

export default function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<AggregatedBA[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setState(AppState.PROCESSING_DATA);
    setError(null);

    try {
      // 1. Process CSV
      const aggregated = await parseAndAggregateCSV(file);
      setData(aggregated);
      
      // 2. Send to Gemini
      setState(AppState.ANALYZING_AI);
      const aiResult = await analyzeDataWithGemini(aggregated);
      setAnalysis(aiResult);
      
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Professional Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm4.5 7.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V12zm2.25-3a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0V9.75A.75.75 0 0113.5 9zm3.75-1.5a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V7.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive BA Intelligence</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Powered by Gemini AI</p>
            </div>
          </div>
          
          {state === AppState.SUCCESS && (
             <button 
                onClick={() => setState(AppState.IDLE)}
                className="group flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500 group-hover:text-slate-700">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>New Analysis</span>
             </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in-up">
            <div className="text-center max-w-2xl mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Hidden Value</span> in Your Transactions
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Upload your business area (BA) data to automatically generate executive-level segmentation, revenue insights, and strategic policy recommendations using advanced AI.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} disabled={false} />
          </div>
        )}

        {state === AppState.PROCESSING_DATA && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <div className="relative">
               <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-indigo-600">
                   <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                 </svg>
               </div>
             </div>
             <h3 className="text-xl font-bold text-slate-800 mt-8 mb-2">Crunching Numbers</h3>
             <p className="text-slate-500">Aggregating transaction data...</p>
          </div>
        )}

        {state === AppState.ANALYZING_AI && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <div className="relative">
               <div className="w-20 h-20 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-violet-600">
                   <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.061 1.06l1.06 1.06z" />
                 </svg>
               </div>
             </div>
             <h3 className="text-xl font-bold text-slate-800 mt-8 mb-2">AI Analysis in Progress</h3>
             <p className="text-slate-500">Generating clusters and executive insights...</p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-red-50 p-8 rounded-2xl border border-red-100 max-w-lg text-center shadow-sm">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Interrupted</h3>
              <p className="text-slate-600 mb-8">{error}</p>
              <button 
                onClick={() => setState(AppState.IDLE)}
                className="w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {state === AppState.SUCCESS && analysis && (
          <AnalysisView data={data} analysis={analysis} />
        )}
      </main>
    </div>
  );
}