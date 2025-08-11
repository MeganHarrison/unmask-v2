'use client';

import React, { useState } from 'react';

export default function CSVImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the Cloudflare Worker endpoint if available, otherwise use local API
      const workerUrl = process.env.NEXT_PUBLIC_CSV_WORKER_URL;
      const endpoint = workerUrl || '/api/csv-import';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as { rowsImported?: number; error?: string };

      if (response.ok) {
        setMessage(`Success! Imported ${data.rowsImported} rows to the texts-bc table.`);
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to import CSV');
      }
    } catch (err) {
      setError('An error occurred while uploading the file');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">CSV Import to D1 Database</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Upload a CSV file to import its data into the <code className="bg-gray-100 px-2 py-1 rounded">texts-bc</code> table 
            in the <code className="bg-gray-100 px-2 py-1 rounded">megan-personal</code> D1 database.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
            Select CSV File
          </label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Selected file: <span className="font-semibold">{file.name}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isLoading}
          className={`w-full py-2 px-4 rounded-md font-semibold text-white transition-colors
            ${!file || isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
        >
          {isLoading ? 'Importing...' : 'Import CSV to Database'}
        </button>
      </div>
    </div>
  );
}