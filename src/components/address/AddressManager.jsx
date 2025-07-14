import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseContext';
import Button from '../common/Button';
import AddressForm from './AddressForm';
import AddressList from './AddressList';
import LoadingSpinner from '../common/LoadingSpinner';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus } = FiIcons;

const AddressManager = ({
  onSelectAddress,
  selectedAddressId,
  mode = 'select', // 'select' or 'manage'
}) => {
  const { supabase, userId } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses_tc')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      alert('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const addressData = {
        ...formData,
        user_id: userId,
      };

      let error;
      if (editingAddress) {
        // Update existing address
        const { error: updateError } = await supabase
          .from('addresses_tc')
          .update(addressData)
          .eq('id', editingAddress.id);
        error = updateError;
      } else {
        // Insert new address
        const { error: insertError } = await supabase
          .from('addresses_tc')
          .insert([addressData]);
        error = insertError;
      }

      if (error) throw error;

      await fetchAddresses();
      setShowForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('addresses_tc')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSelect = (address) => {
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading addresses..." />;
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No addresses found</p>
              <Button
                onClick={() => setShowForm(true)}
                size="sm"
                className="inline-flex items-center"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>
          ) : (
            <>
              <AddressList
                addresses={addresses}
                onEdit={mode === 'manage' ? handleEdit : undefined}
                onDelete={mode === 'manage' ? handleDelete : undefined}
                onSelect={mode === 'select' ? handleSelect : undefined}
                selectedId={selectedAddressId}
              />
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="w-full mt-4"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AddressForm
            initialData={editingAddress}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAddress(null);
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default AddressManager;