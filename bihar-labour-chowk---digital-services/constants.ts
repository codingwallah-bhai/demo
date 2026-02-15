
import { WorkerCategory } from './types';

export const BIHAR_DISTRICTS = [
  'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
  'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
  'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger',
  'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
  'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'
];

export const CATEGORIES = Object.values(WorkerCategory);

export const MOCK_WORKERS = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    skill: WorkerCategory.ELECTRICIAN,
    experience: 5,
    location: 'Patna',
    photoUrl: 'https://picsum.photos/seed/rajesh/200/200',
    contactNumber: '9876543210',
    isVerified: true,
    description: 'Specialist in house wiring and appliance repair. 5 years experience in Patna city.',
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Amit Sahni',
    skill: WorkerCategory.PLUMBER,
    experience: 8,
    location: 'Muzaffarpur',
    photoUrl: 'https://picsum.photos/seed/amit/200/200',
    contactNumber: '9123456789',
    isVerified: true,
    description: 'Expert in pipeline fitting and motor repair. Quick service available.',
    createdAt: Date.now() - 86400000
  },
  {
    id: '3',
    name: 'Sunil Paswan',
    skill: WorkerCategory.MASON,
    experience: 12,
    location: 'Gaya',
    photoUrl: 'https://picsum.photos/seed/sunil/200/200',
    contactNumber: '9988776655',
    isVerified: false,
    description: 'Experienced in building construction and tiling work.',
    createdAt: Date.now() - 172800000
  }
];
