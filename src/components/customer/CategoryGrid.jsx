import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { garmentCategories } from '../../data/garmentData';

const CategoryGrid = ({ onSelectCategory }) => {
  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-4"
      >
        {garmentCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => onSelectCategory(category)}
              className="p-6 text-center"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600">
                Starting from ₹{category.basePrice}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategoryGrid;