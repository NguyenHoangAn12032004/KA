// Seed script to create 6 job postings for company ID "comp-1754211437688"
import { PrismaClient, JobType, WorkMode, ExperienceLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating jobs for company comp-1754211437688...');

  const companyId = 'comp-1754211437688';

  // Check if company exists
  const company = await prisma.company_profiles.findUnique({
    where: { id: companyId },
    include: { users: true }
  });

  if (!company) {
    console.error(`❌ Company with ID ${companyId} not found!`);
    process.exit(1);
  }

  console.log(`✅ Found company: ${company.companyName}`);

  // Create 6 job postings
  const jobs = [
    {
      id: `job-${Date.now()}-1`,
      title: 'Senior Backend Developer',
      description: 'We are looking for an experienced Backend Developer to join our growing team. You will be responsible for developing and maintaining server-side applications, APIs, and database systems.',
      requirements: [
        'Bachelor degree in Computer Science or related field',
        '4+ years experience with Node.js and Express.js',
        'Strong knowledge of PostgreSQL and MongoDB',
        'Experience with RESTful API design',
        'Knowledge of cloud platforms (AWS, Azure, or GCP)',
        'Experience with Docker and containerization'
      ],
      benefits: [
        'Competitive salary: $2500-4000 USD',
        'Full health insurance coverage',
        '15 days annual leave',
        'Flexible working hours',
        'Work from home options',
        'Professional development budget',
        'Modern equipment and tools'
      ],
      responsibilities: [
        'Design and develop scalable backend systems',
        'Build and maintain RESTful APIs',
        'Optimize database queries and performance',
        'Collaborate with frontend developers',
        'Code reviews and mentoring junior developers',
        'Write comprehensive tests and documentation'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'HYBRID' as WorkMode,
      experienceLevel: 'SENIOR' as ExperienceLevel,
      location: 'Ho Chi Minh City',
      salaryMin: 2500,
      salaryMax: 4000,
      currency: 'USD',
      requiredSkills: ['Node.js', 'Express.js', 'PostgreSQL', 'RESTful API', 'Docker', 'AWS'],
      preferredSkills: ['TypeScript', 'Redis', 'GraphQL', 'Microservices', 'CI/CD']
    },
    {
      id: `job-${Date.now()}-2`,
      title: 'React Frontend Developer',
      description: 'Join our frontend team to build beautiful and responsive user interfaces. We work with modern React ecosystem and cutting-edge technologies.',
      requirements: [
        '3+ years experience with React and JavaScript',
        'Strong knowledge of HTML5, CSS3, and responsive design',
        'Experience with state management (Redux, Context API)',
        'Knowledge of TypeScript',
        'Experience with testing frameworks (Jest, React Testing Library)',
        'Understanding of modern build tools (Webpack, Vite)'
      ],
      benefits: [
        'Competitive salary: $2000-3200 USD',
        'Health and dental insurance',
        '12 days annual leave',
        'Flexible working schedule',
        'Remote work opportunities',
        'Learning and development support',
        'Team building activities'
      ],
      responsibilities: [
        'Develop responsive web applications using React',
        'Implement pixel-perfect UI designs',
        'Optimize application performance',
        'Write maintainable and testable code',
        'Collaborate with designers and backend developers',
        'Participate in code reviews and team meetings'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'ONSITE' as WorkMode,
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      location: 'Ho Chi Minh City',
      salaryMin: 2000,
      salaryMax: 3200,
      currency: 'USD',
      requiredSkills: ['React', 'JavaScript', 'TypeScript', 'CSS3', 'Redux', 'Jest'],
      preferredSkills: ['Next.js', 'Styled Components', 'Material-UI', 'Storybook', 'Figma']
    },
    {
      id: `job-${Date.now()}-3`,
      title: 'DevOps Engineer',
      description: 'We are seeking a skilled DevOps Engineer to help us build and maintain our cloud infrastructure. You will work on automation, monitoring, and deployment processes.',
      requirements: [
        'Bachelor degree in Computer Science or IT',
        '3+ years experience with cloud platforms (AWS, Azure)',
        'Strong knowledge of containerization (Docker, Kubernetes)',
        'Experience with CI/CD pipelines',
        'Knowledge of Infrastructure as Code (Terraform, CloudFormation)',
        'Experience with monitoring tools (Prometheus, Grafana)'
      ],
      benefits: [
        'Competitive salary: $2800-4500 USD',
        'Premium health insurance',
        '18 days annual leave',
        'Flexible working hours',
        'Remote work options',
        'Certification support',
        'Performance bonuses'
      ],
      responsibilities: [
        'Design and maintain cloud infrastructure',
        'Implement CI/CD pipelines',
        'Monitor system performance and reliability',
        'Automate deployment processes',
        'Ensure security best practices',
        'Troubleshoot and resolve infrastructure issues'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'REMOTE' as WorkMode,
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      location: 'Remote (Vietnam)',
      salaryMin: 2800,
      salaryMax: 4500,
      currency: 'USD',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
      preferredSkills: ['Helm', 'Jenkins', 'GitLab CI', 'Ansible', 'ELK Stack']
    },
    {
      id: `job-${Date.now()}-4`,
      title: 'Mobile App Developer (React Native)',
      description: 'Join our mobile development team to create amazing cross-platform mobile applications. We focus on delivering high-quality user experiences.',
      requirements: [
        '2+ years experience with React Native',
        'Strong knowledge of JavaScript and TypeScript',
        'Experience with native iOS/Android development',
        'Knowledge of mobile app deployment processes',
        'Experience with Redux or similar state management',
        'Understanding of mobile UI/UX principles'
      ],
      benefits: [
        'Competitive salary: $1800-3000 USD',
        'Health insurance coverage',
        '14 days annual leave',
        'Flexible working hours',
        'Learning budget for courses',
        'Latest mobile devices for testing',
        'Quarterly team outings'
      ],
      responsibilities: [
        'Develop cross-platform mobile applications',
        'Implement native features and integrations',
        'Optimize app performance and user experience',
        'Write unit and integration tests',
        'Collaborate with designers and backend team',
        'Maintain app store listings and deployments'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'HYBRID' as WorkMode,
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      location: 'Ho Chi Minh City',
      salaryMin: 1800,
      salaryMax: 3000,
      currency: 'USD',
      requiredSkills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'iOS', 'Android'],
      preferredSkills: ['Expo', 'Firebase', 'Push Notifications', 'App Store Connect', 'Fastlane']
    },
    {
      id: `job-${Date.now()}-5`,
      title: 'Product Manager',
      description: 'We are looking for a Product Manager to lead our product development initiatives. You will work closely with engineering, design, and business teams.',
      requirements: [
        'Bachelor degree in Business, Engineering, or related field',
        '3+ years experience in product management',
        'Strong analytical and problem-solving skills',
        'Experience with agile development methodologies',
        'Knowledge of product analytics tools',
        'Excellent communication and leadership skills'
      ],
      benefits: [
        'Competitive salary: $2200-3800 USD',
        'Comprehensive health insurance',
        '16 days annual leave',
        'Flexible working arrangements',
        'Professional development opportunities',
        'Stock options',
        'Conference attendance support'
      ],
      responsibilities: [
        'Define product strategy and roadmap',
        'Gather and analyze market requirements',
        'Work with engineering teams on product development',
        'Monitor product performance and user feedback',
        'Coordinate product launches and marketing',
        'Manage stakeholder relationships'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'ONSITE' as WorkMode,
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      location: 'Ho Chi Minh City',
      salaryMin: 2200,
      salaryMax: 3800,
      currency: 'USD',
      requiredSkills: ['Product Management', 'Analytics', 'Agile', 'Strategy', 'Leadership'],
      preferredSkills: ['Jira', 'Confluence', 'Figma', 'Google Analytics', 'A/B Testing']
    },
    {
      id: `job-${Date.now()}-6`,
      title: 'UI/UX Designer',
      description: 'We are seeking a creative UI/UX Designer to create intuitive and beautiful user experiences. You will work on web and mobile applications.',
      requirements: [
        'Bachelor degree in Design, Fine Arts, or related field',
        '2+ years experience in UI/UX design',
        'Proficiency in design tools (Figma, Sketch, Adobe XD)',
        'Strong portfolio showcasing design projects',
        'Knowledge of design systems and style guides',
        'Understanding of user research and usability testing'
      ],
      benefits: [
        'Competitive salary: $1500-2800 USD',
        'Health insurance',
        '12 days annual leave',
        'Creative workspace environment',
        'Design software licenses',
        'Professional development budget',
        'Design conference tickets'
      ],
      responsibilities: [
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with product and engineering teams',
        'Maintain and evolve design systems',
        'Present design concepts to stakeholders',
        'Stay updated with design trends and best practices'
      ],
      jobType: 'FULL_TIME' as JobType,
      workMode: 'ONSITE' as WorkMode,
      experienceLevel: 'INTERMEDIATE' as ExperienceLevel,
      location: 'Ho Chi Minh City',
      salaryMin: 1500,
      salaryMax: 2800,
      currency: 'USD',
      requiredSkills: ['UI Design', 'UX Design', 'Figma', 'Prototyping', 'User Research'],
      preferredSkills: ['Sketch', 'Adobe Creative Suite', 'Principle', 'InVision', 'Zeplin']
    }
  ];

  // Create each job
  for (const [index, jobData] of jobs.entries()) {
    try {
      const job = await prisma.jobs.create({
        data: {
          ...jobData,
          companyId: companyId,
          isActive: true,
          updatedAt: new Date(),
          createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Stagger creation dates
        }
      });
      console.log(`✅ Created job: ${job.title}`);
    } catch (error) {
      console.error(`❌ Failed to create job ${jobData.title}:`, error);
    }
  }

  // Update company profile with additional information
  await prisma.company_profiles.update({
    where: { id: companyId },
    data: {
      description: `${company.companyName} is a leading technology company specializing in innovative software solutions. We provide cutting-edge web applications, mobile apps, and enterprise solutions to clients worldwide. Our team of talented developers, designers, and product managers work together to deliver exceptional digital experiences.

Founded with a vision to transform businesses through technology, we have grown to become a trusted partner for companies ranging from startups to Fortune 500 enterprises. We pride ourselves on our collaborative culture, commitment to quality, and continuous learning environment.

Join us to work on exciting projects, grow your career, and make a real impact in the tech industry!`,
      website: company.website || 'https://company-website.com',
      linkedin: company.linkedin || 'https://linkedin.com/company/tech-solutions',
      facebook: company.facebook || 'https://facebook.com/techsolutions',
      founded: company.founded || '2018',
      rating: company.rating || 4.7,
      view_count: (company.view_count || 0) + 150,
      follower_count: (company.follower_count || 0) + 85
    }
  });

  console.log('✅ Updated company profile information');
  console.log('🎉 Successfully created 6 job postings and updated company profile!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
