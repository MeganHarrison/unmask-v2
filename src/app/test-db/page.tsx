'use client';

import { useEffect, useState } from 'react';

interface Column {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

interface TableDetail {
  name: string;
  type: string;
  sql: string;
  columns: Column[];
  rowCount: number;
}

interface DatabaseInfo {
  tables: any[];
  tableDetails: TableDetail[];
  totalTables: number;
  success: boolean;
}

export default function TestDBPage() {
  const [data, setData] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTables() {
      try {
        const response = await fetch('/api/test-db');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json() as DatabaseInfo;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">D1 Database Inspector</h1>
        <p className="text-lg">Loading database information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">D1 Database Inspector</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">D1 Database Inspector</h1>
        <p>No data received.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">D1 Database Inspector</h1>
      
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
        <p className="text-lg">Found <strong>{data.totalTables}</strong> tables in the database</p>
      </div>
      
      <div className="space-y-6">
        {data.tableDetails.map((table) => (
          <div key={table.name} className="border rounded-lg shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="text-xl font-semibold flex items-center justify-between">
                <span>{table.name}</span>
                <span className="text-sm font-normal text-gray-600">
                  {table.rowCount.toLocaleString()} rows
                </span>
              </h2>
            </div>
            
            <div className="p-4">
              {/* Column Information */}
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Columns:</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Not Null</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Default</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Primary Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((column, idx) => (
                      <tr key={column.cid} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2 font-mono">{column.name}</td>
                        <td className="px-3 py-2">{column.type}</td>
                        <td className="px-3 py-2">{column.notnull ? '✓' : ''}</td>
                        <td className="px-3 py-2">{column.dflt_value || '-'}</td>
                        <td className="px-3 py-2">{column.pk ? '🔑' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* SQL Definition */}
              {table.sql && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">SQL Definition:</h3>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto font-mono">
                    {table.sql}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.tableDetails.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No tables found in the database.</p>
        </div>
      )}
    </div>
  );
}