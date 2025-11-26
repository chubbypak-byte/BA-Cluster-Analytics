import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`
          relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-in-out cursor-pointer
          ${isDragOver 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' 
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:shadow-lg'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Data CSV</h3>
        <p className="text-slate-500 mb-6">
          Drag and drop your file here, or click to browse.
          <br/>
          <span className="text-xs text-slate-400 mt-2 block">Supported format: .csv</span>
        </p>
        
        <input 
          ref={inputRef}
          type="file" 
          accept=".csv"
          className="hidden" 
          onChange={handleChange}
          disabled={disabled}
        />

        <div className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition shadow-md">
          Choose File
        </div>
      </div>
      
      <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-medium bg-slate-100 inline-block px-3 py-1 rounded-full border border-slate-200">
             Required columns: <strong>BA</strong>, <strong>Amount</strong>
          </p>
      </div>
    </div>
  );
};