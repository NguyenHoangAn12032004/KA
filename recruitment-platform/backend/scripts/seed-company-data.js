const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCompanyData() {
  try {
    console.log('🌱 Bắt đầu tạo dữ liệu mẫu cho công ty...');

    // 1. Tìm hoặc tạo công ty
    let companyUser = await prisma.user.findFirst({
      where: { role: 'COMPANY' },
      include: { company_profiles: true }
    });

    if (!companyUser) {
      console.log('👉 Không tìm thấy tài khoản công ty, đang tạo mới...');
      companyUser = await prisma.user.create({
        data: {
          email: 'company@demo.com',
          password: '$2b$10$dMrTWrx.nP5MkOUxu/IoB.4Y5RenDlX9EJzMH1zMdgOzKlmTFg7Tq', // password: password123
          role: 'COMPANY',
          isActive: true,
          isVerified: true,
          company_profiles: {
            create: {
              companyName: 'FPT Software',
              industry: 'Công nghệ thông tin',
              companySize: '1000-5000',
              description: 'FPT Software là công ty phần mềm hàng đầu Việt Nam với hơn 20 năm kinh nghiệm cung cấp dịch vụ cho các khách hàng toàn cầu.',
              website: 'https://fptsoftware.com',
              logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/FPT_logo_2010.svg',
              phone: '0123456789',
              address: 'Tòa nhà FPT, Duy Tân',
              city: 'Hà Nội',
              country: 'Việt Nam',
              updatedAt: new Date()
            }
          }
        },
        include: { company_profiles: true }
      });
      console.log('✅ Đã tạo tài khoản công ty:', companyUser.email);
    } else {
      console.log('✅ Đã tìm thấy tài khoản công ty:', companyUser.email);
    }

    const companyId = companyUser.company_profiles.id;
    console.log('🏢 ID công ty:', companyId);

    // 2. Tạo các việc làm cho công ty
    const jobsData = [
      {
        title: 'Frontend Developer (ReactJS)',
        description: 'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với ReactJS để tham gia vào dự án phát triển ứng dụng web cho khách hàng lớn.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm với ReactJS', 'Thành thạo HTML, CSS, JavaScript', 'Có kinh nghiệm với Redux, TypeScript'],
        benefits: ['Lương cạnh tranh', 'Chế độ bảo hiểm tốt', 'Môi trường làm việc quốc tế'],
        responsibilities: ['Phát triển giao diện người dùng', 'Tối ưu hiệu suất ứng dụng', 'Làm việc với backend developers'],
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'INTERMEDIATE',
        location: 'Hà Nội',
        salaryMin: 20000000,
        salaryMax: 35000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 ngày trước
      },
      {
        title: 'Backend Developer (NodeJS)',
        description: 'Tìm kiếm Backend Developer có kinh nghiệm với NodeJS và ExpressJS để phát triển API và microservices.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm với NodeJS', 'Hiểu biết về cơ sở dữ liệu SQL và NoSQL', 'Kinh nghiệm với Docker, Kubernetes là lợi thế'],
        benefits: ['Lương cạnh tranh', 'Chế độ bảo hiểm tốt', 'Cơ hội đào tạo và phát triển'],
        responsibilities: ['Phát triển và duy trì API', 'Tối ưu hiệu suất hệ thống', 'Làm việc với frontend developers'],
        jobType: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'INTERMEDIATE',
        location: 'Hồ Chí Minh',
        salaryMin: 25000000,
        salaryMax: 40000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 ngày trước
      },
      {
        title: 'UI/UX Designer',
        description: 'Tìm kiếm UI/UX Designer có kinh nghiệm thiết kế giao diện người dùng cho các ứng dụng web và mobile.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm thiết kế UI/UX', 'Thành thạo Figma, Adobe XD', 'Portfolio thiết kế ấn tượng'],
        benefits: ['Môi trường làm việc sáng tạo', 'Cơ hội làm việc với khách hàng quốc tế', 'Lương thưởng hấp dẫn'],
        responsibilities: ['Thiết kế giao diện người dùng', 'Tạo prototype và wireframe', 'Làm việc với developers để triển khai thiết kế'],
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'INTERMEDIATE',
        location: 'Đà Nẵng',
        salaryMin: 18000000,
        salaryMax: 30000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 ngày trước
      },
      {
        title: 'Data Engineer',
        description: 'Chúng tôi đang tìm kiếm Data Engineer có kinh nghiệm xây dựng và duy trì hệ thống xử lý dữ liệu lớn.',
        requirements: ['Có ít nhất 3 năm kinh nghiệm với Big Data', 'Thành thạo Spark, Hadoop, Kafka', 'Kinh nghiệm với AWS/GCP/Azure'],
        benefits: ['Lương cạnh tranh', 'Chế độ làm việc linh hoạt', 'Cơ hội phát triển chuyên môn'],
        responsibilities: ['Xây dựng pipeline xử lý dữ liệu', 'Tối ưu hóa hệ thống', 'Làm việc với data scientists'],
        jobType: 'FULL_TIME',
        workMode: 'REMOTE',
        experienceLevel: 'SENIOR',
        location: 'Remote',
        salaryMin: 35000000,
        salaryMax: 60000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 ngày trước
      },
      {
        title: 'Mobile Developer (Flutter)',
        description: 'Tìm kiếm Mobile Developer có kinh nghiệm với Flutter để phát triển ứng dụng di động đa nền tảng.',
        requirements: ['Có ít nhất 2 năm kinh nghiệm với Flutter', 'Hiểu biết về Dart', 'Kinh nghiệm phát triển ứng dụng iOS/Android'],
        benefits: ['Môi trường làm việc năng động', 'Cơ hội làm việc với công nghệ mới', 'Chế độ phúc lợi tốt'],
        responsibilities: ['Phát triển ứng dụng di động đa nền tảng', 'Tối ưu hiệu suất ứng dụng', 'Làm việc với backend developers'],
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'INTERMEDIATE',
        location: 'Hà Nội',
        salaryMin: 22000000,
        salaryMax: 38000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 ngày trước
      },
      {
        title: 'DevOps Engineer',
        description: 'Tìm kiếm DevOps Engineer có kinh nghiệm xây dựng và duy trì hệ thống CI/CD, quản lý hạ tầng cloud.',
        requirements: ['Có ít nhất 3 năm kinh nghiệm với DevOps', 'Thành thạo Docker, Kubernetes, Jenkins', 'Kinh nghiệm với AWS/GCP/Azure'],
        benefits: ['Lương cạnh tranh', 'Chế độ làm việc linh hoạt', 'Cơ hội phát triển chuyên môn'],
        responsibilities: ['Xây dựng và duy trì hệ thống CI/CD', 'Quản lý hạ tầng cloud', 'Tối ưu hóa quy trình phát triển'],
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'SENIOR',
        location: 'Hồ Chí Minh',
        salaryMin: 30000000,
        salaryMax: 55000000,
        currency: 'VND',
        isActive: true,
        viewCount: Math.floor(Math.random() * 500) + 100,
        publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 ngày trước
      }
    ];

    // Xóa các job hiện có của công ty
    await prisma.job.deleteMany({
      where: { companyId }
    });
    console.log('🗑️ Đã xóa các job cũ của công ty');

    // Tạo các job mới
    const jobs = [];
    for (const jobData of jobsData) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          companyId
        }
      });
      jobs.push(job);
      console.log(`✅ Đã tạo job: ${job.title}`);
    }

    // 3. Tạo các sinh viên và ứng viên
    const studentsData = [
      {
        email: 'nguyen.van.a@student.vnu.edu.vn',
        firstName: 'Nguyễn Văn',
        lastName: 'A',
        university: 'Đại học Quốc gia Hà Nội',
        major: 'Khoa học máy tính',
        skills: ['JavaScript', 'React', 'TypeScript']
      },
      {
        email: 'tran.thi.b@student.vnu.edu.vn',
        firstName: 'Trần Thị',
        lastName: 'B',
        university: 'Đại học Bách Khoa Hà Nội',
        major: 'Kỹ thuật phần mềm',
        skills: ['Node.js', 'MongoDB', 'Express']
      },
      {
        email: 'le.van.c@student.vnu.edu.vn',
        firstName: 'Lê Văn',
        lastName: 'C',
        university: 'Đại học Công nghệ - ĐHQGHN',
        major: 'Khoa học dữ liệu',
        skills: ['Python', 'Vue.js', 'Django']
      },
      {
        email: 'pham.thi.d@student.vnu.edu.vn',
        firstName: 'Phạm Thị',
        lastName: 'D',
        university: 'Đại học FPT',
        major: 'Thiết kế đồ họa',
        skills: ['Figma', 'Adobe XD', 'UI/UX Design']
      }
    ];

    // Tạo các sinh viên
    const students = [];
    for (const studentData of studentsData) {
      // Kiểm tra xem sinh viên đã tồn tại chưa
      let student = await prisma.user.findUnique({
        where: { email: studentData.email },
        include: { studentProfile: true }
      });

      if (!student) {
        student = await prisma.user.create({
          data: {
            email: studentData.email,
            password: '$2b$10$dMrTWrx.nP5MkOUxu/IoB.4Y5RenDlX9EJzMH1zMdgOzKlmTFg7Tq', // password: password123
            role: 'STUDENT',
            isActive: true,
            isVerified: true,
            studentProfile: {
              create: {
                firstName: studentData.firstName,
                lastName: studentData.lastName,
                university: studentData.university,
                major: studentData.major,
                skills: studentData.skills,
                graduationYear: 2024
              }
            }
          },
          include: { studentProfile: true }
        });
        console.log(`✅ Đã tạo sinh viên: ${student.email}`);
      } else {
        console.log(`✅ Đã tìm thấy sinh viên: ${student.email}`);
      }
      
      students.push(student);
    }

    // 4. Tạo các đơn ứng tuyển
    // Xóa các đơn ứng tuyển cũ
    await prisma.application.deleteMany({
      where: {
        job: {
          companyId
        }
      }
    });
    console.log('🗑️ Đã xóa các đơn ứng tuyển cũ');

    // Tạo các đơn ứng tuyển mới
    const applicationStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'];
    
    for (const job of jobs) {
      // Chọn ngẫu nhiên 1-3 sinh viên để ứng tuyển vào mỗi công việc
      const applicantCount = Math.floor(Math.random() * 3) + 1;
      const applicants = students.sort(() => 0.5 - Math.random()).slice(0, applicantCount);
      
      for (const student of applicants) {
        const status = applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)];
        const daysAgo = Math.floor(Math.random() * 7) + 1;
        const appliedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            studentId: student.id,
            status,
            appliedAt,
            coverLetter: `Tôi là ${student.studentProfile.firstName} ${student.studentProfile.lastName}, sinh viên ngành ${student.studentProfile.major} tại ${student.studentProfile.university}. Tôi rất quan tâm đến vị trí ${job.title} tại công ty của bạn và mong muốn được đóng góp vào sự phát triển của công ty.`,
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Đã tạo đơn ứng tuyển: ${student.email} -> ${job.title} (${status})`);
      }
    }

    // 5. Cập nhật số lượng ứng viên cho mỗi job
    for (const job of jobs) {
      const applicationCount = await prisma.application.count({
        where: { jobId: job.id }
      });
      
      await prisma.job.update({
        where: { id: job.id },
        data: { applicationsCount: applicationCount }
      });
      
      console.log(`✅ Đã cập nhật số lượng ứng viên cho job ${job.title}: ${applicationCount}`);
    }

    console.log('🎉 Đã hoàn thành tạo dữ liệu mẫu cho công ty!');
    console.log('\n📊 Thống kê:');
    console.log(`- Số lượng job: ${jobs.length}`);
    console.log(`- Số lượng sinh viên: ${students.length}`);
    
    const totalApplications = await prisma.application.count({
      where: {
        job: {
          companyId
        }
      }
    });
    console.log(`- Tổng số đơn ứng tuyển: ${totalApplications}`);
    
    console.log('\n🧪 Sử dụng token sau để đăng nhập vào tài khoản công ty:');
    console.log(`localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IiR7Y29tcGFueVVzZXIuaWR9IiwiZW1haWwiOiIke2NvbXBhbnlVc2VyLmVtYWlsfSIsInJvbGUiOiJDT01QQU5ZIiwiaWF0IjoxNzUzMTY3NzMxLCJleHAiOjE3NTMyNTQxMzF9.9r8aVeUT-JZx6F4AgSQEgwKT6kQ5elzhhERmMYGNjAs");`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompanyData(); 