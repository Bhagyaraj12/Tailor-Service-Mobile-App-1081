import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseContext';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiPackage, FiClock, FiCheckCircle, FiTool, FiUser, FiCalendar, FiDollarSign } = FiIcons;

const TailorDashboard = () => {
  const { user, userId, supabase } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [jobs, setJobs] = useState({ assigned: [], inProgress: [], completed: [], delivered: [] });
  const [loading, setLoading] = useState(true);

  // Use direct Supabase queries for better control
  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        console.log("Fetching tailor jobs for ID:", userId);
        
        if (!userId) {
          console.log("No user ID available");
          return;
        }

        // Fetch assigned jobs
        const { data: assignedData, error: assignedError } = await supabase
          .from('jobs_tc')
          .select('*')
          .eq('assigned_tailor_id', userId)
          .eq('status', 'Assigned')
          .order('created_at', { ascending: false });

        if (assignedError) throw assignedError;

        // Fetch in progress jobs
        const { data: progressData, error: progressError } = await supabase
          .from('jobs_tc')
          .select('*')
          .eq('assigned_tailor_id', userId)
          .eq('status', 'In Progress')
          .order('created_at', { ascending: false });

        if (progressError) throw progressError;

        // Fetch completed by tailor jobs
        const { data: completedData, error: completedError } = await supabase
          .from('jobs_tc')
          .select('*')
          .eq('assigned_tailor_id', userId)
          .eq('status', 'Completed by Tailor')
          .order('created_at', { ascending: false });

        if (completedError) throw completedError;

        // Fetch delivered jobs
        const { data: deliveredData, error: deliveredError } = await supabase
          .from('jobs_tc')
          .select('*')
          .eq('assigned_tailor_id', userId)
          .eq('status', 'Completed')
          .order('created_at', { ascending: false });

        if (deliveredError) throw deliveredError;

        // Process data to handle JSON fields
        const processJobs = (jobs) => {
          return (jobs || []).map(job => {
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
        };

        setJobs({
          assigned: processJobs(assignedData),
          inProgress: processJobs(progressData),
          completed: processJobs(completedData),
          delivered: processJobs(deliveredData)
        });

        console.log("Jobs fetched successfully:", {
          assigned: assignedData?.length || 0,
          inProgress: progressData?.length || 0,
          completed: completedData?.length || 0,
          delivered: deliveredData?.length || 0
        });
      } catch (error) {
        console.error("Error fetching tailor jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [userId, supabase]);

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      setUpdatingStatus(jobId);
      console.log(`Updating job ${jobId} status to ${newStatus}`);

      const { data, error } = await supabase
        .from('jobs_tc')
        .update({
          status: newStatus
          // Removed updated_at as it's handled by a default value
        })
        .eq('id', jobId)
        .select();

      if (error) throw error;

      console.log('Status updated successfully:', data);

      // Refresh jobs after update
      const { data: updatedJob } = await supabase
        .from('jobs_tc')
        .select('*')
        .eq('id', jobId)
        .single();

      // Update local state to avoid full refetch
      if (updatedJob) {
        let addOns = [];
        let measurementData = {};
        
        try {
          addOns = typeof updatedJob.add_ons === 'string' 
            ? JSON.parse(updatedJob.add_ons) 
            : (updatedJob.add_ons || []);
        } catch (e) {
          console.warn('Error parsing add_ons:', e);
        }
        
        try {
          measurementData = typeof updatedJob.measurement_data === 'string'
            ? JSON.parse(updatedJob.measurement_data)
            : (updatedJob.measurement_data || {});
        } catch (e) {
          console.warn('Error parsing measurement_data:', e);
        }
        
        const processedJob = {
          ...updatedJob,
          addOns,
          measurementData
        };

        // Move job to appropriate category
        let newJobs = { ...jobs };
        
        // Remove from all categories
        Object.keys(newJobs).forEach(key => {
          newJobs[key] = newJobs[key].filter(job => job.id !== jobId);
        });
        
        // Add to new category
        if (newStatus === 'In Progress') {
          newJobs.inProgress = [processedJob, ...newJobs.inProgress];
        } else if (newStatus === 'Completed by Tailor') {
          newJobs.completed = [processedJob, ...newJobs.completed];
        }
        
        setJobs(newJobs);
      }

      // Show success message if completed
      if (newStatus === 'Completed by Tailor') {
        alert('Job marked as completed! It will now be reviewed by admin for final delivery.');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getActiveJobs = () => {
    switch (activeTab) {
      case 'assigned':
        return jobs.assigned || [];
      case 'progress':
        return jobs.inProgress || [];
      case 'completed-by-tailor':
        return jobs.completed || [];
      case 'final-completed':
        return jobs.delivered || [];
      default:
        return [];
    }
  };

  const activeJobs = getActiveJobs();

  const tabs = [
    { id: 'assigned', label: 'New Jobs', icon: FiPackage, count: jobs.assigned?.length || 0 },
    { id: 'progress', label: 'In Progress', icon: FiTool, count: jobs.inProgress?.length || 0 },
    { id: 'completed-by-tailor', label: 'Awaiting Approval', icon: FiClock, count: jobs.completed?.length || 0 },
    { id: 'final-completed', label: 'Delivered', icon: FiCheckCircle, count: jobs.delivered?.length || 0 }
  ];

  if (loading) {
    return <LoadingSpinner text="Loading your jobs..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Tailor Dashboard" />
      
      <div className="max-w-md mx-auto">
        {/* Welcome Section */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Welcome Back!</h2>
              <p className="text-sm text-gray-600">
                {user?.phone || user?.phoneNumber || 'Tailor'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{jobs.assigned?.length || 0}</div>
            <div className="text-xs text-gray-600">New Jobs</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{jobs.inProgress?.length || 0}</div>
            <div className="text-xs text-gray-600">In Progress</div>
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
          {activeJobs.length === 0 ? (
            <div className="text-center py-8">
              <SafeIcon icon={FiPackage} className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No {activeTab.replace('-', ' ')} jobs</p>
            </div>
          ) : (
            activeJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {job.category} - {job.design}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Order #{job.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {job.customer_phone || job.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600 mb-1">
                        <SafeIcon icon={FiDollarSign} className="w-4 h-4" />
                        <span className="font-semibold">
                          ₹{job.assignment_amount || job.assignmentAmount}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                        <span className="text-sm">
                          {format(new Date(job.delivery_date), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Order Value</span>
                      <span className="font-medium">₹{job.total_price || job.totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Payment</span>
                      <span className="font-medium text-green-600">₹{job.assignment_amount || job.assignmentAmount}</span>
                    </div>
                  </div>

                  {/* Add-ons */}
                  {job.addOns && job.addOns.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Add-ons:</p>
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

                  {/* Measurement Info */}
                  {job.measurementData && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Measurements: {job.measurementData.method === 'sample' ? 'Sample Image' : 'Custom'}
                      </p>
                      {job.measurementData.schedulePickup && (
                        <p className="text-sm text-orange-600">⚠️ Fabric pickup required</p>
                      )}
                      {job.measurementData.method === 'sample' && job.measurementData.sampleImage && (
                        <img
                          src={job.measurementData.sampleImage}
                          alt="Sample"
                          className="w-16 h-16 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
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
                        onClick={() => handleStatusUpdate(job.id, 'Completed by Tailor')}
                        loading={updatingStatus === job.id}
                        size="sm"
                        className="flex-1"
                      >
                        Mark Completed
                      </Button>
                    )}

                    {activeTab === 'completed-by-tailor' && (
                      <div className="flex-1 text-center py-2 text-amber-600 font-medium">
                        ⏳ Awaiting Admin Approval
                      </div>
                    )}

                    {activeTab === 'final-completed' && (
                      <div className="flex-1 text-center py-2 text-green-600 font-medium">
                        ✓ Delivered to Customer
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