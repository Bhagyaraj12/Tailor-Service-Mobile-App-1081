import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFirestore, updateDocument, where, orderBy } from '../../contexts/DummyAuthContext';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiUsers, FiPackage, FiClock, FiCheckCircle } = FiIcons;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedJob, setSelectedJob] = useState(null);
  const [assigningTailor, setAssigningTailor] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    tailorId: '',
    assignmentAmount: ''
  });

  const { documents: pendingJobs, loading: pendingLoading } = useFirestore('jobs', [
    where('status', '==', 'Pending Assignment'),
    orderBy('createdAt', 'desc')
  ]);

  const { documents: activeJobs, loading: activeLoading } = useFirestore('jobs', [
    where('status', 'in', ['Assigned', 'In Progress']),
    orderBy('createdAt', 'desc')
  ]);

  const { documents: completedJobs, loading: completedLoading } = useFirestore('jobs', [
    where('status', '==', 'Completed'),
    orderBy('createdAt', 'desc')
  ]);

  const { documents: tailors, loading: tailorsLoading } = useFirestore('users', [
    where('role', '==', 'tailor')
  ]);

  const handleAssignTailor = async () => {
    if (!selectedJob || !assignmentData.tailorId || !assignmentData.assignmentAmount) {
      return;
    }

    try {
      setAssigningTailor(true);
      await updateDocument('jobs', selectedJob.id, {
        tailorId: assignmentData.tailorId,
        assignmentAmount: parseFloat(assignmentData.assignmentAmount),
        status: 'Assigned'
      });
      
      setSelectedJob(null);
      setAssignmentData({ tailorId: '', assignmentAmount: '' });
    } catch (error) {
      console.error('Error assigning tailor:', error);
    } finally {
      setAssigningTailor(false);
    }
  };

  const getJobsByTab = () => {
    switch (activeTab) {
      case 'pending':
        return { jobs: pendingJobs, loading: pendingLoading };
      case 'active':
        return { jobs: activeJobs, loading: activeLoading };
      case 'completed':
        return { jobs: completedJobs, loading: completedLoading };
      default:
        return { jobs: [], loading: false };
    }
  };

  const { jobs, loading } = getJobsByTab();

  const tabs = [
    { id: 'pending', label: 'Pending', icon: FiClock, count: pendingJobs.length },
    { id: 'active', label: 'Active', icon: FiPackage, count: activeJobs.length },
    { id: 'completed', label: 'Completed', icon: FiCheckCircle, count: completedJobs.length }
  ];

  if (loading && jobs.length === 0) {
    return <LoadingSpinner text="Loading jobs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" />

      <div className="max-w-md mx-auto">
        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeJobs.length}</div>
            <div className="text-xs text-gray-600">Active</div>
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
                      <p className="text-sm text-gray-600">
                        {job.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-600">₹{job.totalPrice}</div>
                      <div className="text-sm text-gray-600">
                        {format(job.deliveryDate.toDate(), 'MMM dd')}
                      </div>
                    </div>
                  </div>

                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {job.addOns.map(addon => (
                          <span key={addon.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pending' && (
                    <Button
                      onClick={() => setSelectedJob(job)}
                      size="sm"
                      className="w-full"
                    >
                      Assign Tailor
                    </Button>
                  )}

                  {job.tailorId && (
                    <div className="mt-2 text-sm text-gray-600">
                      Assigned to: Tailor #{job.tailorId.slice(-6)}
                      {job.assignmentAmount && (
                        <span className="ml-2 text-green-600">₹{job.assignmentAmount}</span>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Tailor
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tailor
                </label>
                <select
                  value={assignmentData.tailorId}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, tailorId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Choose a tailor</option>
                  {tailors.map(tailor => (
                    <option key={tailor.id} value={tailor.id}>
                      {tailor.phoneNumber} - Tailor #{tailor.id.slice(-6)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Amount (₹)
                </label>
                <input
                  type="number"
                  value={assignmentData.assignmentAmount}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, assignmentAmount: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignTailor}
                  loading={assigningTailor}
                  disabled={!assignmentData.tailorId || !assignmentData.assignmentAmount}
                  className="flex-1"
                >
                  Assign
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;