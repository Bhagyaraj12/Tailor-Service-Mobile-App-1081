import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseContext';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import OrderDeliveryModal from './OrderDeliveryModal';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiUsers, FiPackage, FiClock, FiCheckCircle, FiTool, FiUser, FiTruck } = FiIcons;

const AdminDashboard = () => {
  const { useFirestore, updateDocument, where, orderBy, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedJob, setSelectedJob] = useState(null);
  const [assigningTailor, setAssigningTailor] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    tailorId: '',
    assignmentAmount: ''
  });
  const [tailors, setTailors] = useState([]);
  const [loadingTailors, setLoadingTailors] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliveryJob, setSelectedDeliveryJob] = useState(null);

  // Fetch tailors and addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingTailors(true);
        
        // Insert demo tailors if needed
        await supabase.from('users_tc').upsert([
          {
            id: '00000000-0000-4000-a000-000000000001',
            phone_number: '+91 98765 43212',
            role: 'tailor'
          },
          {
            id: '00000000-0000-4000-a000-000000000002',
            phone_number: '+91 98765 43213',
            role: 'tailor'
          }
        ], { onConflict: 'id' });

        // Fetch tailors
        const { data: tailorData, error: tailorError } = await supabase
          .from('users_tc')
          .select('*')
          .eq('role', 'tailor');
          
        if (tailorError) throw tailorError;
        setTailors(tailorData || []);

        // Fetch all addresses for delivery management
        const { data: addressData, error: addressError } = await supabase
          .from('addresses_tc')
          .select('*');
          
        if (addressError) throw addressError;
        setAddresses(addressData || []);

        console.log('Fetched data:', { tailors: tailorData?.length, addresses: addressData?.length });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingTailors(false);
      }
    };
    
    fetchData();
  }, [supabase]);

  // Fetch jobs by status
  const { documents: pendingJobs, loading: pendingLoading } = useFirestore(
    'jobs_tc',
    [
      where('status', '==', 'Pending Assignment'),
      orderBy('created_at', 'desc')
    ]
  );

  const { documents: activeJobs, loading: activeLoading } = useFirestore(
    'jobs_tc',
    [
      where('status', 'in', ['Assigned', 'In Progress']),
      orderBy('created_at', 'desc')
    ]
  );

  const { documents: completedByTailorJobs, loading: completedByTailorLoading } = useFirestore(
    'jobs_tc',
    [
      where('status', '==', 'Completed by Tailor'),
      orderBy('created_at', 'desc')
    ]
  );

  const { documents: completedJobs, loading: completedLoading } = useFirestore(
    'jobs_tc',
    [
      where('status', '==', 'Completed'),
      orderBy('created_at', 'desc')
    ]
  );

  const handleAssignTailor = async () => {
    if (!selectedJob || !assignmentData.tailorId || !assignmentData.assignmentAmount) {
      alert('Please fill all fields');
      return;
    }

    try {
      setAssigningTailor(true);
      console.log('Assigning tailor:', assignmentData);

      const { data, error } = await supabase
        .from('jobs_tc')
        .update({
          assigned_tailor_id: assignmentData.tailorId,
          assignment_amount: parseFloat(assignmentData.assignmentAmount),
          status: 'Assigned'
        })
        .eq('id', selectedJob.id)
        .select();

      if (error) throw error;

      console.log('Tailor assigned successfully:', data);
      setSelectedJob(null);
      setAssignmentData({ tailorId: '', assignmentAmount: '' });
      alert('Tailor assigned successfully!');
    } catch (error) {
      console.error('Error assigning tailor:', error);
      alert('Failed to assign tailor: ' + error.message);
    } finally {
      setAssigningTailor(false);
    }
  };

  const handleFinalApproval = async (jobId) => {
    try {
      const { data, error } = await supabase
        .from('jobs_tc')
        .update({
          status: 'Completed'
        })
        .eq('id', jobId)
        .select();

      if (error) throw error;

      console.log('Job approved successfully:', data);
      alert('Job approved and marked as completed!');
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Failed to approve job: ' + error.message);
    }
  };

  const handleDeliveryUpdate = async (jobId, deliveryStatus, notes) => {
    try {
      const updateData = {
        delivery_status: deliveryStatus,
        delivery_notes: notes
      };

      if (deliveryStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('jobs_tc')
        .update(updateData)
        .eq('id', jobId)
        .select();

      if (error) throw error;

      console.log('Delivery status updated:', data);
      alert(`Order marked as ${deliveryStatus.replace('_', ' ')}!`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  };

  const getJobsByTab = () => {
    switch (activeTab) {
      case 'pending':
        return { jobs: pendingJobs, loading: pendingLoading };
      case 'active':
        return { jobs: activeJobs, loading: activeLoading };
      case 'review':
        return { jobs: completedByTailorJobs, loading: completedByTailorLoading };
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
    { id: 'review', label: 'Review', icon: FiTool, count: completedByTailorJobs.length },
    { id: 'completed', label: 'Completed', icon: FiCheckCircle, count: completedJobs.length }
  ];

  const getDeliveryStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Pending</span>;
      case 'out_for_delivery':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Out for Delivery</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Delivered</span>;
      default:
        return null;
    }
  };

  if (loading && jobs.length === 0) {
    return <LoadingSpinner text="Loading jobs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Admin Dashboard" />
      
      <div className="max-w-md mx-auto">
        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeJobs.length}</div>
            <div className="text-xs text-gray-600">Active</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{completedByTailorJobs.length}</div>
            <div className="text-xs text-gray-600">Review</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl p-1 shadow-sm">
            <div className="grid grid-cols-2 gap-1 mb-2">
              {tabs.slice(0, 2).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SafeIcon icon={tab.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white text-primary-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {tabs.slice(2).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-1 py-2 px-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SafeIcon icon={tab.icon} className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-white text-primary-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
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
                        {job.customer_phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-600">₹{job.total_price}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(job.delivery_date), 'MMM dd')}
                      </div>
                      {job.delivery_status && getDeliveryStatusBadge(job.delivery_status)}
                    </div>
                  </div>

                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {job.addOns.map((addon, idx) => (
                          <span
                            key={addon.id || idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {activeTab === 'pending' && (
                      <Button
                        onClick={() => setSelectedJob(job)}
                        size="sm"
                        className="w-full"
                      >
                        Assign Tailor
                      </Button>
                    )}

                    {activeTab === 'review' && (
                      <Button
                        onClick={() => handleFinalApproval(job.id)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Approve & Complete
                      </Button>
                    )}

                    {activeTab === 'completed' && (
                      <Button
                        onClick={() => {
                          setSelectedDeliveryJob(job);
                          setShowDeliveryModal(true);
                        }}
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2"
                        variant="outline"
                      >
                        <SafeIcon icon={FiTruck} className="w-4 h-4" />
                        <span>Manage Delivery</span>
                      </Button>
                    )}
                  </div>

                  {job.assigned_tailor_id && (
                    <div className="mt-2 text-sm text-gray-600">
                      Assigned to: Tailor #{job.assigned_tailor_id.slice(-6)}
                      {job.assignment_amount && (
                        <span className="ml-2 text-green-600">
                          ₹{job.assignment_amount}
                        </span>
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
                {loadingTailors ? (
                  <div className="p-3 text-center text-gray-500 border border-gray-300 rounded-lg">
                    Loading tailors...
                  </div>
                ) : tailors.length === 0 ? (
                  <div className="p-3 text-center text-red-500 border border-red-200 rounded-lg bg-red-50">
                    No tailors available. Please add tailors first.
                  </div>
                ) : (
                  <select
                    value={assignmentData.tailorId}
                    onChange={(e) => setAssignmentData(prev => ({ ...prev, tailorId: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a tailor</option>
                    {tailors.map(tailor => (
                      <option key={tailor.id} value={tailor.id}>
                        {tailor.phone_number} - Tailor #{tailor.id.slice(-6)}
                      </option>
                    ))}
                  </select>
                )}
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
                  disabled={!assignmentData.tailorId || !assignmentData.assignmentAmount || tailors.length === 0}
                  className="flex-1"
                >
                  Assign
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delivery Management Modal */}
      {showDeliveryModal && selectedDeliveryJob && (
        <OrderDeliveryModal
          job={selectedDeliveryJob}
          addresses={addresses}
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedDeliveryJob(null);
          }}
          onUpdateDelivery={handleDeliveryUpdate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;