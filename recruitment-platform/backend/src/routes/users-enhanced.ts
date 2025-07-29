import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

// Create and export the router
const router = Router();
export default router;

// POST để cập nhật profile (thay thế cho PUT để tránh vấn đề CORS)
router.post('/update-profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    // Log thông tin chi tiết
    console.log('🔄 Processing profile update for user:', userId);
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📊 Received profile_completion value:', req.body.profile_completion);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });
    
    // Log thông tin user
    console.log('👤 User found:', user ? 'Yes' : 'No');
    console.log('👤 User role:', user?.role);
    console.log('👤 Has student profile:', !!user?.studentProfile);
    console.log('👤 Current profile_completion in DB:', user?.studentProfile?.profile_completion);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role !== 'STUDENT') {
      console.log('❌ User is not a student. Role:', user.role);
      return res.status(400).json({ success: false, message: 'Profile update not supported for this user type' });
    }
    
    const profileData = req.body;
    console.log('🔄 Backend: Updating student profile for user:', userId);
    let updatedProfile;
    
    try {
      if (user.studentProfile) {
        console.log('🔄 Updating existing profile');
        
        // Đảm bảo profile_completion được lưu đúng
        const profileCompletionValue = profileData.profile_completion !== undefined 
          ? parseInt(profileData.profile_completion.toString()) 
          : user.studentProfile.profile_completion || 0;
          
        console.log('📊 Using profile_completion value for update:', profileCompletionValue);
        console.log('📊 Type of profile_completion:', typeof profileCompletionValue);
        
        // Cập nhật profile với SQL trực tiếp để đảm bảo lưu đúng giá trị
        try {
          // Cập nhật profile
          updatedProfile = await prisma.studentProfile.update({
            where: { userId },
            data: {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone,
              portfolio: profileData.portfolio,
              linkedin: profileData.linkedin,
              github: profileData.github,
              experience: profileData.summary,
              skills: profileData.skills || [],
              // Cập nhật profile_completion từ frontend
              profile_completion: profileCompletionValue,
              updatedAt: new Date()
            }
          });
          
          // Kiểm tra xem profile_completion đã được cập nhật chưa
          console.log('📊 Updated profile_completion in DB:', updatedProfile.profile_completion);
          
          // Nếu không được cập nhật, thử cập nhật trực tiếp bằng SQL
          if (updatedProfile.profile_completion !== profileCompletionValue) {
            console.log('⚠️ profile_completion not updated correctly, trying with raw SQL');
            
            await prisma.$executeRaw`
              UPDATE "public"."student_profiles" 
              SET "profile_completion" = ${profileCompletionValue}
              WHERE "userId" = ${userId}
            `;
            
            // Kiểm tra lại sau khi cập nhật bằng SQL
            const checkProfile = await prisma.studentProfile.findUnique({
              where: { userId }
            });
            
            console.log('📊 profile_completion after SQL update:', checkProfile?.profile_completion);
            
            if (checkProfile) {
              updatedProfile = checkProfile;
            }
          }
          
          console.log('✅ Profile updated successfully');
        } catch (err) {
          console.error('❌ Error updating profile:', err);
          throw err;
        }
      } else {
        console.log('🆕 Creating new profile');
        
        // Tạo profile mới
        updatedProfile = await prisma.studentProfile.create({
          data: {
            userId,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phone: profileData.phone,
            portfolio: profileData.portfolio,
            linkedin: profileData.linkedin,
            github: profileData.github,
            experience: profileData.summary,
            skills: profileData.skills || [],
            // Cập nhật profile_completion từ frontend
            profile_completion: profileData.profile_completion || 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Profile created successfully');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error updating profile: ' + (err as Error).message 
      });
    }
    
    // Cập nhật education
    try {
      if (profileData.education) {
        console.log('🔄 Updating education data:', profileData.education);
        
        // Xóa dữ liệu education cũ
        await prisma.studentEducation.deleteMany({ 
          where: { studentId: updatedProfile.id } 
        });
        
        // Thêm dữ liệu education mới nếu có
        if (profileData.education.length > 0) {
          await prisma.studentEducation.createMany({
            data: profileData.education.map((edu: any) => ({
              studentId: updatedProfile.id,
              institution: edu.institution || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              current: edu.current || false,
              gpa: edu.gpa,
              achievements: edu.achievements
            }))
          });
        }
        
        console.log('✅ Education data updated successfully');
      }
    } catch (err) {
      console.error('❌ Error updating education:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error updating education: ' + (err as Error).message 
      });
    }
    
    // Cập nhật projects
    try {
      if (profileData.projects) {
        console.log('🔄 Updating projects data:', profileData.projects);
        
        // Xóa dữ liệu projects cũ
        await prisma.studentProject.deleteMany({ 
          where: { studentId: updatedProfile.id } 
        });
        
        // Thêm dữ liệu projects mới nếu có
        if (profileData.projects.length > 0) {
          await prisma.studentProject.createMany({
            data: profileData.projects.map((proj: any) => ({
              studentId: updatedProfile.id,
              title: proj.title || '',
              description: proj.description || '',
              technologies: proj.technologies || [],
              startDate: new Date(proj.startDate),
              endDate: proj.endDate ? new Date(proj.endDate) : null,
              current: proj.current || false,
              githubUrl: proj.githubUrl || '',
              liveUrl: proj.liveUrl || '',
              imageUrl: proj.imageUrl || ''
            }))
          });
        }
        
        console.log('✅ Projects data updated successfully');
      }
    } catch (err) {
      console.error('❌ Error updating projects:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error updating projects: ' + (err as Error).message 
      });
    }
    
    // Cập nhật workExperiences
    try {
      if (profileData.workExperiences) {
        console.log('🔄 Updating work experiences data:', profileData.workExperiences);
        
        // Xóa dữ liệu workExperiences cũ
        await prisma.studentExperience.deleteMany({ 
          where: { studentId: updatedProfile.id } 
        });
        
        // Thêm dữ liệu workExperiences mới nếu có
        if (profileData.workExperiences.length > 0) {
          try {
            await prisma.studentExperience.createMany({
              data: profileData.workExperiences.map((exp: any) => {
                // Xử lý achievements - chuyển đổi từ string sang mảng string nếu cần
                let achievements: string[] = [];
                if (exp.achievements) {
                  if (typeof exp.achievements === 'string') {
                    // Nếu là string, tách thành mảng theo dòng mới
                    achievements = exp.achievements.split('\n').filter((item: string) => item.trim() !== '');
                  } else if (Array.isArray(exp.achievements)) {
                    // Nếu đã là mảng, sử dụng trực tiếp
                    achievements = exp.achievements;
                  }
                }
                
                // Kiểm tra và đảm bảo các trường ngày tháng hợp lệ
                let startDate = new Date();
                try {
                  startDate = exp.startDate ? new Date(exp.startDate) : new Date();
                } catch (err) {
                  console.error('❌ Invalid startDate format:', exp.startDate);
                }
                
                let endDate = null;
                try {
                  endDate = exp.endDate && !exp.current ? new Date(exp.endDate) : null;
                } catch (err) {
                  console.error('❌ Invalid endDate format:', exp.endDate);
                }
                
                // Log chi tiết từng mục work experience
                console.log(`📝 Processing work experience: ${exp.company} - ${exp.position}`);
                console.log(`📅 Dates: ${startDate} to ${endDate}, current: ${exp.current}`);
                
                return {
                  studentId: updatedProfile.id,
                  company: exp.company || '',
                  position: exp.position || '',
                  description: exp.description || '',
                  startDate: startDate,
                  endDate: endDate,
                  current: exp.current || false,
                  skills: exp.skills || [],
                  achievements: achievements
                };
              })
            });
            console.log('✅ Work experiences created successfully');
          } catch (expError) {
            console.error('❌ Error creating work experiences:', expError);
            console.error('❌ Error details:', (expError as Error).message);
            throw expError;
          }
        }
        
        console.log('✅ Work experiences data updated successfully');
      }
    } catch (err) {
      console.error('❌ Error updating work experiences:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error updating work experiences: ' + (err as Error).message 
      });
    }
    
    // Cập nhật certifications
    try {
      if (profileData.certifications) {
        console.log('🔄 Updating certifications data:', profileData.certifications);
        
        // Xóa dữ liệu certifications cũ
        await prisma.studentCertification.deleteMany({ 
          where: { studentId: updatedProfile.id } 
        });
        
        // Thêm dữ liệu certifications mới nếu có
        if (profileData.certifications.length > 0) {
          try {
            await prisma.studentCertification.createMany({
              data: profileData.certifications.map((cert: any) => {
                // Kiểm tra và xử lý năm
                let issueDate = new Date();
                try {
                  if (cert.year) {
                    // Nếu chỉ có năm, tạo ngày 1/1/năm đó
                    issueDate = new Date(`${cert.year}-01-01`);
                  } else if (cert.issueDate) {
                    // Nếu có ngày đầy đủ, sử dụng trực tiếp
                    issueDate = new Date(cert.issueDate);
                  }
                } catch (err) {
                  console.error('❌ Invalid date format:', cert.year || cert.issueDate);
                }
                
                // Log chi tiết từng chứng chỉ
                console.log(`📝 Processing certification: ${cert.name} from ${cert.issuer}`);
                console.log(`📅 Issue date: ${issueDate}`);
                
                return {
                  studentId: updatedProfile.id,
                  name: cert.name || '',
                  issuer: cert.issuer || '',
                  issueDate: issueDate,
                  expiryDate: null,
                  credentialId: cert.credentialId || '',
                  credentialUrl: cert.credentialUrl || ''
                };
              })
            });
            console.log('✅ Certifications created successfully');
          } catch (certError) {
            console.error('❌ Error creating certifications:', certError);
            console.error('❌ Error details:', (certError as Error).message);
            throw certError;
          }
        }
        
        console.log('✅ Certifications data updated successfully');
      }
    } catch (err) {
      console.error('❌ Error updating certifications:', err);
      return res.status(400).json({ 
        success: false, 
        message: 'Error updating certifications: ' + (err as Error).message 
      });
    }
    
    // Lấy dữ liệu profile đầy đủ sau khi cập nhật
    const completeProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        educations: true,
        workExperiences: true,
        projects: true,
        languages: true,
        certifications: true
      }
    });
    
    // Chuẩn bị dữ liệu trả về
    const responseData = {
      id: completeProfile!.id,
      firstName: completeProfile!.firstName,
      lastName: completeProfile!.lastName,
      email: user.email,
      phone: completeProfile!.phone,
      dateOfBirth: completeProfile!.dateOfBirth,
      university: completeProfile!.university,
      major: completeProfile!.major,
      graduationYear: completeProfile!.graduationYear,
      gpa: completeProfile!.gpa,
      skills: completeProfile!.skills || [],
      portfolio: completeProfile!.portfolio,
      linkedin: completeProfile!.linkedin,
      github: completeProfile!.github,
      resume: completeProfile!.resume,
      avatar: completeProfile!.avatar,
      summary: completeProfile!.experience,
      education: completeProfile!.educations.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate.toISOString().split('T')[0],
        endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
        current: edu.current,
        gpa: edu.gpa,
        achievements: edu.achievements
      })),
      workExperience: completeProfile!.workExperiences.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate.toISOString().split('T')[0],
        endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
        current: exp.current,
        description: exp.description,
        skills: exp.skills,
        achievements: exp.achievements.join('\n') // Chuyển mảng thành chuỗi phân tách bằng dòng mới
      })),
      projects: completeProfile!.projects.map(proj => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        technologies: proj.technologies,
        startDate: proj.startDate.toISOString().split('T')[0],
        endDate: proj.endDate ? proj.endDate.toISOString().split('T')[0] : '',
        current: proj.current,
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        imageUrl: proj.imageUrl
      })),
      languages: completeProfile!.languages.map(lang => ({
        id: lang.id,
        name: lang.name,
        proficiency: lang.proficiency,
        certification: lang.certification
      })),
      certifications: completeProfile!.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString().split('T')[0],
        expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : '',
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl
      })),
      // Đảm bảo trả về giá trị profile_completion đã cập nhật
      profile_completion: completeProfile!.profile_completion || 0,
      total_certifications: completeProfile!.certifications.length,
      total_projects: completeProfile!.projects.length
    };
    
    // Trả về kết quả
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + (error as Error).message 
    });
  }
});

