import React, { useMemo } from 'react';
import { AnalysisResult, AggregatedBA } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis 
} from 'recharts';

interface AnalysisViewProps {
  data: AggregatedBA[];
  analysis: AnalysisResult;
}

// Format numbers for executive view (e.g. 1.2M, 500k)
const formatCompactNumber = (number: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

// Format currency
const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0
  }).format(number);
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, analysis }) => {
  
  // Calculations for KPI Cards
  const kpi = useMemo(() => {
    const totalRevenue = data.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalTransactions = data.reduce((acc, curr) => acc + curr.transactionCount, 0);
    const avgTicket = totalRevenue / totalTransactions || 0;
    const topBA = data.reduce((prev, current) => (prev.totalAmount > current.totalAmount) ? prev : current);
    
    return { totalRevenue, totalTransactions, avgTicket, topBA };
  }, [data]);

  const plotData = useMemo(() => {
    return data.map(item => {
      const cluster = analysis.clusters.find(c => c.memberBAs.includes(item.ba));
      return {
        ...item,
        clusterName: cluster ? cluster.name : 'Unknown',
        clusterId: cluster ? cluster.id : 'unknown'
      };
    });
  }, [data, analysis]);

  // Executive Palette
  const colors = ['#4f46e5', '#0891b2', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{formatCompactNumber(kpi.totalRevenue)}</h3>
          <div className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">
            Across {data.length} BAs
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{kpi.totalTransactions.toLocaleString()}</h3>
          <p className="text-sm text-slate-500 mt-2">Total volume processed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Avg. Ticket Size</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{formatCompactNumber(kpi.avgTicket)}</h3>
          <p className="text-sm text-slate-500 mt-2">Per transaction</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
           <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider mb-1">Top Performer</p>
           <h3 className="text-2xl font-bold truncate text-white">{kpi.topBA.ba}</h3>
           <p className="text-indigo-100 text-sm mt-1">{formatCurrency(kpi.topBA.totalAmount)}</p>
        </div>
      </div>

      {/* 2. Executive Summary - Report Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-4 text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0zm1.5 1.5H12v6.75a6.75 6.75 0 00-6-6.75zM12.75 12V5.25a6.75 6.75 0 016 6.75H12.75z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
                <p className="text-slate-500 text-sm">AI-Generated Strategic Overview</p>
            </div>
        </div>
        
        <div className="p-8">
            <div className="prose prose-lg prose-slate max-w-none mb-10">
                 <p className="text-slate-700 leading-8">{analysis.executiveSummary.overview}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative pl-6 border-l-4 border-indigo-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        Strategic Recommendations
                    </h3>
                    <ul className="space-y-4">
                        {analysis.executiveSummary.strategicRecommendations.map((rec, i) => (
                            <li key={i} className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{i+1}</span>
                                <span className="text-slate-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="relative pl-6 border-l-4 border-emerald-500">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        Policy Implications
                    </h3>
                    <ul className="space-y-4">
                        {analysis.executiveSummary.policyImplications.map((imp, i) => (
                            <li key={i} className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">P</span>
                                <span className="text-slate-700">{imp}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Cluster Distribution</h3>
                <p className="text-sm text-slate-500">Volume vs. Value by Business Area</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" dataKey="transactionCount" name="Transactions" stroke="#94a3b8" tick={{fontSize: 12}} />
                        <YAxis type="number" dataKey="totalAmount" name="Total Amount" stroke="#94a3b8" tickFormatter={(val) => formatCompactNumber(val)} tick={{fontSize: 12}} />
                        <ZAxis type="category" dataKey="clusterName" name="Cluster" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                                <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
                                <p className="font-bold text-base mb-1">{d.ba}</p>
                                <p className="text-indigo-300 font-semibold mb-2">{d.clusterName}</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    <span className="text-slate-400">Transactions:</span>
                                    <span className="text-right">{d.transactionCount}</span>
                                    <span className="text-slate-400">Total Value:</span>
                                    <span className="text-right">{formatCompactNumber(d.totalAmount)}</span>
                                </div>
                                </div>
                            );
                            }
                            return null;
                        }} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        {analysis.clusters.map((cluster, index) => (
                            <Scatter 
                            key={cluster.id} 
                            name={cluster.name} 
                            data={plotData.filter(p => p.clusterId === cluster.id)} 
                            fill={colors[index % colors.length]} 
                            shape="circle"
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-[500px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Performance Ranking</h3>
                <p className="text-sm text-slate-500">Average Transaction Size (Top 10 BAs)</p>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plotData.sort((a,b) => b.avgAmount - a.avgAmount).slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => formatCompactNumber(val)} tick={{fontSize: 12}} />
                        <YAxis dataKey="ba" type="category" width={120} stroke="#64748b" tick={{fontSize: 11, fontWeight: 500}} />
                        <Tooltip 
                             cursor={{fill: '#f8fafc'}}
                             contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="avgAmount" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* 4. Detailed Persona Cards */}
      <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Cluster Profiles & Personas</h2>
          <div className="grid grid-cols-1 gap-8">
            {analysis.clusters.map((cluster, index) => (
            <div key={cluster.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-md transition-shadow duration-300">
                {/* Card Header with Color Strip */}
                <div className="h-2 w-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                <div className="p-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        
                        {/* Left: Identity */}
                        <div className="lg:w-1/3">
                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold text-white mb-4" style={{ backgroundColor: colors[index % colors.length] }}>
                                Segment {index + 1}
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">{cluster.name}</h3>
                            <p className="text-slate-500 mb-6">{cluster.description}</p>
                            
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Metrics</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Members</span>
                                        <span className="font-bold text-slate-900">{cluster.memberBAs.length} BAs</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${(cluster.memberBAs.length / data.length) * 100}%`, backgroundColor: colors[index % colors.length] }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Deep Dive */}
                        <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Persona */}
                            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100/50">
                                <div className="flex items-center mb-4">
                                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg mr-3">👤</span>
                                    <h4 className="font-bold text-indigo-900">Who are they?</h4>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    {cluster.customerPersona}
                                </p>
                            </div>

                            {/* Characteristics */}
                            <div className="bg-white p-6 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    Distinguishing Traits
                                </h4>
                                <ul className="space-y-3">
                                    {cluster.characteristics.map((char, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start">
                                        <span className="block w-1.5 h-1.5 mt-1.5 rounded-full bg-slate-400 mr-2 flex-shrink-0"></span>
                                        {char}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Member List - Collapsible or Scrollable */}
                            <div className="md:col-span-2 mt-2">
                                <details className="group">
                                    <summary className="flex items-center cursor-pointer text-sm text-slate-500 hover:text-indigo-600 font-medium select-none">
                                        <svg className="w-4 h-4 mr-2 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        View All Members ({cluster.memberBAs.length})
                                    </summary>
                                    <div className="mt-4 flex flex-wrap gap-2 animate-fade-in">
                                        {cluster.memberBAs.map(ba => (
                                            <span key={ba} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs hover:border-indigo-300 transition-colors cursor-default shadow-sm">
                                            {ba}
                                            </span>
                                        ))}
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ))}
          </div>
      </div>
    </div>
  );
};