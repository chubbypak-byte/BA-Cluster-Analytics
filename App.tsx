import React, { useState } from 'react';
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 w-8 h-8 rounded-lg shadow-sm"></div>
            <h1 className="text-xl font-bold text-slate-800">BA Intelligence Hub</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Business Area Clustering</h2>
            <p className="text-slate-600 mb-8 text-center max-w-lg">
              Upload your transaction CSV (`H_ZCSR181H_Cleaned...`) to automatically group Business Areas and generate executive insights using AI.
            </p>
            <FileUpload onFileSelect={handleFileSelect} disabled={false} />
          </div>
        )}

        {state === AppState.PROCESSING_DATA && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
             <p className="text-lg font-medium text-slate-700">Processing CSV Data...</p>
             <p className="text-slate-500">Aggregating transactions by Business Area</p>
          </div>
        )}

        {state === AppState.ANALYZING_AI && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
             <p className="text-lg font-medium text-slate-700">Consulting Gemini AI...</p>
             <p className="text-slate-500">Identifying clusters and generating strategic insights</p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Failed</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={() => setState(AppState.IDLE)}
                className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {state === AppState.SUCCESS && analysis && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
              <button 
                onClick={() => setState(AppState.IDLE)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Start New Analysis
              </button>
            </div>
            <AnalysisView data={data} analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
}