import React, { useState } from 'react';
import { useAuth, addDocument } from '../../contexts/DummyAuthContext';
import { getEstimatedDeliveryDate } from '../../utils/priceCalculator';
import Header from '../common/Header';
import CategoryGrid from './CategoryGrid';
import DesignSelector from './DesignSelector';
import AddOnSelector from './AddOnSelector';
import PriceCalculator from './PriceCalculator';
import MeasurementForm from './MeasurementForm';
import JobSummary from './JobSummary';
import CustomerDashboard from './CustomerDashboard';

const CustomerFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [orderData, setOrderData] = useState({
    category: null,
    design: null,
    addOns: [],
    deliveryDate: getEstimatedDeliveryDate(),
    measurementData: null
  });

  const steps = [
    'dashboard',
    'category',
    'design',
    'addons',
    'pricing',
    'measurements',
    'summary'
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
    setOrderData(prev => ({ ...prev, category, design: null }));
    nextStep();
  };

  const handleDesignSelect = (design) => {
    setOrderData(prev => ({ ...prev, design }));
  };

  const handleAddOnsSelect = (addOns) => {
    setOrderData(prev => ({ ...prev, addOns }));
  };

  const handleDeliveryDateUpdate = (date) => {
    setOrderData(prev => ({ ...prev, deliveryDate: date }));
  };

  const handleMeasurementData = (data) => {
    setOrderData(prev => ({ ...prev, measurementData: data }));
  };

  const handleSubmitOrder = async () => {
    try {
      const jobData = {
        customerId: user.uid,
        customerPhone: user.phoneNumber,
        category: orderData.category.name,
        design: orderData.design.name,
        addOns: orderData.addOns,
        deliveryDate: orderData.deliveryDate,
        measurementData: orderData.measurementData,
        status: 'Pending Assignment',
        totalPrice: calculateFinalPrice(),
        tailorId: null,
        assignmentAmount: null
      };

      await addDocument('jobs', jobData);

      // Reset order data and go back to dashboard
      setOrderData({
        category: null,
        design: null,
        addOns: [],
        deliveryDate: getEstimatedDeliveryDate(),
        measurementData: null
      });
      setCurrentStep('dashboard');
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  };

  const calculateFinalPrice = () => {
    const { calculatePrice } = require('../../utils/priceCalculator');
    const pricing = calculatePrice(
      orderData.category,
      orderData.design,
      orderData.addOns,
      orderData.deliveryDate
    );
    return pricing.total;
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