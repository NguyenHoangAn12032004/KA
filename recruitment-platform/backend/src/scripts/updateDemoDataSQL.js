const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateDemoData() {
  const userId = '37e48e5a-6a94-4765-a6cd-384482f2ce34';
  
  try {
    console.log('🚀 Starting comprehensive demo data update...');
    
    // Check if user exists
    const userResult = await pool.query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      console.error('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:', userResult.rows[0].email);
    
    // Update/Insert student profile
    const profileData = {
      userId: userId,
      firstName: 'Nguyễn Hoàng',
      lastName: 'An',
      phone: '+84 123 456 789',
      dateOfBirth: '2004-03-12',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      university: 'Trường Đại học Bách khoa Hà Nội',
      major: 'Khoa học Máy tính',
      graduationYear: 2026,
      gpa: 3.75,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git', 'Machine Learning', 'Data Analysis', 'RESTful APIs', 'GraphQL'],
      experience: 'Có 2 năm kinh nghiệm thực tập và làm việc part-time trong lĩnh vực phát triển web và phân tích dữ liệu',
      portfolio: 'https://nguyenhoanganportfolio.vercel.app',
      github: 'https://github.com/NguyenHoangAn12032004',
      linkedin: 'https://linkedin.com/in/nguyen-hoang-an-dev',
      resume: 'https://drive.google.com/file/d/resume-nguyen-hoang-an.pdf',
      preferredJobTypes: ['INTERNSHIP', 'FULL_TIME', 'PART_TIME'],
      preferredWorkModes: ['HYBRID', 'REMOTE'],
      preferredLocations: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Remote'],
      expectedSalaryMin: 8000000,
      expectedSalaryMax: 15000000
    };

    // Upsert student profile
    const profileQuery = `
      INSERT INTO student_profiles (
        id, "userId", "firstName", "lastName", phone, "dateOfBirth", avatar,
        university, major, "graduationYear", gpa, skills, experience,
        portfolio, github, linkedin, resume, "preferredJobTypes",
        "preferredWorkModes", "preferredLocations", "expectedSalaryMin", "expectedSalaryMax",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW()
      ) ON CONFLICT ("userId") DO UPDATE SET
        "firstName" = EXCLUDED."firstName",
        "lastName" = EXCLUDED."lastName",
        phone = EXCLUDED.phone,
        "dateOfBirth" = EXCLUDED."dateOfBirth",
        avatar = EXCLUDED.avatar,
        university = EXCLUDED.university,
        major = EXCLUDED.major,
        "graduationYear" = EXCLUDED."graduationYear",
        gpa = EXCLUDED.gpa,
        skills = EXCLUDED.skills,
        experience = EXCLUDED.experience,
        portfolio = EXCLUDED.portfolio,
        github = EXCLUDED.github,
        linkedin = EXCLUDED.linkedin,
        resume = EXCLUDED.resume,
        "preferredJobTypes" = EXCLUDED."preferredJobTypes",
        "preferredWorkModes" = EXCLUDED."preferredWorkModes",
        "preferredLocations" = EXCLUDED."preferredLocations",
        "expectedSalaryMin" = EXCLUDED."expectedSalaryMin",
        "expectedSalaryMax" = EXCLUDED."expectedSalaryMax",
        "updatedAt" = NOW()
      RETURNING id
    `;

    const profileResult = await pool.query(profileQuery, [
      profileData.userId, profileData.firstName, profileData.lastName, profileData.phone,
      profileData.dateOfBirth, profileData.avatar, profileData.university, profileData.major,
      profileData.graduationYear, profileData.gpa, profileData.skills, profileData.experience,
      profileData.portfolio, profileData.github, profileData.linkedin, profileData.resume,
      profileData.preferredJobTypes, profileData.preferredWorkModes, profileData.preferredLocations,
      profileData.expectedSalaryMin, profileData.expectedSalaryMax
    ]);

    const studentProfileId = profileResult.rows[0].id;
    console.log('✅ Student profile updated:', studentProfileId);

    // Clear existing related data
    await pool.query('DELETE FROM student_educations WHERE "studentId" = $1', [studentProfileId]);
    await pool.query('DELETE FROM student_experiences WHERE "studentId" = $1', [studentProfileId]);
    await pool.query('DELETE FROM student_projects WHERE "studentId" = $1', [studentProfileId]);
    await pool.query('DELETE FROM student_languages WHERE "studentId" = $1', [studentProfileId]);
    await pool.query('DELETE FROM student_certifications WHERE "studentId" = $1', [studentProfileId]);
    console.log('✅ Cleared existing related data');

    // Add Education records
    const educations = [
      {
        studentId: studentProfileId,
        institution: 'Trường Đại học Bách khoa Hà Nội',
        degree: 'Cử nhân',
        fieldOfStudy: 'Khoa học Máy tính',
        startDate: '2022-09-01',
        endDate: '2026-06-30',
        current: true,
        gpa: 3.75,
        achievements: [
          'Học bổng xuất sắc 2023-2024',
          'Giải nhất cuộc thi lập trình ACM-ICPC cấp trường',
          'Top 10% sinh viên xuất sắc khoa CNTT',
          'Hoàn thành 15 dự án thực tế'
        ]
      },
      {
        studentId: studentProfileId,
        institution: 'Trường THPT Chu Văn An',
        degree: 'Tốt nghiệp THPT',
        fieldOfStudy: 'Chuyên Tin học',
        startDate: '2019-09-01',
        endDate: '2022-06-30',
        current: false,
        gpa: 9.2,
        achievements: [
          'Học sinh xuất sắc 3 năm liên tiếp',
          'Giải nhì Olympic Tin học cấp thành phố',
          'Giải ba cuộc thi Khoa học Kỹ thuật cấp quốc gia'
        ]
      }
    ];

    for (const education of educations) {
      await pool.query(`
        INSERT INTO student_educations (
          id, "studentId", institution, degree, "fieldOfStudy", "startDate", "endDate",
          current, gpa, achievements, "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        education.studentId, education.institution, education.degree, education.fieldOfStudy,
        education.startDate, education.endDate, education.current, education.gpa, education.achievements
      ]);
    }
    console.log(`✅ Created ${educations.length} education records`);

    // Add Work Experience records
    const experiences = [
      {
        studentId: studentProfileId,
        company: 'FPT Software',
        position: 'Frontend Developer Intern',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        current: false,
        description: 'Phát triển giao diện người dùng cho ứng dụng web e-commerce sử dụng React.js và TypeScript. Tối ưu hóa hiệu suất ứng dụng và cải thiện trải nghiệm người dùng.',
        skills: ['React.js', 'TypeScript', 'Material-UI', 'Redux', 'REST APIs'],
        achievements: [
          'Giảm 30% thời gian tải trang thông qua tối ưu hóa code',
          'Phát triển 5 component tái sử dụng được sử dụng toàn dự án',
          'Nhận đánh giá xuất sắc từ mentor và team lead'
        ]
      },
      {
        studentId: studentProfileId,
        company: 'VNG Corporation',
        position: 'Data Analysis Intern',
        startDate: '2024-01-15',
        endDate: '2024-04-30',
        current: false,
        description: 'Phân tích dữ liệu người dùng game Zalo, xây dựng dashboard báo cáo và mô hình dự đoán hành vi người chơi sử dụng Python và SQL.',
        skills: ['Python', 'SQL', 'Pandas', 'Matplotlib', 'Power BI', 'Machine Learning'],
        achievements: [
          'Xây dựng dashboard theo dõi 50+ KPIs quan trọng',
          'Phát triển mô hình dự đoán churn với độ chính xác 85%',
          'Tiết kiệm 20 giờ/tuần cho team thông qua tự động hóa báo cáo'
        ]
      },
      {
        studentId: studentProfileId,
        company: 'CodeGym',
        position: 'Teaching Assistant',
        startDate: '2023-09-01',
        endDate: null,
        current: true,
        description: 'Hỗ trợ giảng dạy các khóa học lập trình web cho người mới bắt đầu. Chấm bài tập, hướng dẫn học viên và phát triển tài liệu học tập.',
        skills: ['HTML/CSS', 'JavaScript', 'Git', 'Teaching', 'Technical Writing'],
        achievements: [
          'Hỗ trợ hơn 200 học viên hoàn thành khóa học',
          'Phát triển 10+ bài tập thực hành được sử dụng chính thức',
          'Đạt rating 4.9/5 từ học viên'
        ]
      }
    ];

    for (const experience of experiences) {
      await pool.query(`
        INSERT INTO student_experiences (
          id, "studentId", company, position, "startDate", "endDate", current,
          description, skills, achievements, "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `, [
        experience.studentId, experience.company, experience.position, experience.startDate,
        experience.endDate, experience.current, experience.description, experience.skills, experience.achievements
      ]);
    }
    console.log(`✅ Created ${experiences.length} experience records`);

    // Add Project records
    const projects = [
      {
        studentId: studentProfileId,
        title: 'E-Learning Platform',
        description: 'Nền tảng học trực tuyến toàn diện với tính năng live streaming, quản lý khóa học, thanh toán và theo dõi tiến độ học tập. Hỗ trợ hơn 1000 học viên đồng thời.',
        technologies: ['React.js', 'Node.js', 'PostgreSQL', 'Socket.io', 'AWS S3', 'Stripe API'],
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        current: false,
        githubUrl: 'https://github.com/NguyenHoangAn12032004/elearning-platform',
        liveUrl: 'https://elearning-platform-demo.vercel.app',
        imageUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop'
      },
      {
        studentId: studentProfileId,
        title: 'AI Chatbot cho Customer Service',
        description: 'Chatbot thông minh sử dụng NLP và Machine Learning để tự động trả lời câu hỏi khách hàng. Tích hợp với CRM và có khả năng học hỏi từ lịch sử hội thoại.',
        technologies: ['Python', 'TensorFlow', 'NLTK', 'FastAPI', 'Redis', 'Docker'],
        startDate: '2024-01-01',
        endDate: '2024-02-28',
        current: false,
        githubUrl: 'https://github.com/NguyenHoangAn12032004/ai-chatbot',
        liveUrl: 'https://ai-chatbot-demo.herokuapp.com',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop'
      },
      {
        studentId: studentProfileId,
        title: 'Mobile Task Management App',
        description: 'Ứng dụng quản lý công việc cho mobile với đồng bộ real-time, thông báo push, và tích hợp calendar. Hỗ trợ làm việc nhóm và theo dõi tiến độ dự án.',
        technologies: ['React Native', 'Firebase', 'Redux', 'Push Notifications', 'Google Calendar API'],
        startDate: '2023-11-01',
        endDate: '2023-12-31',
        current: false,
        githubUrl: 'https://github.com/NguyenHoangAn12032004/task-manager-mobile',
        liveUrl: null,
        imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=400&h=300&fit=crop'
      },
      {
        studentId: studentProfileId,
        title: 'Recruitment Platform',
        description: 'Nền tảng tuyển dụng toàn diện hiện tại đang phát triển. Kết nối sinh viên và nhà tuyển dụng với các tính năng tìm kiếm thông minh, quản lý hồ sơ và quy trình phỏng vấn.',
        technologies: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Material-UI'],
        startDate: '2024-11-01',
        endDate: null,
        current: true,
        githubUrl: 'https://github.com/NguyenHoangAn12032004/recruitment-platform',
        liveUrl: 'http://localhost:3000',
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop'
      }
    ];

    for (const project of projects) {
      await pool.query(`
        INSERT INTO student_projects (
          id, "studentId", title, description, technologies, "startDate", "endDate",
          current, "githubUrl", "liveUrl", "imageUrl", "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      `, [
        project.studentId, project.title, project.description, project.technologies,
        project.startDate, project.endDate, project.current, project.githubUrl,
        project.liveUrl, project.imageUrl
      ]);
    }
    console.log(`✅ Created ${projects.length} project records`);

    // Add Language records
    const languages = [
      { studentId: studentProfileId, name: 'Tiếng Việt', proficiency: 'NATIVE', certification: null },
      { studentId: studentProfileId, name: 'Tiếng Anh', proficiency: 'ADVANCED', certification: 'IELTS 7.5' },
      { studentId: studentProfileId, name: 'Tiếng Nhật', proficiency: 'INTERMEDIATE', certification: 'JLPT N3' },
      { studentId: studentProfileId, name: 'Tiếng Trung', proficiency: 'BEGINNER', certification: 'HSK Level 2' }
    ];

    for (const language of languages) {
      await pool.query(`
        INSERT INTO student_languages (
          id, "studentId", name, proficiency, certification, "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      `, [language.studentId, language.name, language.proficiency, language.certification]);
    }
    console.log(`✅ Created ${languages.length} language records`);

    // Add Certification records
    const certifications = [
      {
        studentId: studentProfileId,
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        issueDate: '2024-05-15',
        expiryDate: '2027-05-15',
        credentialId: 'AWS-CCP-2024-051234',
        credentialUrl: 'https://aws.amazon.com/verification/credentials'
      },
      {
        studentId: studentProfileId,
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        issueDate: '2024-03-20',
        expiryDate: null,
        credentialId: 'GDAPC-2024-032034',
        credentialUrl: 'https://coursera.org/verify/professional-cert/gdapc2024'
      },
      {
        studentId: studentProfileId,
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        issueDate: '2024-01-10',
        expiryDate: '2026-01-10',
        credentialId: 'MDB-DEV-2024-011045',
        credentialUrl: 'https://university.mongodb.com/certification/verify'
      },
      {
        studentId: studentProfileId,
        name: 'React Developer Certification',
        issuer: 'Meta',
        issueDate: '2023-12-05',
        expiryDate: null,
        credentialId: 'META-REACT-2023-120512',
        credentialUrl: 'https://developers.facebook.com/certification/verify'
      },
      {
        studentId: studentProfileId,
        name: 'Python for Data Science',
        issuer: 'IBM',
        issueDate: '2023-10-18',
        expiryDate: null,
        credentialId: 'IBM-PDS-2023-101856',
        credentialUrl: 'https://ibm.com/certification/verify'
      }
    ];

    for (const certification of certifications) {
      await pool.query(`
        INSERT INTO student_certifications (
          id, "studentId", name, issuer, "issueDate", "expiryDate",
          "credentialId", "credentialUrl", "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        certification.studentId, certification.name, certification.issuer,
        certification.issueDate, certification.expiryDate, certification.credentialId, certification.credentialUrl
      ]);
    }
    console.log(`✅ Created ${certifications.length} certification records`);

    console.log('\n🎉 DEMO DATA UPDATE COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n📊 DATA SUMMARY:');
    console.log(`👤 Profile: ${profileData.firstName} ${profileData.lastName}`);
    console.log(`🎓 Education: ${educations.length} records`);
    console.log(`💼 Experience: ${experiences.length} records`);
    console.log(`🚀 Projects: ${projects.length} records`);
    console.log(`🌐 Languages: ${languages.length} records`);
    console.log(`🏆 Certifications: ${certifications.length} records`);
    console.log('\n✨ All data has been successfully populated for user:', userId);

  } catch (error) {
    console.error('❌ Error updating demo data:', error);
  } finally {
    await pool.end();
  }
}

updateDemoData();
