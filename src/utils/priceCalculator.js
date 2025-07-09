import { addDays, differenceInDays } from 'date-fns';

export const calculatePrice = (category, design, addOns, deliveryDate) => {
  const basePrice = category.basePrice;
  const designPrice = design ? design.price : 0;
  const addOnsPrice = addOns.reduce((total, addon) => total + addon.price, 0);
  
  let fastDeliveryCharge = 0;
  const defaultDeliveryDays = 7; // Default 7 days
  const defaultDeliveryDate = addDays(new Date(), defaultDeliveryDays);
  
  if (deliveryDate && deliveryDate < defaultDeliveryDate) {
    const daysDifference = differenceInDays(defaultDeliveryDate, deliveryDate);
    fastDeliveryCharge = daysDifference * 100; // ₹100 per day for fast delivery
  }
  
  return {
    basePrice,
    designPrice,
    addOnsPrice,
    fastDeliveryCharge,
    total: basePrice + designPrice + addOnsPrice + fastDeliveryCharge
  };
};

export const getEstimatedDeliveryDate = () => {
  return addDays(new Date(), 7); // Default 7 days from now
};