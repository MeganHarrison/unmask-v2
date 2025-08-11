// app/dashboard/upload/page.tsx
'use client';

import React, { useState } from 'react';
import { Upload, FileText, Smartphone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { FileUploader } from '@/components/upload/FileUploader';
import { CSVPreview } from '@/components/upload/CSVPreview';
import { ProgressTracker } from '@/components/upload/ProgressTracker';

interface UploadStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const steps: UploadStep[] = [
    {
      id: 'upload',
      title: 'Upload Your Data',
      description: 'Select and upload your text message export file',
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'complete' : 'pending'
    },
    {
      id: 'preview',
      title: 'Preview & Validate',
      description: 'Review your data and confirm it looks correct',
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'complete' : 'pending'
    },
    {
      id: 'process',
      title: 'AI Processing',
      description: 'AI analyzes your messages and creates insights',
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'complete' : 'pending'
    },
    {
      id: 'complete',
      title: 'Ready to Explore',
      description: 'Your relationship intelligence is ready',
      status: currentStep === 3 ? 'complete' : 'pending'
    }
  ];

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    
    try {
      // Parse CSV file
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      setParsedData(rows.slice(0, 100)); // Preview first 100 rows
      setCurrentStep(1);
    } catch (error) {
      console.error('Error parsing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadedFile) return;
    
    setCurrentStep(2);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/upload/messages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setCurrentStep(3);
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error state
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Your Relationship Data
          </h1>
          <p className="text-gray-600">
            Import your text messages to unlock deep insights about your relationship patterns, 
            communication style, and emotional dynamics.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    step.status === 'complete' 
                      ? 'bg-green-500 border-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : step.status === 'error'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step.status === 'complete' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      step.status === 'active' || step.status === 'complete' 
                        ? 'text-gray-900' 
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-24 mx-4 ${
                    currentStep > index ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          {currentStep === 0 && (
            <UploadStep onFileUpload={handleFileUpload} isProcessing={isProcessing} />
          )}
          
          {currentStep === 1 && uploadedFile && (
            <PreviewStep 
              file={uploadedFile}
              data={parsedData}
              onConfirm={handleConfirmUpload}
              onBack={() => setCurrentStep(0)}
            />
          )}
          
          {currentStep === 2 && (
            <ProcessingStep />
          )}
          
          {currentStep === 3 && (
            <CompleteStep />
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadStepProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

function UploadStep({ onFileUpload, isProcessing }: UploadStepProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Your Text Messages
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Upload a CSV export of your text messages to begin analyzing your relationship patterns.
        </p>
      </div>

      <FileUploader 
        onFileUpload={onFileUpload}
        isProcessing={isProcessing}
        acceptedTypes=".csv"
        maxSize={50} // 50MB
      />

      {/* How to Export Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How to Export Your Messages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExportInstructions
            platform="iPhone"
            icon={<Smartphone className="w-6 h-6" />}
            steps={[
              "Open Settings > [Your Name] > iCloud",
              "Enable Messages backup",
              "Use third-party app like 3uTools to export",
              "Export as CSV format"
            ]}
          />
          <ExportInstructions
            platform="Android"
            icon={<MessageSquare className="w-6 h-6" />}
            steps={[
              "Install SMS Backup & Restore app",
              "Grant necessary permissions",
              "Create backup and export as CSV",
              "Share or save the CSV file"
            ]}
          />
        </div>
      </div>
    </div>
  );
}

interface ExportInstructionsProps {
  platform: string;
  icon: React.ReactNode;
  steps: string[];
}

function ExportInstructions({ platform, icon, steps }: ExportInstructionsProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900">{platform}</h4>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-start">
            <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

interface PreviewStepProps {
  file: File;
  data: any[];
  onConfirm: () => void;
  onBack: () => void;
}

function PreviewStep({ file, data, onConfirm, onBack }: PreviewStepProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Preview Your Data
        </h2>
        <p className="text-gray-600">
          Review your uploaded data to ensure it looks correct before processing.
        </p>
      </div>

      <CSVPreview 
        fileName={file.name}
        fileSize={file.size}
        data={data}
      />

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Process Data
        </button>
      </div>
    </div>
  );
}

function ProcessingStep() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        AI is Analyzing Your Relationship
      </h2>
      <p className="text-gray-600 mb-8">
        Our AI is processing your messages to identify patterns, sentiments, and insights.
        This may take a few minutes.
      </p>
      
      <ProgressTracker 
        steps={[
          'Parsing message data',
          'Analyzing sentiment patterns',
          'Identifying communication trends',
          'Creating relationship timeline',
          'Generating insights'
        ]}
      />
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Your Relationship Intelligence is Ready!
      </h2>
      <p className="text-gray-600 mb-8">
        We've analyzed your messages and created personalized insights about your relationship patterns.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">2,847</div>
          <div className="text-sm text-blue-700">Messages Analyzed</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">8.2/10</div>
          <div className="text-sm text-green-700">Health Score</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">12</div>
          <div className="text-sm text-purple-700">Key Insights</div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/dashboard/chat">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Chat with Your AI Coach
          </button>
        </Link>
        <Link href="/dashboard/insights">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            View Your Insights
          </button>
        </Link>
      </div>
    </div>
  );
}