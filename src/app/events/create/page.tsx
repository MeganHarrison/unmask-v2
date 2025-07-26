"use client"

import React, { useState } from 'react';
import { Calendar, MapPin, Tag, FileText, Save, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Import your ImageUploader component
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
  maxFileSize = 10 * 1024 * 1024 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingImageUrl);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      
      const result = await response.json();
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
      
      validateFile(file);
      
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const result = await uploadToR2(file) as { imageUrl: string; thumbnailUrl: string };
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      URL.revokeObjectURL(previewUrl);
      setPreview(result.imageUrl);
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
      setTimeout(() => setUploadProgress(0), 1000);
      
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
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
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
                <div className="w-12 h-12 border-4 border-white rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            ×
          </button>
        </div>
      ) : (
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
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm">Processing image...</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
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

const CreateEventPage = () => {
  const [formData, setFormData] = useState<{
    name: string;
    date: string;
    category: string;
    location: string;
    notes: string;
    image_url: string | null;
    image_thumbnail_url: string | null;
  }>({
    name: '',
    date: '',
    category: '',
    location: '',
    notes: '',
    image_url: null,
    image_thumbnail_url: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [tempEventId, setTempEventId] = useState<string | null>(null);

  // Generate temporary event ID for image uploads before saving
  React.useEffect(() => {
    setTempEventId(`temp_${Date.now()}`);
  }, []);

  const categories = [
    'Anniversary',
    'Birthday',
    'Date Night',
    'Vacation',
    'Milestone',
    'Holiday',
    'Family Event',
    'Adventure',
    'Celebration',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (uploadResult: { imageUrl: string | null; thumbnailUrl: string | null }) => {
    if (uploadResult.imageUrl) {
      setFormData(prev => ({
        ...prev,
        image_url: uploadResult.imageUrl,
        image_thumbnail_url: uploadResult.thumbnailUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image_url: null,
        image_thumbnail_url: null
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error('Event name is required');
    }
    if (!formData.date) {
      throw new Error('Event date is required');
    }
    if (!formData.category) {
      throw new Error('Please select a category');
    }
  };

  const saveEvent = async () => {
    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      validateForm();

      // Create the event in Supabase
      const { data, error } = await supabase
      .from('relationship_events')
      .insert([{
        name: formData.name,
        date: formData.date,
        category: formData.category,
        location: formData.location || null,
        notes: formData.notes || null,
        photo: formData.image_url, // Changed from image_url to photo
        // image_thumbnail_url: formData.image_thumbnail_url, // Remove this line
        created_at: new Date().toISOString()
      }])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      setSubmitStatus({
        type: 'success',
        message: 'Event created successfully!'
      });

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          date: '',
          category: '',
          location: '',
          notes: '',
          image_url: null,
          image_thumbnail_url: null
        });
        setTempEventId(`temp_${Date.now()}`);
        setSubmitStatus(null);
      }, 2000);

    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Timeline
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Add a special moment to your relationship timeline</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Tag className="w-4 h-4 mr-2" />
                Event Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter event name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Date and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Tag className="w-4 h-4 mr-2" />
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select category...</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where did this happen?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Event Photo
              </label>
              {tempEventId && (
                <ImageUploader
                  eventId={tempEventId}
                  onUploadComplete={handleImageUpload}
                  existingImageUrl={formData.image_url}
                  className="w-full"
                />
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Share your thoughts about this moment..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div className={`p-4 rounded-lg ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={saveEvent}
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-lg font-semibold transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              } text-white`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Event...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload high-quality images for the best timeline experience</li>
            <li>• Be specific with locations to trigger memories later</li>
            <li>• Use notes to capture emotions and details you don&apos;t want to forget</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;