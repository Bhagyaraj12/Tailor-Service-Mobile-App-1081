import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseContext';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const { FiPackage, FiMapPin, FiTruck } = FiIcons;

const CustomerDashboard = ({ onNewOrder }) => {
  const { userId, supabase } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Direct Supabase query for better reliability
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        if (!userId) {
          console.log('No user ID available for fetching jobs');
          setJobs([]);
          return;
        }

        console.log('Fetching jobs for customer:', userId);
        const { data, error } = await supabase
          .from('jobs_tc')
          .select('*')
          .eq('customer_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Process data to handle JSON fields
        const processedJobs = (data || []).map(job => {
          let addOns = [];
          let measurementData = {};
          
          try {
            addOns = typeof job.add_ons === 'string' 
              ? JSON.parse(job.add_ons) 
              : (job.add_ons || []);
          } catch (e) {
            console.warn('Error parsing add_ons:', e);
          }
          
          try {
            measurementData = typeof job.measurement_data === 'string'
              ? JSON.parse(job.measurement_data)
              : (job.measurement_data || {});
          } catch (e) {
            console.warn('Error parsing measurement_data:', e);
          }
          
          return {
            ...job,
            addOns,
            measurementData
          };
        });

        setJobs(processedJobs);
        console.log('Fetched jobs:', processedJobs.length);
      } catch (error) {
        console.error('Error fetching customer jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId, supabase]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Assignment':
        return 'text-yellow-600 bg-yellow-50';
      case 'Assigned':
        return 'text-blue-600 bg-blue-50';
      case 'In Progress':
        return 'text-purple-600 bg-purple-50';
      case 'Completed by Tailor':
        return 'text-orange-600 bg-orange-50';
      case 'Completed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Pending Assignment':
        return 'Pending Assignment';
      case 'Assigned':
        return 'Assigned to Tailor';
      case 'In Progress':
        return 'In Progress';
      case 'Completed by Tailor':
        return 'Ready for Review';
      case 'Completed':
        return 'Delivered';
      default:
        return status;
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
          <Button
            onClick={onNewOrder}
            size="sm"
            className="flex items-center space-x-2"
          >
            <SafeIcon icon={FiIcons.FiPlus} />
            <span>New Order</span>
          </Button>
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
            <Button onClick={onNewOrder}>Place New Order</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
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
                    <div className={`px-3 py-1 rounded-full ${getStatusColor(job.status)}`}>
                      <span className="text-sm font-medium">
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="font-semibold">₹{job.total_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Date</span>
                      <span>{format(new Date(job.delivery_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {job.addOns.map((addon, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Measurement Info */}
                  {job.measurementData && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Measurements: {job.measurementData.method === 'sample' ? 'Sample Image' : 'Custom Measurements'}
                      </p>
                      {job.measurementData.method === 'sample' && job.measurementData.sampleImage && (
                        <img
                          src={job.measurementData.sampleImage}
                          alt="Sample"
                          className="mt-2 w-20 h-20 object-cover rounded"
                        />
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;