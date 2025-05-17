// User data
export const currentUser = {
  id: 'user1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
  homeAddress: {
    id: 'home1',
    name: 'Home',
    address: '123 Main St, Anytown, USA',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  workAddress: {
    id: 'work1',
    name: 'Work',
    address: '456 Market St, Anytown, USA',
    latitude: 37.7900,
    longitude: -122.4000,
  },
  paymentMethods: [
    {
      id: 'payment1',
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
    },
    {
      id: 'payment2',
      type: 'paypal',
      email: 'john.doe@example.com',
      isDefault: false,
    },
  ],
  savedPlaces: [
    {
      id: 'place1',
      name: 'Gym',
      address: '789 Fitness Ave, Anytown, USA',
      latitude: 37.7800,
      longitude: -122.4100,
    },
    {
      id: 'place2',
      name: 'Grocery Store',
      address: '101 Food St, Anytown, USA',
      latitude: 37.7850,
      longitude: -122.4150,
    },
  ],
};

// Available drivers
export const availableDrivers = [
  {
    id: 'driver1',
    name: 'David Smith',
    rating: 4.8,
    car: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      licensePlate: 'ABC123',
    },
    location: {
      latitude: 37.7730,
      longitude: -122.4190,
    },
    distance: '3 min away',
  },
  {
    id: 'driver2',
    name: 'Sarah Johnson',
    rating: 4.9,
    car: {
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      color: 'Black',
      licensePlate: 'XYZ789',
    },
    location: {
      latitude: 37.7800,
      longitude: -122.4180,
    },
    distance: '5 min away',
  },
  {
    id: 'driver3',
    name: 'Michael Brown',
    rating: 4.7,
    car: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      color: 'White',
      licensePlate: 'EV1234',
    },
    location: {
      latitude: 37.7770,
      longitude: -122.4150,
    },
    distance: '4 min away',
  },
];

// Ride options
export const rideOptions = [
  {
    id: 'rideshare',
    name: 'IShare Ride',
    description: 'Affordable rides for 1-4 people',
    estimatedTime: '5 min',
    price: 15.99,
    image: 'car',
    capacity: 4,
  },
  {
    id: 'comfort',
    name: 'IShare Comfort',
    description: 'Newer cars with extra legroom',
    estimatedTime: '6 min',
    price: 22.99,
    image: 'car-side',
    capacity: 4,
  },
  {
    id: 'xl',
    name: 'IShare XL',
    description: 'Affordable rides for up to 6 people',
    estimatedTime: '8 min',
    price: 27.99,
    image: 'car-estate',
    capacity: 6,
  },
  {
    id: 'green',
    name: 'IShare Green',
    description: 'Electric and hybrid vehicles only',
    estimatedTime: '7 min',
    price: 19.99,
    image: 'leaf',
    capacity: 4,
  },
];

// Recent rides
export const recentRides = [
  {
    id: 'ride1',
    date: '2023-06-15',
    time: '14:30',
    pickup: 'Home',
    destination: 'Work',
    price: 18.50,
    driverName: 'David Smith',
    status: 'completed',
  },
  {
    id: 'ride2',
    date: '2023-06-10',
    time: '19:45',
    pickup: 'Gym',
    destination: 'Home',
    price: 12.75,
    driverName: 'Sarah Johnson',
    status: 'completed',
  },
  {
    id: 'ride3',
    date: '2023-06-05',
    time: '09:15',
    pickup: 'Home',
    destination: 'Grocery Store',
    price: 9.99,
    driverName: 'Michael Brown',
    status: 'completed',
  },
];

// Scheduled rides
export const scheduledRides = [
  {
    id: 'sched1',
    date: '2023-06-20',
    time: '08:00',
    pickup: 'Home',
    destination: 'Work',
    price: 19.50,
    recurringDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    status: 'scheduled',
  },
  {
    id: 'sched2',
    date: '2023-06-25',
    time: '18:30',
    pickup: 'Work',
    destination: 'Gym',
    price: 15.25,
    recurringDays: [],
    status: 'scheduled',
  },
];

// Promo codes
export const promoCodes = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    description: '50% off your first ride (up to $10)',
    expiryDate: '2023-12-31',
    isUsed: false,
  },
  {
    id: 'promo2',
    code: 'WEEKEND25',
    description: '25% off weekend rides (up to $5)',
    expiryDate: '2023-07-31',
    isUsed: false,
  },
];

// High demand areas (for heat map)
export const highDemandAreas = [
  {
    id: 'area1',
    name: 'Downtown',
    coordinates: {
      latitude: 37.7800,
      longitude: -122.4150,
    },
    radius: 0.8, // in km
    demandLevel: 0.9, // 0-1 scale
  },
  {
    id: 'area2',
    name: 'Financial District',
    coordinates: {
      latitude: 37.7950,
      longitude: -122.4000,
    },
    radius: 0.6,
    demandLevel: 0.8,
  },
  {
    id: 'area3',
    name: 'Marina District',
    coordinates: {
      latitude: 37.8030,
      longitude: -122.4350,
    },
    radius: 0.5,
    demandLevel: 0.7,
  },
];

// Saved locations
export const savedLocations = [
  currentUser.homeAddress,
  currentUser.workAddress,
  ...currentUser.savedPlaces,
];

// Sample notifications
export const notifications = [
  {
    id: 'notif1',
    title: 'Your driver is arriving',
    body: 'David Smith is 2 minutes away in a Silver Toyota Camry (ABC123)',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 'notif2',
    title: 'Ride completed',
    body: 'Your ride with Sarah Johnson has been completed. Total: $15.99',
    time: '2 days ago',
    read: true,
  },
  {
    id: 'notif3',
    title: 'Weekend promotion',
    body: 'Enjoy 25% off rides this weekend with code WEEKEND25',
    time: '1 week ago',
    read: true,
  },
]; 