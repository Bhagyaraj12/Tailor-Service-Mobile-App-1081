import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseContext';
import { getEstimatedDeliveryDate, calculatePrice } from '../../utils/priceCalculator';
import Header from '../common/Header';
import CategoryGrid from './CategoryGrid';
import DesignSelector from './DesignSelector';
import AddOnSelector from './AddOnSelector';
import PriceCalculator from './PriceCalculator';
import MeasurementForm from './MeasurementForm';
import JobSummary from './JobSummary';
import CustomerDashboard from './CustomerDashboard';
import LoadingSpinner from '../common/LoadingSpinner';

const CustomerFlow = () => {
  const { user, userId, addDocument, supabase, dbInitialized } = useAuth();
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [orderData, setOrderData] = useState({
    category: null,
    design: null,
    addOns: [],
    deliveryDate: getEstimatedDeliveryDate(),
    measurementData: null
  });
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    'dashboard', 'category', 'design', 'addons', 'pricing', 'measurements', 'summary'
  ];

  const getCurrentStepIndex = () => steps.indexOf(currentStep);

  const goToStep = (step) => setCurrentStep(step);

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 1) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      setCurrentStep('dashboard');
    }
  };

  const handleCategorySelect = (category) => {
    setOrderData(prev => ({
      ...prev,
      category,
      design: null
    }));
    nextStep();
  };

  const handleDesignSelect = (design) => {
    setOrderData(prev => ({
      ...prev,
      design
    }));
  };

  const handleAddOnsSelect = (addOns) => {
    setOrderData(prev => ({
      ...prev,
      addOns
    }));
  };

  const handleDeliveryDateUpdate = (date) => {
    setOrderData(prev => ({
      ...prev,
      deliveryDate: date
    }));
  };

  const handleMeasurementData = (data) => {
    setOrderData(prev => ({
      ...prev,
      measurementData: data
    }));
  };

  const calculateFinalPrice = () => {
    const pricing = calculatePrice(
      orderData.category,
      orderData.design,
      orderData.addOns,
      orderData.deliveryDate
    );
    return pricing.total;
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      console.log('Starting order submission...');
      console.log('User ID:', userId);
      console.log('User:', user);
      console.log('Order Data:', orderData);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      if (!orderData.category || !orderData.design) {
        throw new Error('Missing required order data');
      }

      const finalPrice = calculateFinalPrice();
      console.log('Final price calculated:', finalPrice);

      // Use direct Supabase call for more reliability
      const { data, error } = await supabase
        .from('jobs_tc')
        .insert({
          customer_id: userId,
          customer_phone: user?.phone || user?.phoneNumber || 'Demo User',
          category: orderData.category.name,
          design: orderData.design.name,
          add_ons: JSON.stringify(orderData.addOns || []),
          delivery_date: orderData.deliveryDate.toISOString(),
          measurement_data: JSON.stringify(orderData.measurementData || {}),
          status: 'Pending Assignment',
          total_price: finalPrice
          // Removed created_at and updated_at as they have default values
        })
        .select();

      if (error) throw error;
      
      console.log('Order submitted successfully with ID:', data[0].id);

      // Reset order data and go back to dashboard
      setOrderData({
        category: null,
        design: null,
        addOns: [],
        deliveryDate: getEstimatedDeliveryDate(),
        measurementData: null
      });
      setCurrentStep('dashboard');

      // Show success message
      alert('Order submitted successfully!');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'dashboard':
        return 'My Orders';
      case 'category':
        return 'Select Category';
      case 'design':
        return 'Choose Design';
      case 'addons':
        return 'Add-on Services';
      case 'pricing':
        return 'Price & Delivery';
      case 'measurements':
        return 'Measurements';
      case 'summary':
        return 'Order Summary';
      default:
        return 'TailorCraft';
    }
  };

  // If database isn't initialized yet, show loading
  if (!dbInitialized && currentStep !== 'dashboard') {
    return <LoadingSpinner text="Initializing database..." />;
  }

  // If submitting an order, show loading
  if (submitting) {
    return <LoadingSpinner text="Submitting your order..." />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <CustomerDashboard onNewOrder={() => goToStep('category')} />;
      case 'category':
        return <CategoryGrid onSelectCategory={handleCategorySelect} />;
      case 'design':
        return (
          <DesignSelector
            category={orderData.category}
            onSelectDesign={handleDesignSelect}
            onNext={nextStep}
          />
        );
      case 'addons':
        return (
          <AddOnSelector
            onSelectAddOns={handleAddOnsSelect}
            onNext={nextStep}
          />
        );
      case 'pricing':
        return (
          <PriceCalculator
            category={orderData.category}
            design={orderData.design}
            addOns={orderData.addOns}
            onNext={nextStep}
            onUpdateDeliveryDate={handleDeliveryDateUpdate}
          />
        );
      case 'measurements':
        return (
          <MeasurementForm
            category={orderData.category}
            onNext={nextStep}
            onMeasurementData={handleMeasurementData}
          />
        );
      case 'summary':
        return (
          <JobSummary
            category={orderData.category}
            design={orderData.design}
            addOns={orderData.addOns}
            deliveryDate={orderData.deliveryDate}
            measurementData={orderData.measurementData}
            onSubmit={handleSubmitOrder}
          />
        );
      default:
        return <CustomerDashboard onNewOrder={() => goToStep('category')} />;
    }
  };

  if (currentStep === 'dashboard') {
    return renderStep();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={getStepTitle()}
        showBack={currentStep !== 'category'}
        onBack={prevStep}
      />
      
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        {currentStep !== 'dashboard' && (
          <div className="px-4 py-2 bg-white border-b">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {getCurrentStepIndex()} of {steps.length - 1}</span>
              <span>{Math.round((getCurrentStepIndex() / (steps.length - 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
};

export default CustomerFlow;