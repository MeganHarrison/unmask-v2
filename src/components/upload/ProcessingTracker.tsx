// components/upload/ProcessingTracker.tsx - Enhanced processing tracker
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface ProcessingJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  steps: ProcessingStep[];
  results?: ProcessingResults;
  error?: string;
  updatedAt: string;
}

interface ProcessingStep {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message: string;
  progress: number;
}

interface ProcessingResults {
  totalMessages: number;
  dateRange: { start: string; end: string };
  sentimentStats: {
    avgSentiment: number;
    positiveCount: number;
    negativeCount: number;
  };
  communicationStats: {
    averagePerDay: number;
    mostActiveDay: string;
  };
  insights: string[];
  healthScore: number;
}

interface ProcessingTrackerProps {
  jobId: string;
  onComplete: (results: ProcessingResults) => void;
  onError: (error: string) => void;
}

export function ProcessingTracker({ jobId, onComplete, onError }: ProcessingTrackerProps) {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/upload/status/${jobId}`);
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const jobData: ProcessingJob = await response.json();
        setJob(jobData);

        if (jobData.status === 'completed') {
          setIsPolling(false);
          if (jobData.results) {
            onComplete(jobData.results);
          }
        } else if (jobData.status === 'failed') {
          setIsPolling(false);
          onError(jobData.error || 'Processing failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
        setIsPolling(false);
        onError('Failed to check processing status');
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, isPolling, onComplete, onError]);

  if (!job) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading processing status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">{job.progress}%</div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${job.progress}%` }}
          />
        </div>
        <p className="text-gray-600">
          {job.status === 'processing' ? 'Processing your relationship data...' : 
           job.status === 'completed' ? 'Processing complete!' :
           job.status === 'failed' ? 'Processing failed' : 'Queued for processing'}
        </p>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {job.steps.map((step, index) => (
          <ProcessingStepItem key={index} step={step} />
        ))}
      </div>

      {/* Results Preview */}
      {job.status === 'completed' && job.results && (
        <ResultsPreview results={job.results} />
      )}

      {/* Error Display */}
      {job.status === 'failed' && job.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">Processing Failed</span>
          </div>
          <p className="text-red-600 text-sm mt-2">{job.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function ProcessingStepItem({ step }: { step: ProcessingStep }) {
  const getStepIcon = () => {
    switch (step.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepColor = () => {
    switch (step.status) {
      case 'complete':
        return 'text-green-700';
      case 'active':
        return 'text-blue-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {getStepIcon()}
      <div className="flex-1">
        <div className={`font-medium ${getStepColor()}`}>{step.name}</div>
        <div className="text-sm text-gray-600">{step.message}</div>
      </div>
      {step.status === 'active' && (
        <div className="text-sm text-gray-500">{step.progress}%</div>
      )}
    </div>
  );
}

function ResultsPreview({ results }: { results: ProcessingResults }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-green-900">Processing Complete!</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{results.totalMessages.toLocaleString()}</div>
          <div className="text-sm text-green-700">Messages Analyzed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{results.healthScore}/10</div>
          <div className="text-sm text-green-700">Health Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{results.sentimentStats.positiveCount}</div>
          <div className="text-sm text-green-700">Positive Messages</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{Math.round(results.communicationStats.averagePerDay)}</div>
          <div className="text-sm text-green-700">Messages/Day</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-green-900">Key Insights:</h4>
        {results.insights.map((insight, index) => (
          <div key={index} className="text-sm text-green-700 flex items-start">
            <span className="mr-2">•</span>
            {insight}
          </div>
        ))}
      </div>

      <div className="text-sm text-green-600">
        Data Range: {formatDate(results.dateRange.start)} - {formatDate(results.dateRange.end)}
      </div>
    </div>
  );
}