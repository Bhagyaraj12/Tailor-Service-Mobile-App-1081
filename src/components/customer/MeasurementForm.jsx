import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import { measurementFields } from '../../data/garmentData';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCamera, FiUpload } = FiIcons;

const MeasurementForm = ({ category, onNext, onMeasurementData }) => {
  const [measurementMethod, setMeasurementMethod] = useState(''); // 'sample' or 'custom'
  const [measurements, setMeasurements] = useState({});
  const [sampleImage, setSampleImage] = useState(null);
  const [schedulePickup, setSchedulePickup] = useState(false);

  const fields = measurementFields[category.id] || [];

  const handleMeasurementChange = (fieldId, value) => {
    const newMeasurements = { ...measurements, [fieldId]: value };
    setMeasurements(newMeasurements);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSampleImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    const data = {
      method: measurementMethod,
      measurements: measurementMethod === 'custom' ? measurements : null,
      sampleImage: measurementMethod === 'sample' ? sampleImage : null,
      schedulePickup
    };
    onMeasurementData(data);
    onNext();
  };

  const isValid = () => {
    if (measurementMethod === 'sample') {
      return sampleImage;
    } else if (measurementMethod === 'custom') {
      return fields.every(field => measurements[field.id]);
    }
    return false;
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Measurements</h2>
          <p className="text-gray-600">How would you like to provide measurements?</p>
        </div>

        {!measurementMethod && (
          <div className="space-y-3">
            <Card
              onClick={() => setMeasurementMethod('sample')}
              className="p-4 border-2 border-gray-200 hover:border-primary-600"
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiCamera} className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Sample {category.name}</h3>
                  <p className="text-sm text-gray-600">Take a photo of existing garment</p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => setMeasurementMethod('custom')}
              className="p-4 border-2 border-gray-200 hover:border-primary-600"
            >
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiIcons.FiEdit3} className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Enter Custom Measurements</h3>
                  <p className="text-sm text-gray-600">Fill in detailed measurements</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {measurementMethod === 'sample' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Upload Sample Image</h3>
              
              <div className="space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-600 transition-colors">
                    {sampleImage ? (
                      <img src={sampleImage} alt="Sample" className="max-w-full h-48 object-cover mx-auto rounded" />
                    ) : (
                      <div>
                        <SafeIcon icon={FiUpload} className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Tap to take photo or upload image</p>
                      </div>
                    )}
                  </div>
                </label>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pickup"
                    checked={schedulePickup}
                    onChange={(e) => setSchedulePickup(e.target.checked)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <label htmlFor="pickup" className="text-sm text-gray-700">
                    Schedule fabric pickup from my location
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {measurementMethod === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Enter Measurements</h3>
              
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} ({field.unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements[field.id] || ''}
                      onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {measurementMethod && (
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleNext}
              disabled={!isValid()}
              className="w-full"
            >
              Continue to Summary
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setMeasurementMethod('')}
              className="w-full"
            >
              Change Method
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MeasurementForm;