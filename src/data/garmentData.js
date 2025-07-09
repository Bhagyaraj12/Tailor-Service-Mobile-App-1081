export const garmentCategories = [
  {
    id: 'blouse',
    name: 'Blouse',
    icon: '👚',
    basePrice: 800,
    designs: [
      { id: 'boat-neck', name: 'Boat Neck', price: 0 },
      { id: 'high-neck', name: 'High Neck', price: 100 },
      { id: 'backless', name: 'Backless', price: 200 },
      { id: 'puff-sleeve', name: 'Puff Sleeve', price: 150 },
      { id: 'sleeveless', name: 'Sleeveless', price: 50 }
    ]
  },
  {
    id: 'shirt',
    name: 'Shirt',
    icon: '👔',
    basePrice: 600,
    designs: [
      { id: 'formal', name: 'Formal', price: 0 },
      { id: 'casual', name: 'Casual', price: 50 },
      { id: 'party-wear', name: 'Party Wear', price: 200 },
      { id: 'ethnic', name: 'Ethnic', price: 150 }
    ]
  },
  {
    id: 'kurti',
    name: 'Kurti',
    icon: '👘',
    basePrice: 700,
    designs: [
      { id: 'straight', name: 'Straight Cut', price: 0 },
      { id: 'anarkali', name: 'Anarkali', price: 300 },
      { id: 'a-line', name: 'A-Line', price: 150 },
      { id: 'palazzo', name: 'Palazzo Set', price: 400 }
    ]
  },
  {
    id: 'lehenga',
    name: 'Lehenga',
    icon: '👗',
    basePrice: 2000,
    designs: [
      { id: 'traditional', name: 'Traditional', price: 0 },
      { id: 'modern', name: 'Modern', price: 500 },
      { id: 'bridal', name: 'Bridal', price: 1500 },
      { id: 'party', name: 'Party Wear', price: 800 }
    ]
  },
  {
    id: 'kidswear',
    name: 'Kidswear',
    icon: '👶',
    basePrice: 400,
    designs: [
      { id: 'frock', name: 'Frock', price: 0 },
      { id: 'shirt-pant', name: 'Shirt & Pant', price: 100 },
      { id: 'ethnic-kids', name: 'Ethnic Wear', price: 150 },
      { id: 'party-kids', name: 'Party Wear', price: 200 }
    ]
  }
];

export const addOns = [
  { id: 'computer-embroidery', name: 'Computer Embroidery', price: 300 },
  { id: 'handloom-work', name: 'Handloom Work', price: 500 },
  { id: 'mirror-work', name: 'Mirror Work', price: 400 },
  { id: 'lacework', name: 'Lacework', price: 250 },
  { id: 'sequin-work', name: 'Sequin Work', price: 600 },
  { id: 'thread-work', name: 'Thread Work', price: 350 }
];

export const measurementFields = {
  blouse: [
    { id: 'bust', label: 'Bust', unit: 'inches' },
    { id: 'waist', label: 'Waist', unit: 'inches' },
    { id: 'shoulder', label: 'Shoulder', unit: 'inches' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'inches' },
    { id: 'blouse-length', label: 'Blouse Length', unit: 'inches' }
  ],
  shirt: [
    { id: 'chest', label: 'Chest', unit: 'inches' },
    { id: 'waist', label: 'Waist', unit: 'inches' },
    { id: 'shoulder', label: 'Shoulder', unit: 'inches' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'inches' },
    { id: 'shirt-length', label: 'Shirt Length', unit: 'inches' }
  ],
  kurti: [
    { id: 'bust', label: 'Bust', unit: 'inches' },
    { id: 'waist', label: 'Waist', unit: 'inches' },
    { id: 'hip', label: 'Hip', unit: 'inches' },
    { id: 'shoulder', label: 'Shoulder', unit: 'inches' },
    { id: 'kurti-length', label: 'Kurti Length', unit: 'inches' }
  ],
  lehenga: [
    { id: 'bust', label: 'Bust', unit: 'inches' },
    { id: 'waist', label: 'Waist', unit: 'inches' },
    { id: 'hip', label: 'Hip', unit: 'inches' },
    { id: 'skirt-length', label: 'Skirt Length', unit: 'inches' },
    { id: 'blouse-length', label: 'Blouse Length', unit: 'inches' }
  ],
  kidswear: [
    { id: 'chest', label: 'Chest', unit: 'inches' },
    { id: 'waist', label: 'Waist', unit: 'inches' },
    { id: 'length', label: 'Length', unit: 'inches' },
    { id: 'sleeve-length', label: 'Sleeve Length', unit: 'inches' }
  ]
};