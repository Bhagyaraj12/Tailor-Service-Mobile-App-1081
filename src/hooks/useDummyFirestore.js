import { useState, useEffect } from 'react';

// Dummy data storage
const dummyData = {
  jobs: [
    {
      id: 'job_001',
      customerId: 'dummy_customer_001',
      customerPhone: '+91 98765 43210',
      category: 'Blouse',
      design: 'Boat Neck',
      addOns: [
        { id: 'computer-embroidery', name: 'Computer Embroidery', price: 300 }
      ],
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      measurementData: {
        method: 'custom',
        measurements: { bust: '36', waist: '32', shoulder: '14' },
        schedulePickup: false
      },
      status: 'Pending Assignment',
      totalPrice: 1100,
      tailorId: null,
      assignmentAmount: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'job_002',
      customerId: 'dummy_customer_001',
      customerPhone: '+91 98765 43210',
      category: 'Kurti',
      design: 'Anarkali',
      addOns: [],
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      measurementData: {
        method: 'sample',
        sampleImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5TYW1wbGUgSW1hZ2U8L3RleHQ+PC9zdmc+',
        schedulePickup: true
      },
      status: 'Assigned',
      totalPrice: 1000,
      tailorId: 'dummy_tailor_001',
      assignmentAmount: 700,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'job_003',
      customerId: 'dummy_customer_002',
      customerPhone: '+91 98765 43213',
      category: 'Shirt',
      design: 'Formal',
      addOns: [
        { id: 'thread-work', name: 'Thread Work', price: 350 }
      ],
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      measurementData: {
        method: 'custom',
        measurements: { chest: '40', waist: '36', shoulder: '16' },
        schedulePickup: false
      },
      status: 'In Progress',
      totalPrice: 950,
      tailorId: 'dummy_tailor_001',
      assignmentAmount: 600,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ],
  users: [
    {
      id: 'dummy_tailor_001',
      phoneNumber: '+91 98765 43212',
      role: 'tailor',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'dummy_tailor_002',
      phoneNumber: '+91 98765 43214',
      role: 'tailor',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

export const useFirestore = (collectionName, queryConstraints = []) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      try {
        let data = dummyData[collectionName] || [];
        
        // Apply query constraints
        queryConstraints.forEach(constraint => {
          if (constraint.type === 'where') {
            const { field, operator, value } = constraint;
            data = data.filter(doc => {
              switch (operator) {
                case '==':
                  return doc[field] === value;
                case 'in':
                  return value.includes(doc[field]);
                default:
                  return true;
              }
            });
          }
        });

        // Convert dates to Firestore-like format
        data = data.map(doc => ({
          ...doc,
          createdAt: { toDate: () => doc.createdAt },
          updatedAt: { toDate: () => doc.updatedAt },
          deliveryDate: { toDate: () => doc.deliveryDate }
        }));

        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(fetchData, 500);
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { documents, loading, error };
};

export const addDocument = async (collectionName, data) => {
  try {
    const newDoc = {
      ...data,
      id: `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (!dummyData[collectionName]) {
      dummyData[collectionName] = [];
    }
    
    dummyData[collectionName].push(newDoc);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return newDoc.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, updateData) => {
  try {
    const collection = dummyData[collectionName] || [];
    const docIndex = collection.findIndex(doc => doc.id === id);
    
    if (docIndex !== -1) {
      dummyData[collectionName][docIndex] = {
        ...dummyData[collectionName][docIndex],
        ...updateData,
        updatedAt: new Date()
      };
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Helper functions to create query constraints
export const where = (field, operator, value) => ({
  type: 'where',
  field,
  operator,
  value
});

export const orderBy = (field, direction = 'asc') => ({
  type: 'orderBy',
  field,
  direction
});