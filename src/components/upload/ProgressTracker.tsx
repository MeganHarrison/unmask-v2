import React from 'react';

interface ProgressTrackerProps {
  progress: number;
  status: string;
  message?: string;
}

export function ProgressTracker({ progress, status, message }: ProgressTrackerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {status}
        </span>
        <span className="text-sm text-gray-500">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}