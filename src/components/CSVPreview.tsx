'use client';

import React from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface CSVPreviewProps {
  fileName: string;
  fileSize: number;
  data: any[];
}

export function CSVPreview({ fileName, fileSize, data }: CSVPreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateData = () => {
    if (data.length < 2) return { isValid: false, message: 'File appears to be empty or too short' };
    
    const headers = data[0];
    if (!headers.some(h => h.toLowerCase().includes('message') || h.toLowerCase().includes('text'))) {
      return { isValid: false, message: 'No message content column detected' };
    }
    
    if (!headers.some(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time'))) {
      return { isValid: false, message: 'No timestamp column detected' };
    }

    return { isValid: true, message: 'Data format looks good!' };
  };

  const validation = validateData();

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-medium text-gray-900">{fileName}</h3>
            <p className="text-sm text-gray-600">{formatFileSize(fileSize)}</p>
          </div>
        </div>
        
        {/* Validation Status */}
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {validation.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            validation.isValid ? 'text-green-700' : 'text-red-700'
          }`}>
            {validation.message}
          </span>
        </div>
      </div>

      {/* Data Preview */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Data Preview</h4>
          <p className="text-sm text-gray-600 mt-1">
            Showing first {Math.min(data.length - 1, 10)} rows of {data.length - 1} total messages
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {data[0]?.map((header: string, index: number) => (
                  <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.slice(1, 11).map((row: any[], rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {String(cell).length > 50 ? String(cell).substring(0, 50) + '...' : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.length - 1}</div>
          <div className="text-sm text-blue-700">Total Messages</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{data[0]?.length || 0}</div>
          <div className="text-sm text-green-700">Data Columns</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatFileSize(fileSize)}</div>
          <div className="text-sm text-purple-700">File Size</div>
        </div>
      </div>
    </div>
  );
}