import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, useFirestore, updateDocument, where, orderBy } from '../../contexts/DummyAuthContext';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiPackage, FiClock, FiCheckCircle, FiTool } = FiIcons;

const TailorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const { documents: assignedJobs, loading: assignedLoading } = useFirestore('jobs', [
    where('tailorId', '==', user?.uid || ''),
    where('status', '==', 'Assigned'),
    orderBy('createdAt', 'desc')
  ]);

  const { documents: inProgressJobs, loading: inProgressLoading } = useFirestore('jobs', [
    where('tailorId', '==', user?.uid || ''),
    where('status', '==', 'In Progress'),
    orderBy('createdAt', 'desc')
  ]);

  const { documents: completedJobs, loading: completedLoading } = useFirestore('jobs', [
    where('tailorId', '==', user?.uid || ''),
    where('status', '==', 'Completed'),
    orderBy('createdAt', 'desc')
  ]);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      setUpdatingStatus(jobId);
      await updateDocument('jobs', jobId, { status: newStatus });
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getJobsByTab = () => {
    switch (activeTab) {
      case 'assigned':
        return { jobs: assignedJobs, loading: assignedLoading };
      case 'progress':
        return { jobs: inProgressJobs, loading: inProgressLoading };
      case 'completed':
        return { jobs: completedJobs, loading: completedLoading };
      default:
        return { jobs: [], loading: false };
    }
  };

  const { jobs, loading } = getJobsByTab();

  const tabs = [
    { id: 'assigned', label: 'New', icon: FiPackage, count: assignedJobs.length },
    { id: 'progress', label: 'In Progress', icon: FiTool, count: inProgressJobs.length },
    { id: 'completed', label: 'Completed', icon: FiCheckCircle, count: completedJobs.length }
  ];

  if (loading && jobs.length === 0) {
    return <LoadingSpinner text="Loading your jobs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Tailor Dashboard" />

      <div className="max-w-md mx-auto">
        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{assignedJobs.length}</div>
            <div className="text-xs text-gray-600">New Jobs</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{inProgressJobs.length}</div>
            <div className="text-xs text-gray-600">In Progress</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="flex bg-white rounded-xl p-1 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white text-primary-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="px-4 space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <SafeIcon icon={FiPackage} className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No {activeTab} jobs</p>
            </div>
          ) : (
            jobs.map((job, index) => (
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
                    <div className="text-right">
                      <div className="font-semibold text-green-600">₹{job.assignmentAmount}</div>
                      <div className="text-sm text-gray-600">
                        Due: {format(job.deliveryDate.toDate(), 'MMM dd')}
                      </div>
                    </div>
                  </div>

                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mb-3">
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

                  {job.measurementData && (
                    <div className="mb-3 text-sm text-gray-600">
                      <p className="font-medium">Measurements: {job.measurementData.method === 'sample' ? 'Sample Image' : 'Custom'}</p>
                      {job.measurementData.schedulePickup && (
                        <p className="text-orange-600">⚠️ Fabric pickup required</p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {activeTab === 'assigned' && (
                      <Button
                        onClick={() => handleStatusUpdate(job.id, 'In Progress')}
                        loading={updatingStatus === job.id}
                        size="sm"
                        className="flex-1"
                      >
                        Start Work
                      </Button>
                    )}

                    {activeTab === 'progress' && (
                      <Button
                        onClick={() => handleStatusUpdate(job.id, 'Completed')}
                        loading={updatingStatus === job.id}
                        size="sm"
                        className="flex-1"
                      >
                        Mark Complete
                      </Button>
                    )}

                    {activeTab === 'completed' && (
                      <div className="flex-1 text-center py-2 text-green-600 font-medium">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TailorDashboard;