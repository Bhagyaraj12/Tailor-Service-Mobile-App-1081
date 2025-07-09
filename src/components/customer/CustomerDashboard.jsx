import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, useFirestore, where, orderBy } from '../../contexts/DummyAuthContext';
import Header from '../common/Header';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiPlus, FiClock, FiCheckCircle, FiPackage } = FiIcons;

const CustomerDashboard = ({ onNewOrder }) => {
  const { user } = useAuth();
  const { documents: jobs, loading } = useFirestore('jobs', [
    where('customerId', '==', user?.uid || ''),
    orderBy('createdAt', 'desc')
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending Assignment':
        return FiClock;
      case 'Assigned':
        return FiPackage;
      case 'In Progress':
        return FiIcons.FiTool;
      case 'Completed':
        return FiCheckCircle;
      default:
        return FiClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Assignment':
        return 'text-yellow-600 bg-yellow-50';
      case 'Assigned':
        return 'text-blue-600 bg-blue-50';
      case 'In Progress':
        return 'text-purple-600 bg-purple-50';
      case 'Completed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="My Orders" 
        actions={
          <button
            onClick={onNewOrder}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
          </button>
        }
      />

      <div className="max-w-md mx-auto p-4">
        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <SafeIcon icon={FiPackage} className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start by placing your first tailoring order</p>
            <button
              onClick={onNewOrder}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Place New Order
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.category} - {job.design}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Order #{job.id.slice(-8)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center space-x-1 ${getStatusColor(job.status)}`}>
                      <SafeIcon icon={getStatusIcon(job.status)} className="w-4 h-4" />
                      <span className="text-sm font-medium">{job.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">₹{job.totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Date</span>
                      <span>{format(job.deliveryDate.toDate(), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ordered</span>
                      <span>{format(job.createdAt.toDate(), 'MMM dd, yyyy')}</span>
                    </div>
                    {job.tailorId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assigned to</span>
                        <span>Tailor #{job.tailorId.slice(-6)}</span>
                      </div>
                    )}
                  </div>

                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-1">Add-ons:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.addOns.map(addon => (
                          <span key={addon.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;