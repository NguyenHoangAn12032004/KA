import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Sample users with student profiles
  const studentsData = [
    {
      user: {
        email: 'nguyen.van.an@student.hust.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'An',
        lastName: 'Nguyễn Văn',
        phone: '+84901234567',
        dateOfBirth: new Date('2002-03-15'),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        university: 'Đại học Bách khoa Hà Nội',
        major: 'Khoa học Máy tính',
        graduationYear: 2024,
        gpa: 3.7,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker'],
        experience: 'Thực tập Frontend Developer tại FPT Software (6 tháng)\n- Phát triển giao diện web responsive với React.js\n- Tích hợp API RESTful\n- Làm việc theo mô hình Agile/Scrum',
        portfolio: 'https://github.com/nguyenvanan-portfolio',
        github: 'https://github.com/nguyenvanan',
        linkedin: 'https://linkedin.com/in/nguyenvanan',
        resume: 'https://drive.google.com/file/d/1234567890/view',
        preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
        preferredWorkModes: ['HYBRID', 'REMOTE'],
        preferredLocations: ['Hà Nội', 'TP.HCM', 'Remote'],
        expectedSalaryMin: 12000000,
        expectedSalaryMax: 18000000,
      }
    },
    {
      user: {
        email: 'tran.thi.minh@student.uit.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'Minh',
        lastName: 'Trần Thị',
        phone: '+84912345678',
        dateOfBirth: new Date('2001-08-22'),
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b29a?w=150&h=150&fit=crop&crop=face',
        university: 'Đại học Công nghệ Thông tin - ĐHQG TP.HCM',
        major: 'Kỹ thuật Phần mềm',
        graduationYear: 2023,
        gpa: 3.9,
        skills: ['Java', 'Spring Boot', 'Angular', 'MySQL', 'MongoDB', 'AWS', 'Kubernetes'],
        experience: 'Software Engineer Intern tại Viettel Solutions (4 tháng)\n- Phát triển microservices với Spring Boot\n- Thiết kế database và tối ưu hóa query\n- Deploy ứng dụng lên AWS EKS',
        portfolio: 'https://tranthiminh.dev',
        github: 'https://github.com/tranthiminh',
        linkedin: 'https://linkedin.com/in/tranthiminh',
        resume: 'https://drive.google.com/file/d/0987654321/view',
        preferredJobTypes: ['FULL_TIME', 'PART_TIME'],
        preferredWorkModes: ['ONSITE', 'HYBRID'],
        preferredLocations: ['TP.HCM', 'Đà Nẵng', 'Cần Thơ'],
        expectedSalaryMin: 15000000,
        expectedSalaryMax: 25000000,
      }
    },
    {
      user: {
        email: 'le.hoang.duc@student.ptit.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'Đức',
        lastName: 'Lê Hoàng',
        phone: '+84923456789',
        dateOfBirth: new Date('2002-12-10'),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        university: 'Học viện Công nghệ Bưu chính Viễn thông',
        major: 'An toàn Thông tin',
        graduationYear: 2025,
        gpa: 3.6,
        skills: ['Python', 'Cybersecurity', 'Penetration Testing', 'Linux', 'Network Security', 'Blockchain'],
        experience: 'Cybersecurity Analyst Intern tại Viettel Cyber Security (3 tháng)\n- Phân tích và phát hiện các mối đe dọa bảo mật\n- Thực hiện penetration testing\n- Viết báo cáo bảo mật và đề xuất giải pháp',
        portfolio: 'https://lhd-security.github.io',
        github: 'https://github.com/lehoangduc',
        linkedin: 'https://linkedin.com/in/lehoangduc',
        resume: 'https://drive.google.com/file/d/1122334455/view',
        preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
        preferredWorkModes: ['ONSITE', 'HYBRID'],
        preferredLocations: ['Hà Nội', 'TP.HCM'],
        expectedSalaryMin: 10000000,
        expectedSalaryMax: 16000000,
      }
    },
    {
      user: {
        email: 'pham.thi.lan@student.hcmus.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'Lan',
        lastName: 'Phạm Thị',
        phone: '+84934567890',
        dateOfBirth: new Date('2001-05-18'),
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        university: 'Đại học Khoa học Tự nhiên - ĐHQG TP.HCM',
        major: 'Khoa học Dữ liệu',
        graduationYear: 2023,
        gpa: 3.8,
        skills: ['Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Tableau', 'SQL'],
        experience: 'Data Science Intern tại VinBigData (6 tháng)\n- Xây dựng model machine learning cho dự báo doanh số\n- Phân tích dữ liệu khách hàng và tạo dashboard\n- Tối ưu hóa performance model với accuracy 95%',
        portfolio: 'https://phamthilan-datascience.netlify.app',
        github: 'https://github.com/phamthilan',
        linkedin: 'https://linkedin.com/in/phamthilan',
        resume: 'https://drive.google.com/file/d/2233445566/view',
        preferredJobTypes: ['FULL_TIME', 'CONTRACT'],
        preferredWorkModes: ['REMOTE', 'HYBRID'],
        preferredLocations: ['TP.HCM', 'Hà Nội', 'Remote'],
        expectedSalaryMin: 18000000,
        expectedSalaryMax: 30000000,
      }
    },
    {
      user: {
        email: 'vo.minh.hieu@student.hcmut.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'Hiếu',
        lastName: 'Võ Minh',
        phone: '+84945678901',
        dateOfBirth: new Date('2002-11-03'),
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        university: 'Đại học Bách khoa TP.HCM',
        major: 'Kỹ thuật Điện tử - Viễn thông',
        graduationYear: 2024,
        gpa: 3.5,
        skills: ['C/C++', 'Embedded Systems', 'IoT', 'Arduino', 'Raspberry Pi', 'MATLAB', 'PCB Design'],
        experience: 'Hardware Engineer Intern tại Bosch Việt Nam (4 tháng)\n- Thiết kế mạch điện tử cho hệ thống IoT\n- Lập trình firmware cho vi điều khiển\n- Test và debug phần cứng',
        portfolio: 'https://vominhhieu-embedded.github.io',
        github: 'https://github.com/vominhhieu',
        linkedin: 'https://linkedin.com/in/vominhhieu',
        resume: 'https://drive.google.com/file/d/3344556677/view',
        preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
        preferredWorkModes: ['ONSITE', 'HYBRID'],
        preferredLocations: ['TP.HCM', 'Đồng Nai', 'Bình Dương'],
        expectedSalaryMin: 12000000,
        expectedSalaryMax: 20000000,
      }
    },
    {
      user: {
        email: 'nguyen.thi.thu@student.vnu.edu.vn',
        password: hashedPassword,
        role: 'STUDENT' as const,
        isActive: true,
        isVerified: true,
      },
      profile: {
        firstName: 'Thu',
        lastName: 'Nguyen Thi',
        phone: '+84956789012',
        dateOfBirth: new Date('2001-07-25'),
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        university: 'Vietnam National University, Hanoi',
        major: 'Graphic Design',
        graduationYear: 2023,
        gpa: 3.9,
        skills: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Sketch', 'UI/UX Design', 'Prototyping', 'HTML/CSS'],
        experience: 'UI/UX Designer Intern at Zalo (5 months)\n- Designed mobile app interfaces for 2M+ users\n- Created wireframes and interactive prototypes\n- Conducted user research and usability testing',
        portfolio: 'https://nguyenthithu.design',
        github: 'https://github.com/nguyenthithu',
        linkedin: 'https://linkedin.com/in/nguyenthithu',
        resume: 'https://drive.google.com/file/d/4455667788/view',
        preferredJobTypes: ['FULL_TIME', 'PART_TIME'],
        preferredWorkModes: ['HYBRID', 'REMOTE'],
        preferredLocations: ['Hanoi', 'Ho Chi Minh City', 'Remote'],
        expectedSalaryMin: 10000000,
        expectedSalaryMax: 18000000,
      }
    }
  ];

  // Create users with student profiles
  for (const studentData of studentsData) {
    const user = await prisma.user.create({
      data: studentData.user,
    });

    await prisma.studentProfile.create({
      data: {
        ...studentData.profile,
        userId: user.id,
      },
    });

    console.log(`✅ Created student: ${studentData.profile.firstName} ${studentData.profile.lastName}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
