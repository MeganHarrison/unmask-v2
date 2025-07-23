'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisProgress {
  total: number;
  analyzed: number;
  unanalyzed: number;
  percentage: number;
}

export function AnalyzeButton() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const checkProgress = async () => {
    try {
      const response = await fetch('/api/ai/analyze-messages');
      const data = await response.json() as AnalysisProgress;
      setProgress(data);
      return data;
    } catch (err) {
      console.error('Error checking progress:', err);
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      // Check initial progress
      await checkProgress();

      // Start analysis
      const response = await fetch('/api/ai/analyze-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 })
      });

      const result = await response.json() as { message?: string; error?: string };

      if (response.ok) {
        setSuccess(result.message || 'Analysis completed');
        // Check final progress
        await checkProgress();
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to start analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={startAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Analyze Messages with AI
            </>
          )}
        </Button>

        {!analyzing && (
          <Button
            variant="outline"
            onClick={checkProgress}
          >
            Check Progress
          </Button>
        )}
      </div>

      {progress && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Analysis Progress: {progress.analyzed} / {progress.total} messages ({progress.percentage}%)
          </div>
          <Progress value={progress.percentage} className="w-full" />
          {progress.unanalyzed > 0 && (
            <div className="text-xs text-gray-500">
              {progress.unanalyzed} messages remaining
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}