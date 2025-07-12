import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseContext';
import Card from '../common/Card';
import Button from '../common/Button';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiUpload, FiImage, FiEdit3 } = FiIcons;

const MeasurementCapture = ({ category, onMeasurementComplete }) => {
  const { supabase } = useAuth();
  const [measurementMethod, setMeasurementMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({
    front: null,
    side: null,
    sample: null
  });
  const [measurements, setMeasurements] = useState({});
  const fileInputRef = useRef();

  const handleImageCapture = async (file, type) => {
    try {
      setLoading(true);
      
      // Upload to Supabase Storage
      const filename = `${Date.now()}_${type}.jpg`;
      const { data, error } = await supabase.storage
        .from('measurements')
        .upload(`customer_images/${filename}`, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('measurements')
        .getPublicUrl(`customer_images/${filename}`);

      setImages(prev => ({
        ...prev,
        [type]: publicUrl
      }));

      // If both images are captured for AI measurement, process them
      if (type !== 'sample' && images[type === 'front' ? 'side' : 'front']) {
        await processAIMeasurements();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processAIMeasurements = async () => {
    try {
      setLoading(true);
      
      // Mock AI measurement processing
      // In real implementation, this would call your AI measurement API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockMeasurements = {
        bust: 34.5,
        waist: 28.0,
        shoulder: 15.2,
        sleeve: 21.5,
        height: 160.0
      };

      setMeasurements(mockMeasurements);
      
      onMeasurementComplete({
        method: 'ai_camera',
        measurements: mockMeasurements,
        images: {
          front: images.front,
          side: images.side
        }
      });
    } catch (error) {
      console.error('Error processing measurements:', error);
      alert('Failed to process measurements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      handleImageCapture(file, type);
    }
  };

  const handleManualSubmit = (manualMeasurements) => {
    onMeasurementComplete({
      method: 'manual',
      measurements: manualMeasurements
    });
  };

  const renderMethodSelection = () => (
    <div className="space-y-3">
      <Card 
        onClick={() => setMeasurementMethod('ai_camera')}
        className="p-4 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiCamera} className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Camera Measurement</h3>
            <p className="text-sm text-gray-600">Take photos for automatic measurements</p>
          </div>
        </div>
      </Card>

      <Card 
        onClick={() => setMeasurementMethod('sample_image')}
        className="p-4 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiImage} className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Upload Sample Image</h3>
            <p className="text-sm text-gray-600">Upload a photo of similar garment</p>
          </div>
        </div>
      </Card>

      <Card 
        onClick={() => setMeasurementMethod('manual')}
        className="p-4 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiEdit3} className="w-6 h-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Manual Measurements</h3>
            <p className="text-sm text-gray-600">Enter measurements manually</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAICamera = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Camera Measurement</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Front Photo */}
        <Card className="p-4">
          <div className="aspect-square relative">
            {images.front ? (
              <img 
                src={images.front} 
                alt="Front view" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileSelect(e, 'front')}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  onClick={() => fileInputRef.current.click()}
                  variant="outline"
                  size="sm"
                >
                  Take Front Photo
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Front View</p>
        </Card>

        {/* Side Photo */}
        <Card className="p-4">
          <div className="aspect-square relative">
            {images.side ? (
              <img 
                src={images.side} 
                alt="Side view" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileSelect(e, 'side')}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  onClick={() => fileInputRef.current.click()}
                  variant="outline"
                  size="sm"
                >
                  Take Side Photo
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">Side View</p>
        </Card>
      </div>

      {loading && (
        <div className="text-center py-4">
          <motion.div
            className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm text-gray-600 mt-2">Processing measurements...</p>
        </div>
      )}

      {Object.keys(measurements).length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Predicted Measurements</h4>
          <div className="space-y-2">
            {Object.entries(measurements).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                <span className="font-medium">{value} inches</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderSampleUpload = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Sample Image</h3>
      
      <Card className="p-4">
        <div className="aspect-square relative">
          {images.sample ? (
            <img 
              src={images.sample} 
              alt="Sample garment" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'sample')}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="text-center">
                <SafeIcon 
                  icon={FiUpload} 
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                />
                <Button
                  onClick={() => fileInputRef.current.click()}
                  variant="outline"
                  size="sm"
                >
                  Upload Sample Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {images.sample && (
        <Button
          onClick={() => onMeasurementComplete({
            method: 'sample_image',
            sample_image_url: images.sample
          })}
          className="w-full"
        >
          Continue with Sample Image
        </Button>
      )}
    </div>
  );

  const renderContent = () => {
    switch (measurementMethod) {
      case 'ai_camera':
        return renderAICamera();
      case 'sample_image':
        return renderSampleUpload();
      case 'manual':
        return (
          <ManualMeasurements 
            category={category} 
            onSubmit={handleManualSubmit} 
          />
        );
      default:
        return renderMethodSelection();
    }
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        {measurementMethod && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMeasurementMethod(null)}
            className="mb-4"
          >
            ← Change Method
          </Button>
        )}
        
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default MeasurementCapture;