// Lấy profile của user hiện tại
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            educations: true,
            workExperiences: true,
            projects: true,
            languages: true,
            certifications: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Trả về profile dựa vào role của user
    let profileData = null;
    if (user.role === 'STUDENT') {
      if (user.studentProfile) {
        // User đã có profile
        profileData = {
          id: user.studentProfile.id,
          firstName: user.studentProfile.firstName,
          lastName: user.studentProfile.lastName,
          email: user.email,
          phone: user.studentProfile.phone,
          dateOfBirth: user.studentProfile.dateOfBirth,
          university: user.studentProfile.university,
          major: user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
          gpa: user.studentProfile.gpa,
          skills: user.studentProfile.skills || [],
          portfolio: user.studentProfile.portfolio,
          linkedin: user.studentProfile.linkedin,
          github: user.studentProfile.github,
          resume: user.studentProfile.resume,
          avatar: user.studentProfile.avatar,
          summary: user.studentProfile.experience,
          education: user.studentProfile.educations.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate.toISOString().split('T')[0],
            endDate: edu.endDate ? edu.endDate.toISOString().split('T')[0] : '',
            current: edu.current,
            gpa: edu.gpa,
            achievements: edu.achievements
          })),
          workExperience: user.studentProfile.workExperiences.map(exp => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            startDate: exp.startDate.toISOString().split('T')[0],
            endDate: exp.endDate ? exp.endDate.toISOString().split('T')[0] : '',
            current: exp.current,
            description: exp.description,
            skills: exp.skills,
            achievements: exp.achievements.join('\n') // Chuyển mảng thành chuỗi phân tách bằng dòng mới
          })),
          projects: user.studentProfile.projects.map(proj => ({
            id: proj.id,
            title: proj.title,
            description: proj.description,
            technologies: proj.technologies,
            startDate: proj.startDate.toISOString().split('T')[0],
            endDate: proj.endDate ? proj.endDate.toISOString().split('T')[0] : '',
            current: proj.current,
            githubUrl: proj.githubUrl,
            liveUrl: proj.liveUrl,
            imageUrl: proj.imageUrl
          })),
          languages: user.studentProfile.languages.map(lang => ({
            id: lang.id,
            name: lang.name,
            proficiency: lang.proficiency,
            certification: lang.certification
          })),
          certifications: user.studentProfile.certifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issueDate: cert.issueDate.toISOString().split('T')[0],
            expiryDate: cert.expiryDate ? cert.expiryDate.toISOString().split('T')[0] : '',
            credentialId: cert.credentialId,
            credentialUrl: cert.credentialUrl
          })),
          // Trả về giá trị profile_completion
          profile_completion: user.studentProfile.profile_completion || 0,
          total_certifications: user.studentProfile.certifications.length,
          total_projects: user.studentProfile.projects.length,
        };
      } else {
        // Tạo profile mặc định nếu chưa có
        console.log('🆕 Creating new student profile for user:', userId);
        const newProfile = await prisma.studentProfile.create({
          data: {
            userId,
            firstName: 'Sinh viên',
            lastName: 'Demo',
            skills: ['React', 'TypeScript', 'Node.js'], // Skills mặc định
            profile_completion: 0 // Giá trị profile_completion ban đầu
          }
        });
        
        profileData = {
          id: newProfile.id,
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          email: user.email,
          phone: newProfile.phone,
          dateOfBirth: newProfile.dateOfBirth,
          university: newProfile.university,
          major: newProfile.major,
          graduationYear: newProfile.graduationYear,
          gpa: newProfile.gpa,
          skills: newProfile.skills || [],
          portfolio: newProfile.portfolio,
          linkedin: newProfile.linkedin,
          github: newProfile.github,
          resume: newProfile.resume,
          avatar: newProfile.avatar,
          summary: newProfile.experience,
          education: [],
          workExperience: [],
          projects: [],
          languages: [],
          certifications: [],
          // Giá trị profile_completion ban đầu
          profile_completion: 0,
          total_certifications: 0,
          total_projects: 0,
        };
      }
    }

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Route để test API
router.post('/test-profile-update', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    console.log('🧪 Test API called with data:', req.body);
    
    res.json({
      success: true,
      message: 'Test API called successfully',
      data: {
        receivedData: req.body,
        userId: userId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in test API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}); 