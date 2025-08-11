// components/upload/AudioUploader.tsx (for future audio processing)
'use client';

import React, { useState } from 'react';
import { Mic, Upload, Play, Pause, Trash2 } from 'lucide-react';

interface AudioUploaderProps {
  onAudioUpload: (file: File) => void;
  maxDuration?: number; // in minutes
  isProcessing?: boolean;
}

export function AudioUploader({ 
  onAudioUpload, 
  maxDuration = 60,
  isProcessing = false 
}: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration * 60) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Store timer reference for cleanup
      (recorder as any).timer = timer;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      clearInterval((mediaRecorder as any).timer);
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAudioUpload(file);
    }
  };

  const uploadRecording = () => {
    if (audioBlob) {
      const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      onAudioUpload(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recording Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Mic className="w-8 h-8 text-red-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Record Audio
        </h3>
        <p className="text-gray-600 mb-6">
          Record a conversation or voice note to analyze communication patterns
        </p>

        {isRecording ? (
          <div className="space-y-4">
            <div className="text-2xl font-mono text-red-600">
              {formatTime(recordingTime)}
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Pause className="w-5 h-5 inline mr-2" />
              Stop Recording
            </button>
          </div>
        ) : audioBlob ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={uploadRecording}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Recording
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setRecordingTime(0);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="w-5 h-5 inline mr-2" />
                Discard
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Mic className="w-5 h-5 inline mr-2" />
            Start Recording
          </button>
        )}
      </div>

      {/* File Upload Section */}
      <div className="text-center">
        <div className="text-gray-500 mb-4">or</div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <div className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 mr-2" />
            Upload Audio File
          </div>
        </label>
      </div>
    </div>
  );
}