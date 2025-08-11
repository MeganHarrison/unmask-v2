import React from 'react';

interface CSVPreviewProps {
  data: any[];
  fileName?: string;
}

export function CSVPreview({ data, fileName }: CSVPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data to preview
      </div>
    );
  }

  const headers = Object.keys(data[0]);
  const previewRows = data.slice(0, 5);

  return (
    <div className="space-y-4">
      {fileName && (
        <h3 className="text-lg font-semibold text-gray-900">
          Preview: {fileName}
        </h3>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {previewRows.map((row, idx) => (
              <tr key={idx}>
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 5 && (
        <p className="text-sm text-gray-500 text-center">
          Showing 5 of {data.length} rows
        </p>
      )}
    </div>
  );
}