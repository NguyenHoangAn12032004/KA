const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Lấy company ID
    const company = await prisma.company_profiles.findFirst({
      where: { userId: '8cac86b7-4b2b-406b-af34-415928fe87ad' }
    });

    if (!company) {
      console.log('Không tìm thấy company profile');
      return;
    }

    console.log('Đã tìm thấy company:', company.companyName);
    const companyId = company.id;

    // Tạo các job mẫu
    const jobTitles = [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'UI/UX Designer',
      'Product Manager'
    ];

    const jobDescriptions = [
      'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với React và TypeScript.',
      'Backend Developer với kinh nghiệm Node.js, Express và PostgreSQL.',
      'Full Stack Developer có kiến thức về cả frontend và backend.',
      'UI/UX Designer có kinh nghiệm thiết kế giao diện người dùng và trải nghiệm người dùng.',
      'Product Manager có kinh nghiệm quản lý sản phẩm phần mềm.'
    ];

    const locations = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng'];
    const workModes = ['ONSITE', 'REMOTE', 'HYBRID'];
    const jobTypes = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];
    const experienceLevels = ['ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];

    // Kiểm tra xem đã có job nào chưa
    const existingJobs = await prisma.job.findMany({
      where: { companyId: companyId }
    });

    if (existingJobs.length > 0) {
      console.log(`Đã có ${existingJobs.length} job, không cần tạo thêm`);
    } else {
      const jobs = [];
      for (let i = 0; i < jobTitles.length; i++) {
        const job = await prisma.job.create({
          data: {
            id: uuidv4(),
            companyId: companyId,
            title: jobTitles[i],
            description: jobDescriptions[i],
            requirements: ['Yêu cầu 1', 'Yêu cầu 2', 'Yêu cầu 3'],
            benefits: ['Phúc lợi 1', 'Phúc lợi 2', 'Phúc lợi 3'],
            responsibilities: ['Trách nhiệm 1', 'Trách nhiệm 2', 'Trách nhiệm 3'],
            jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
            workMode: workModes[Math.floor(Math.random() * workModes.length)],
            experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            salaryMin: 1000 + Math.floor(Math.random() * 1000),
            salaryMax: 2000 + Math.floor(Math.random() * 2000),
            applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            requiredSkills: ['JavaScript', 'TypeScript', 'React'],
            preferredSkills: ['Node.js', 'Express', 'PostgreSQL'],
            tags: ['Tech', 'Developer', 'IT'],
            isActive: true,
            isFeatured: Math.random() > 0.5,
            publishedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        jobs.push(job);
        console.log(`Đã tạo job: ${job.title}`);
      }
    }

    // Lấy tất cả jobs
    const allJobs = await prisma.job.findMany({
      where: { companyId: companyId }
    });

    // Tạo các sinh viên mẫu
    const studentEmails = [
      'student1@example.com',
      'student2@example.com',
      'student3@example.com',
      'student4@example.com',
      'student5@example.com'
    ];

    const studentNames = [
      { first: 'Nguyễn', last: 'Văn A' },
      { first: 'Trần', last: 'Thị B' },
      { first: 'Lê', last: 'Văn C' },
      { first: 'Phạm', last: 'Thị D' },
      { first: 'Hoàng', last: 'Văn E' }
    ];

    const universities = [
      'Đại học Bách Khoa Hà Nội',
      'Đại học Quốc gia Hà Nội',
      'Đại học Quốc gia TP. Hồ Chí Minh',
      'Đại học FPT',
      'Đại học Công nghệ TP. Hồ Chí Minh'
    ];

    const majors = [
      'Công nghệ thông tin',
      'Khoa học máy tính',
      'Kỹ thuật phần mềm',
      'Hệ thống thông tin',
      'An toàn thông tin'
    ];

    const students = [];
    for (let i = 0; i < studentEmails.length; i++) {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await prisma.user.findUnique({
        where: { email: studentEmails[i] }
      });

      let user, studentProfile;
      
      if (existingUser) {
        console.log(`User với email ${studentEmails[i]} đã tồn tại`);
        user = existingUser;
        
        // Kiểm tra xem student profile đã tồn tại chưa
        studentProfile = await prisma.studentProfile.findFirst({
          where: { userId: user.id }
        });
        
        if (studentProfile) {
          console.log(`Student profile cho user ${user.id} đã tồn tại`);
        } else {
          // Tạo student profile mới
          const studentId = uuidv4();
          studentProfile = await prisma.studentProfile.create({
            data: {
              id: studentId,
              userId: user.id,
              firstName: studentNames[i].first,
              lastName: studentNames[i].last,
              phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
              dateOfBirth: new Date(1995 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              university: universities[Math.floor(Math.random() * universities.length)],
              major: majors[Math.floor(Math.random() * majors.length)],
              graduationYear: 2023 + Math.floor(Math.random() * 3),
              gpa: 3.0 + Math.random() * 1.0,
              skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS'],
              experience: 'Thực tập sinh tại công ty ABC',
              portfolio: `https://portfolio.${studentEmails[i].split('@')[0]}.com`,
              github: `https://github.com/${studentEmails[i].split('@')[0]}`,
              linkedin: `https://linkedin.com/in/${studentEmails[i].split('@')[0]}`,
              preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
              preferredWorkModes: ['ONSITE', 'HYBRID'],
              preferredLocations: ['Hà Nội', 'Hồ Chí Minh'],
              expectedSalaryMin: 800,
              expectedSalaryMax: 1500,
              profile_completion: 85,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo student profile cho user ${user.id}`);
        }
      } else {
        // Tạo user mới
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        user = await prisma.user.create({
          data: {
            id: userId,
            email: studentEmails[i],
            password: hashedPassword,
            role: 'STUDENT',
            isActive: true,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`Đã tạo user: ${user.email}`);

        // Tạo student profile
        const studentId = uuidv4();
        studentProfile = await prisma.studentProfile.create({
          data: {
            id: studentId,
            userId: userId,
            firstName: studentNames[i].first,
            lastName: studentNames[i].last,
            phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
            dateOfBirth: new Date(1995 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            university: universities[Math.floor(Math.random() * universities.length)],
            major: majors[Math.floor(Math.random() * majors.length)],
            graduationYear: 2023 + Math.floor(Math.random() * 3),
            gpa: 3.0 + Math.random() * 1.0,
            skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML', 'CSS'],
            experience: 'Thực tập sinh tại công ty ABC',
            portfolio: `https://portfolio.${studentEmails[i].split('@')[0]}.com`,
            github: `https://github.com/${studentEmails[i].split('@')[0]}`,
            linkedin: `https://linkedin.com/in/${studentEmails[i].split('@')[0]}`,
            preferredJobTypes: ['FULL_TIME', 'INTERNSHIP'],
            preferredWorkModes: ['ONSITE', 'HYBRID'],
            preferredLocations: ['Hà Nội', 'Hồ Chí Minh'],
            expectedSalaryMin: 800,
            expectedSalaryMax: 1500,
            profile_completion: 85,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`Đã tạo student profile: ${studentProfile.firstName} ${studentProfile.lastName}`);

        // Tạo education
        const educationExists = await prisma.studentEducation.findFirst({
          where: { studentId: studentProfile.id }
        });
        
        if (!educationExists) {
          await prisma.studentEducation.create({
            data: {
              id: uuidv4(),
              studentId: studentProfile.id,
              institution: universities[Math.floor(Math.random() * universities.length)],
              degree: 'Cử nhân',
              fieldOfStudy: majors[Math.floor(Math.random() * majors.length)],
              startDate: new Date(2019, 8, 1),
              endDate: new Date(2023, 5, 30),
              current: false,
              gpa: 3.0 + Math.random() * 1.0,
              achievements: ['Học bổng khuyến khích học tập', 'Giải nhất cuộc thi lập trình'],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo education cho student ${studentProfile.id}`);
        }

        // Tạo experience
        const experienceExists = await prisma.studentExperience.findFirst({
          where: { studentId: studentProfile.id }
        });
        
        if (!experienceExists) {
          await prisma.studentExperience.create({
            data: {
              id: uuidv4(),
              studentId: studentProfile.id,
              company: 'Công ty ABC',
              position: 'Thực tập sinh',
              startDate: new Date(2022, 5, 1),
              endDate: new Date(2022, 8, 30),
              current: false,
              description: 'Phát triển ứng dụng web sử dụng React và Node.js',
              skills: ['React', 'Node.js', 'JavaScript'],
              achievements: ['Hoàn thành dự án đúng hạn', 'Được đánh giá cao bởi mentor'],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo experience cho student ${studentProfile.id}`);
        }

        // Tạo language
        const languageExists = await prisma.studentLanguage.findFirst({
          where: { studentId: studentProfile.id }
        });
        
        if (!languageExists) {
          await prisma.studentLanguage.create({
            data: {
              id: uuidv4(),
              studentId: studentProfile.id,
              name: 'Tiếng Anh',
              proficiency: 'INTERMEDIATE',
              certification: 'TOEIC 700',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo language cho student ${studentProfile.id}`);
        }

        // Tạo certification
        const certificationExists = await prisma.studentCertification.findFirst({
          where: { studentId: studentProfile.id }
        });
        
        if (!certificationExists) {
          await prisma.studentCertification.create({
            data: {
              id: uuidv4(),
              studentId: studentProfile.id,
              name: 'AWS Certified Developer',
              issuer: 'Amazon Web Services',
              issueDate: new Date(2022, 3, 15),
              expiryDate: new Date(2025, 3, 15),
              credentialId: `AWS-${Math.floor(100000 + Math.random() * 900000)}`,
              credentialUrl: 'https://aws.amazon.com/certification/certified-developer-associate/',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo certification cho student ${studentProfile.id}`);
        }

        // Tạo project
        const projectExists = await prisma.studentProject.findFirst({
          where: { studentId: studentProfile.id }
        });
        
        if (!projectExists) {
          await prisma.studentProject.create({
            data: {
              id: uuidv4(),
              studentId: studentProfile.id,
              title: 'Ứng dụng quản lý công việc',
              description: 'Ứng dụng web giúp quản lý công việc và thời gian',
              technologies: ['React', 'Node.js', 'MongoDB'],
              startDate: new Date(2022, 1, 1),
              endDate: new Date(2022, 3, 30),
              current: false,
              githubUrl: `https://github.com/${studentEmails[i].split('@')[0]}/task-manager`,
              liveUrl: `https://task-manager.${studentEmails[i].split('@')[0]}.com`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          console.log(`Đã tạo project cho student ${studentProfile.id}`);
        }
      }

      students.push({ user, studentProfile });
    }

    // Kiểm tra xem đã có applications nào chưa
    const existingApplications = await prisma.application.count();
    
    if (existingApplications > 0) {
      console.log(`Đã có ${existingApplications} applications, không cần tạo thêm`);
    } else {
      // Tạo applications
      const applicationStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'];
      
      for (let i = 0; i < students.length; i++) {
        // Mỗi sinh viên nộp đơn cho 1-3 công việc
        const numApplications = Math.floor(Math.random() * 3) + 1;
        const jobIndices = Array.from({ length: allJobs.length }, (_, i) => i);
        const shuffledJobIndices = jobIndices.sort(() => Math.random() - 0.5);
        
        for (let j = 0; j < numApplications && j < shuffledJobIndices.length; j++) {
          const jobIndex = shuffledJobIndices[j];
          const job = allJobs[jobIndex];
          const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
          
          // Kiểm tra xem application đã tồn tại chưa
          const existingApplication = await prisma.application.findFirst({
            where: {
              jobId: job.id,
              studentId: students[i].user.id
            }
          });
          
          if (existingApplication) {
            console.log(`Application cho job ${job.id} và student ${students[i].user.id} đã tồn tại`);
            continue;
          }
          
          const application = await prisma.application.create({
            data: {
              id: uuidv4(),
              jobId: job.id,
              studentId: students[i].user.id,
              coverLetter: 'Tôi rất quan tâm đến vị trí này và tin rằng kỹ năng của tôi phù hợp với yêu cầu của công ty.',
              status: status,
              statusHistory: JSON.stringify([
                {
                  status: 'PENDING',
                  timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  note: 'Hồ sơ đã được nộp'
                },
                {
                  status: status,
                  timestamp: new Date(),
                  note: 'Cập nhật trạng thái'
                }
              ]),
              hrNotes: 'Ứng viên có tiềm năng',
              appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          console.log(`Đã tạo đơn ứng tuyển: ${students[i].studentProfile.firstName} ${students[i].studentProfile.lastName} -> ${job.title} (${status})`);
          
          // Nếu trạng thái là INTERVIEW_SCHEDULED hoặc INTERVIEWED, tạo phỏng vấn
          if (status === 'INTERVIEW_SCHEDULED' || status === 'INTERVIEWED') {
            // Kiểm tra xem interview đã tồn tại chưa
            const existingInterview = await prisma.interviews.findFirst({
              where: {
                applicationId: application.id
              }
            });
            
            if (!existingInterview) {
              const interview = await prisma.interviews.create({
                data: {
                  id: uuidv4(),
                  applicationId: application.id,
                  companyId: companyId,
                  jobId: job.id,
                  title: `Phỏng vấn cho vị trí ${job.title}`,
                  description: 'Phỏng vấn kỹ thuật và đánh giá kỹ năng',
                  type: 'TECHNICAL',
                  scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                  duration: 60,
                  location: job.workMode === 'REMOTE' ? null : 'Văn phòng công ty',
                  meetingLink: job.workMode === 'REMOTE' ? 'https://meet.google.com/abc-defg-hij' : null,
                  interviewer: 'Nguyễn Văn X',
                  interviewerEmail: 'interviewer@example.com',
                  status: status === 'INTERVIEWED' ? 'COMPLETED' : 'SCHEDULED',
                  createdAt: new Date(),
                  updatedAt: new Date()
                }
              });
              
              console.log(`Đã tạo phỏng vấn cho đơn ứng tuyển: ${application.id}`);
            }
          }
        }
      }
    }

    console.log('Hoàn thành!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 