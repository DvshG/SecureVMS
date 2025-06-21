import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Monitor } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void;
  currentPhoto?: string | null;
  className?: string;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ 
  onPhotoCapture, 
  currentPhoto, 
  className = '' 
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    setIsLoading(true);
    
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera permissions with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Ensure video starts playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsLoading(false);
              console.log('Camera started successfully');
            }).catch(err => {
              console.error('Error playing video:', err);
              setCameraError('Failed to start camera preview');
              setIsLoading(false);
            });
          }
        };

        // Handle video errors
        videoRef.current.onerror = (err) => {
          console.error('Video error:', err);
          setCameraError('Camera error occurred');
          setIsLoading(false);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsLoading(false);
      let errorMessage = 'Unable to access camera. ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please allow camera permissions in your browser and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera constraints not supported.';
        } else {
          errorMessage += 'Please check camera permissions or use file upload.';
        }
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setShowCamera(false);
    setCameraError(null);
    setIsLoading(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL with good quality
        const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoCapture(photoUrl);
        stopCamera();
        
        // Show success message
        alert('Photo captured successfully!');
      } else {
        alert('Camera not ready. Please wait a moment and try again.');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image file is too large. Please select an image smaller than 5MB.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          onPhotoCapture(result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a valid image file (JPG, PNG, GIF, etc.).');
      }
    }
  };

  const removePhoto = () => {
    onPhotoCapture('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Photo Display */}
      {currentPhoto && (
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={currentPhoto}
              alt="Captured photo"
              className="w-32 h-32 rounded-lg object-cover border-4 border-gray-200"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -top-2 -right-2 bg-error-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-error-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Camera View Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Take Photo</h3>
              <p className="text-sm text-gray-600">Position yourself in the center and click capture</p>
            </div>
            
            {cameraError ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4 text-sm">{cameraError}</div>
                <div className="space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={stopCamera}
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg bg-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Loading overlay */}
                  {(isLoading || (stream && videoRef.current && videoRef.current.readyState < 2)) && (
                    <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-gray-600">
                        {isLoading ? 'Starting camera...' : 'Loading...'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={isLoading || !stream || (videoRef.current && videoRef.current.readyState < 2)}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Photo Capture Options */}
      {!currentPhoto && !showCamera && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors border-2 border-primary-600"
          >
            <Camera className="w-5 h-5 mr-2" />
            Use Camera
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-4 py-3 bg-white text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors border-2 border-primary-600"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Retake Options */}
      {currentPhoto && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Camera className="w-4 h-4 mr-2" />
            Retake with Camera
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-lg hover:bg-secondary-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Different Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;