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

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, analysis }) => {
  
  // Merge analysis cluster data back into numerical data for plotting
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

  // Colors for clusters
  const colors = ['#4f46e5', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Executive Summary (บทสรุปผู้บริหาร)</h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 text-lg leading-relaxed">{analysis.executiveSummary.overview}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
            <h3 className="text-blue-800 font-semibold mb-3 flex items-center">
              <span className="mr-2 text-xl">🚀</span> Strategic Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.executiveSummary.strategicRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start text-slate-700 text-sm">
                  <span className="mr-2 text-blue-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
            <h3 className="text-emerald-800 font-semibold mb-3 flex items-center">
              <span className="mr-2 text-xl">⚖️</span> Policy Implications
            </h3>
            <ul className="space-y-2">
              {analysis.executiveSummary.policyImplications.map((imp, i) => (
                <li key={i} className="flex items-start text-slate-700 text-sm">
                  <span className="mr-2 text-emerald-500">•</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot: Volume vs Value */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Cluster Analysis: Volume vs. Value</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="transactionCount" name="Transactions" unit="" label={{ value: 'Transaction Count', position: 'bottom', offset: 0 }} />
              <YAxis type="number" dataKey="totalAmount" name="Total Amount" unit="" label={{ value: 'Total Amount', angle: -90, position: 'insideLeft' }} />
              <ZAxis type="category" dataKey="clusterName" name="Cluster" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border shadow-lg rounded text-sm">
                      <p className="font-bold text-slate-800">{d.ba}</p>
                      <p className="text-indigo-600">{d.clusterName}</p>
                      <p>Txn: {d.transactionCount}</p>
                      <p>Amt: {d.totalAmount.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Legend />
              {analysis.clusters.map((cluster, index) => (
                <Scatter 
                  key={cluster.id} 
                  name={cluster.name} 
                  data={plotData.filter(p => p.clusterId === cluster.id)} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Average Amount per BA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Average Transaction Size by BA</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={plotData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="ba" type="category" width={100} tick={{fontSize: 10}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgAmount" name="Avg Amount per Txn" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-400 mt-2">*Top 10 BAs shown</p>
        </div>
      </div>

      {/* Cluster Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {analysis.clusters.map((cluster, index) => (
          <div key={cluster.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-2" style={{ backgroundColor: colors[index % colors.length] }} />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{cluster.name}</h3>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                  {cluster.memberBAs.length} BAs
                </span>
              </div>
              
              <p className="text-slate-600 mb-4 text-sm flex-grow">{cluster.description}</p>
              
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Characteristics</h4>
                <ul className="space-y-1">
                  {cluster.characteristics.map((char, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start">
                      <span className="text-indigo-500 mr-2">✓</span> {char}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Members</h4>
                <div className="flex flex-wrap gap-1">
                  {cluster.memberBAs.slice(0, 5).map(ba => (
                    <span key={ba} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200">
                      {ba}
                    </span>
                  ))}
                  {cluster.memberBAs.length > 5 && (
                    <span className="text-xs text-slate-400 px-2 py-1">+{cluster.memberBAs.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};