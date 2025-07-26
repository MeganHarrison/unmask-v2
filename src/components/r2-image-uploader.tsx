import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Check } from 'lucide-react';

interface ImageUploaderProps {
  eventId: string;
  onUploadComplete?: (result: { imageUrl: string | null; thumbnailUrl: string | null }) => void;
  existingImageUrl?: string | null;
  className?: string;
  maxFileSize?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  eventId, 
  onUploadComplete, 
  existingImageUrl = null,
  className = "",
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
    }
    
    if (file.size > maxFileSize) {
      throw new Error(`File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`);
    }
  };

  const uploadToR2 = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const result = await response.json() as { imageUrl: string; thumbnailUrl: string };
      return result;
    } catch (err: any) {
      throw new Error(`Upload failed: ${err.message}`);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);
      
      // Validate file
      validateFile(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Upload to R2
      const result = await uploadToR2(file) as { imageUrl: string; thumbnailUrl: string };
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      
      // Set actual uploaded image
      setPreview(result.imageUrl);
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      setPreview(existingImageUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onUploadComplete) {
      onUploadComplete({ imageUrl: null, thumbnailUrl: null });
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      {preview ? (
        // Image Preview
        <div className="relative group">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Event preview" 
              className="w-full h-full object-cover"
            />
            
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <div className="text-sm">Uploading... {uploadProgress}%</div>
                  <div className="w-32 h-2 bg-gray-300 rounded-full mt-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {uploadProgress === 100 && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center">
                <Check className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
          
          <button 
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload Zone
        <div 
          className={`
            w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
            ${dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
                <p className="text-sm">Processing image...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium mb-2">Drop an image here</p>
                <p className="text-sm">or click to browse</p>
                <p className="text-xs mt-2 text-gray-400">
                  Supports JPEG, PNG, WebP, GIF up to {Math.round(maxFileSize / 1024 / 1024)}MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

// Usage Example Component
const EventForm = () => {
  const [eventData, setEventData] = useState<{
    name: string;
    date: string;
    category: string;
    location: string;
    notes: string;
    imageUrl: string | null;
    thumbnailUrl?: string | null;
  }>({
    name: '',
    date: '',
    category: '',
    location: '',
    notes: '',
    imageUrl: null
  });

  const handleImageUpload = (uploadResult: { imageUrl: string | null; thumbnailUrl: string | null }) => {
    setEventData(prev => ({
      ...prev,
      imageUrl: uploadResult.imageUrl,
      thumbnailUrl: uploadResult.thumbnailUrl
    }));
  };

  const saveEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      
      if (response.ok) {
        console.log('Event saved successfully!');
        // Reset form or redirect
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Event</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Event Name</label>
          <input 
            type="text"
            value={eventData.name}
            onChange={(e) => setEventData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter event name..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input 
            type="date"
            value={eventData.date}
            onChange={(e) => setEventData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Event Image</label>
          <ImageUploader 
            eventId={Date.now().toString()} // In real app, use actual event ID
            onUploadComplete={handleImageUpload}
            existingImageUrl={eventData.imageUrl}
          />
        </div>
        
        <button 
          onClick={saveEvent}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save Event
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;