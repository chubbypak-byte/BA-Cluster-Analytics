import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Upload Data CSV</h3>
        <p className="text-sm text-slate-500 text-center">
          Upload file <code>H_ZCSR181H_Cleaned_20250930.csv</code><br/> 
          or any CSV with columns <b>BA</b> and <b>Amount</b>.
        </p>
        
        <label className={`
          flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <span>Select CSV File</span>
          <input 
            type="file" 
            accept=".csv"
            className="hidden" 
            onChange={handleChange}
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};