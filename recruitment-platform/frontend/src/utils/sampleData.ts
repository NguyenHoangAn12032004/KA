import { Company } from '../services/adminAPI';

// Sample company data generator
export const generateSampleCompanies = (count: number = 20): Company[] => {
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 
    'Manufacturing', 'Retail', 'Entertainment', 'Food & Beverage',
    'Construction', 'Transportation', 'Marketing', 'Consulting'
  ];

  const sizes = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
  const statuses: Array<'PENDING' | 'VERIFIED' | 'REJECTED'> = ['PENDING', 'VERIFIED', 'REJECTED'];

  return Array.from({ length: count }).map((_, index) => {
    const id = generateUUID();
    const name = `${sampleCompanyNames[index % sampleCompanyNames.length]} ${Math.floor(Math.random() * 100)}`;
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const jobsCount = Math.floor(Math.random() * 20);
    
    // Generate creation date (between 1 month and 2 years ago)
    const now = new Date();
    const monthsAgo = Math.floor(Math.random() * 23) + 1;
    const createdAt = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate());
    
    return {
      id,
      name,
      email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      industry,
      size,
      verificationStatus: status,
      isVerified: status === 'VERIFIED',
      jobsCount,
      createdAt: createdAt.toISOString(),
    };
  });
};

// Helper function to generate UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Sample company names
const sampleCompanyNames = [
  'Technovation',
  'Apex Solutions',
  'Quantum Dynamics',
  'StellarTech',
  'BlueSky Innovations',
  'NexGen',
  'Digital Frontier',
  'Global Synergy',
  'Horizon Enterprises',
  'Pinnacle Systems',
  'Infinite Solutions',
  'Vanguard Technologies',
  'Fusion Corp',
  'Elevate Digital',
  'Spark Innovations',
  'Visioneer',
  'Momentum Labs',
  'Coretech',
  'Phoenix Industries',
  'Omega Systems',
  'Insight Technologies',
  'Summit Solutions',
  'Nexus Group',
  'Vertex Innovations',
  'Prism Tech',
];

export const generateCompanyUpdate = (baseCompanies: Company[]): Company => {
  // Choose a random company to update
  const randomIndex = Math.floor(Math.random() * baseCompanies.length);
  const companyToUpdate = { ...baseCompanies[randomIndex] };
  
  // Update random properties
  const updateType = Math.floor(Math.random() * 3);
  
  switch(updateType) {
    case 0: // Update verification status
      const newStatuses = ['PENDING', 'VERIFIED', 'REJECTED'].filter(
        s => s !== companyToUpdate.verificationStatus
      ) as Array<'PENDING' | 'VERIFIED' | 'REJECTED'>;
      companyToUpdate.verificationStatus = newStatuses[Math.floor(Math.random() * newStatuses.length)];
      companyToUpdate.isVerified = companyToUpdate.verificationStatus === 'VERIFIED';
      break;
    case 1: // Update jobs count
      companyToUpdate.jobsCount = Math.floor(Math.random() * 30);
      break;
    case 2: // Update industry
      const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 
                          'Manufacturing', 'Retail', 'Entertainment', 'Food & Beverage'];
      companyToUpdate.industry = industries[Math.floor(Math.random() * industries.length)];
      break;
  }
  
  return companyToUpdate;
};

export const generateNewCompany = (): Company => {
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 
    'Manufacturing', 'Retail', 'Entertainment', 'Food & Beverage'
  ];
  const sizes = ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
  
  const id = generateUUID();
  const nameIndex = Math.floor(Math.random() * sampleCompanyNames.length);
  const name = `${sampleCompanyNames[nameIndex]} ${Math.floor(Math.random() * 100)}`;
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  
  return {
    id,
    name,
    email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    industry,
    size,
    verificationStatus: 'PENDING',
    isVerified: false,
    jobsCount: 0,
    createdAt: new Date().toISOString(),
  };
};
