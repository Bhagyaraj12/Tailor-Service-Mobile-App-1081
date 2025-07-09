import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';

const DesignSelector = ({ category, onSelectDesign, onNext }) => {
  const [selectedDesign, setSelectedDesign] = useState(null);

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
    onSelectDesign(design);
  };

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose {category.name} Design
          </h2>
          <p className="text-gray-600">Select your preferred design style</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {category.designs.map((design) => (
            <motion.div
              key={design.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                onClick={() => handleDesignSelect(design)}
                className={`p-4 border-2 transition-all ${
                  selectedDesign?.id === design.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{design.name}</h3>
                    <p className="text-sm text-gray-600">
                      {design.price > 0 ? `+₹${design.price}` : 'Base price'}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDesign?.id === design.id
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedDesign?.id === design.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            onClick={onNext}
            disabled={!selectedDesign}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DesignSelector;