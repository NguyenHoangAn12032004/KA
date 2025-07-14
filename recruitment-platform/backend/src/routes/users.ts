import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            major: true
          }
        },
        company_profiles: {
          select: {
            companyName: true,
            industry: true,
            companySize: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all students with profiles (for debugging)
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user profile - MUST BE BEFORE /:id route
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
        },
        company_profiles: true
      }
    }) as any; // Temporary type assertion while Prisma types update

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return the appropriate profile based on user role
    let profileData = null;
    if (user.role === 'STUDENT') {
      if (user.studentProfile) {
        // User has existing profile
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
          summary: user.studentProfile.experience, // Using experience field as summary
          address: null, // Can be added to schema later if needed
          education: user.studentProfile.educations.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startDate: edu.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
            achievements: exp.achievements
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
          }))
        };
      } else {
        // Create default profile for student if not exists
        console.log('🆕 Creating new student profile for user:', userId);
        const newProfile = await prisma.studentProfile.create({
          data: {
            userId,
            firstName: 'Sinh viên',
            lastName: 'Demo',
            skills: ['React', 'TypeScript', 'Node.js'] // Default skills
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
          address: null,
          education: [],
          workExperience: [],
          projects: [],
          languages: [],
          certifications: []
        };
      }
    } else if (user.role === 'COMPANY' && user.company_profiles?.[0]) {
      profileData = user.company_profiles[0];
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

// Update current user profile - MUST BE BEFORE /:id route
router.put('/profile', authenticateToken, async (req, res) => {
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
        studentProfile: true,
        company_profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'STUDENT') {
      const profileData = req.body;
      console.log('🔄 Backend: Updating student profile for user:', userId);
      console.log('📊 Backend: Received profile data:', {
        education: profileData.education?.length || 0,
        workExperience: profileData.workExperience?.length || 0,
        projects: profileData.projects?.length || 0,
        languages: profileData.languages?.length || 0,
        certifications: profileData.certifications?.length || 0
      });
      
      let updatedProfile;
      if (user.studentProfile) {
        // Update existing profile
        updatedProfile = await prisma.studentProfile.update({
          where: { userId },
          data: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            dateOfBirth: profileData.dateOfBirth,
            university: profileData.university,
            major: profileData.major,
            graduationYear: profileData.graduationYear,
            gpa: profileData.gpa,
            skills: profileData.skills,
            portfolio: profileData.portfolio,
            linkedin: profileData.linkedin,
            github: profileData.github,
            experience: profileData.summary
          }
        });

        // Handle education updates
        if (profileData.education) {
          console.log('🎓 Backend: Processing education updates, count:', profileData.education.length);
          // Delete all existing education records
          await prisma.studentEducation.deleteMany({
            where: { studentId: updatedProfile.id }
          });
          
          // Create new education records
          if (profileData.education.length > 0) {
            await prisma.studentEducation.createMany({
              data: profileData.education.map((edu: any) => ({
                studentId: updatedProfile.id,
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                startDate: new Date(edu.startDate),
                endDate: edu.endDate ? new Date(edu.endDate) : null,
                current: edu.current,
                gpa: edu.gpa,
                achievements: edu.achievements || []
              }))
            });
          }
        }

        // Handle work experience updates
        if (profileData.workExperience) {
          await prisma.studentExperience.deleteMany({
            where: { studentId: updatedProfile.id }
          });
          
          if (profileData.workExperience.length > 0) {
            await prisma.studentExperience.createMany({
              data: profileData.workExperience.map((exp: any) => ({
                studentId: updatedProfile.id,
                company: exp.company,
                position: exp.position,
                startDate: new Date(exp.startDate),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                current: exp.current,
                description: exp.description,
                skills: exp.skills || [],
                achievements: exp.achievements || []
              }))
            });
          }
        }

        // Handle projects updates
        if (profileData.projects) {
          await prisma.studentProject.deleteMany({
            where: { studentId: updatedProfile.id }
          });
          
          if (profileData.projects.length > 0) {
            await prisma.studentProject.createMany({
              data: profileData.projects.map((proj: any) => ({
                studentId: updatedProfile.id,
                title: proj.title,
                description: proj.description,
                technologies: proj.technologies || [],
                startDate: new Date(proj.startDate),
                endDate: proj.endDate ? new Date(proj.endDate) : null,
                current: proj.current,
                githubUrl: proj.githubUrl || '',
                liveUrl: proj.liveUrl || '',
                imageUrl: proj.imageUrl || ''
              }))
            });
          }
        }

        // Handle languages updates
        if (profileData.languages) {
          await prisma.studentLanguage.deleteMany({
            where: { studentId: updatedProfile.id }
          });
          
          if (profileData.languages.length > 0) {
            await prisma.studentLanguage.createMany({
              data: profileData.languages.map((lang: any) => ({
                studentId: updatedProfile.id,
                name: lang.name,
                proficiency: lang.proficiency,
                certification: lang.certification || ''
              }))
            });
          }
        }

        // Handle certifications updates
        if (profileData.certifications) {
          await prisma.studentCertification.deleteMany({
            where: { studentId: updatedProfile.id }
          });
          
          if (profileData.certifications.length > 0) {
            await prisma.studentCertification.createMany({
              data: profileData.certifications.map((cert: any) => ({
                studentId: updatedProfile.id,
                name: cert.name,
                issuer: cert.issuer,
                issueDate: new Date(cert.issueDate),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                credentialId: cert.credentialId || '',
                credentialUrl: cert.credentialUrl || ''
              }))
            });
          }
        }
      } else {
        // Create new profile
        updatedProfile = await prisma.studentProfile.create({
          data: {
            userId,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            dateOfBirth: profileData.dateOfBirth,
            university: profileData.university,
            major: profileData.major,
            graduationYear: profileData.graduationYear,
            gpa: profileData.gpa,
            skills: profileData.skills,
            portfolio: profileData.portfolio,
            linkedin: profileData.linkedin,
            github: profileData.github,
            experience: profileData.summary
          }
        });

        // Create related entities for new profile
        if (profileData.education && profileData.education.length > 0) {
          await prisma.studentEducation.createMany({
            data: profileData.education.map((edu: any) => ({
              studentId: updatedProfile.id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              current: edu.current,
              gpa: edu.gpa,
              achievements: edu.achievements || []
            }))
          });
        }

        if (profileData.workExperience && profileData.workExperience.length > 0) {
          await prisma.studentExperience.createMany({
            data: profileData.workExperience.map((exp: any) => ({
              studentId: updatedProfile.id,
              company: exp.company,
              position: exp.position,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current,
              description: exp.description,
              skills: exp.skills || [],
              achievements: exp.achievements || []
            }))
          });
        }

        if (profileData.projects && profileData.projects.length > 0) {
          await prisma.studentProject.createMany({
            data: profileData.projects.map((proj: any) => ({
              studentId: updatedProfile.id,
              title: proj.title,
              description: proj.description,
              technologies: proj.technologies || [],
              startDate: new Date(proj.startDate),
              endDate: proj.endDate ? new Date(proj.endDate) : null,
              current: proj.current,
              githubUrl: proj.githubUrl || '',
              liveUrl: proj.liveUrl || '',
              imageUrl: proj.imageUrl || ''
            }))
          });
        }

        if (profileData.languages && profileData.languages.length > 0) {
          await prisma.studentLanguage.createMany({
            data: profileData.languages.map((lang: any) => ({
              studentId: updatedProfile.id,
              name: lang.name,
              proficiency: lang.proficiency,
              certification: lang.certification || ''
            }))
          });
        }

        if (profileData.certifications && profileData.certifications.length > 0) {
          await prisma.studentCertification.createMany({
            data: profileData.certifications.map((cert: any) => ({
              studentId: updatedProfile.id,
              name: cert.name,
              issuer: cert.issuer,
              issueDate: new Date(cert.issueDate),
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              credentialId: cert.credentialId || '',
              credentialUrl: cert.credentialUrl || ''
            }))
          });
        }
      }

      // Fetch the complete profile with all related data after update
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
        address: null,
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
          achievements: exp.achievements
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
        }))
      };

      res.json({
        success: true,
        data: responseData
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Profile update not supported for this user type'
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        company_profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user status (admin action)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ===== STUDENT EDUCATION ENDPOINTS =====

// POST new education
router.post('/:id/education', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the student profile first
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { institution, degree, fieldOfStudy, startDate, endDate, gpa, current, achievements } = req.body;

    const education = await prisma.studentEducation.create({
      data: {
        studentId: user.studentProfile.id,
        institution,
        degree,
        fieldOfStudy,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        gpa: gpa ? parseFloat(gpa) : null,
        achievements: achievements || []
      }
    });

    res.json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update education
router.put('/:id/education/:educationId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const educationId = parseInt(req.params.educationId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { institution, degree, fieldOfStudy, startDate, endDate, gpa, current, achievements } = req.body;

    const education = await prisma.studentEducation.update({
      where: { 
        id: educationId.toString()
      },
      data: {
        institution,
        degree,
        fieldOfStudy,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        gpa: gpa ? parseFloat(gpa) : null,
        achievements: achievements || []
      }
    });

    res.json(education);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE education
router.delete('/:id/education/:educationId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const educationId = parseInt(req.params.educationId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.studentEducation.delete({
      where: { 
        id: educationId.toString()
      }
    });

    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== STUDENT EXPERIENCE ENDPOINTS =====

// POST new experience
router.post('/:id/experience', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the student profile first
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { company, position, startDate, endDate, description, current, skills, achievements } = req.body;

    const experience = await prisma.studentExperience.create({
      data: {
        studentId: user.studentProfile.id,
        company,
        position,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        description,
        skills: skills || [],
        achievements: achievements || []
      }
    });

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update experience
router.put('/:id/experience/:experienceId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const experienceId = parseInt(req.params.experienceId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { company, position, startDate, endDate, description, current, skills, achievements } = req.body;

    const experience = await prisma.studentExperience.update({
      where: { 
        id: experienceId.toString()
      },
      data: {
        company,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        description,
        skills: skills || [],
        achievements: achievements || []
      }
    });

    res.json(experience);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE experience
router.delete('/:id/experience/:experienceId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const experienceId = parseInt(req.params.experienceId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.studentExperience.delete({
      where: { 
        id: experienceId.toString()
      }
    });

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== STUDENT PROJECTS ENDPOINTS =====

// POST new project
router.post('/:id/projects', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the student profile first
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { title, description, technologies, startDate, endDate, current, githubUrl, liveUrl, imageUrl } = req.body;

    const project = await prisma.studentProject.create({
      data: {
        studentId: user.studentProfile.id,
        title,
        description,
        technologies: technologies || [],
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        githubUrl,
        liveUrl,
        imageUrl
      }
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update project
router.put('/:id/projects/:projectId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const projectId = parseInt(req.params.projectId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, technologies, startDate, endDate, current, githubUrl, liveUrl, imageUrl } = req.body;

    const project = await prisma.studentProject.update({
      where: { 
        id: projectId.toString()
      },
      data: {
        title,
        description,
        technologies: technologies || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        githubUrl,
        liveUrl,
        imageUrl
      }
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE project
router.delete('/:id/projects/:projectId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const projectId = parseInt(req.params.projectId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.studentProject.delete({
      where: { 
        id: projectId.toString()
      }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== STUDENT LANGUAGES ENDPOINTS =====

// POST new language
router.post('/:id/languages', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the student profile first
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { name, proficiency, certification } = req.body;

    const language = await prisma.studentLanguage.create({
      data: {
        studentId: user.studentProfile.id,
        name,
        proficiency,
        certification
      }
    });

    res.json(language);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update language
router.put('/:id/languages/:languageId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const languageId = parseInt(req.params.languageId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, proficiency, certification } = req.body;

    const language = await prisma.studentLanguage.update({
      where: { 
        id: languageId.toString()
      },
      data: {
        name,
        proficiency,
        certification
      }
    });

    res.json(language);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE language
router.delete('/:id/languages/:languageId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const languageId = parseInt(req.params.languageId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.studentLanguage.delete({
      where: { 
        id: languageId.toString()
      }
    });

    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== STUDENT CERTIFICATIONS ENDPOINTS =====

// POST new certification
router.post('/:id/certifications', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get the student profile first
    const user = await prisma.user.findUnique({
      where: { id: userId.toString() },
      include: { studentProfile: true }
    });

    if (!user?.studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl } = req.body;

    const certification = await prisma.studentCertification.create({
      data: {
        studentId: user.studentProfile.id,
        name,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl
      }
    });

    res.json(certification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update certification
router.put('/:id/certifications/:certificationId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const certificationId = parseInt(req.params.certificationId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl } = req.body;

    const certification = await prisma.studentCertification.update({
      where: { 
        id: certificationId.toString()
      },
      data: {
        name,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl
      }
    });

    res.json(certification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE certification
router.delete('/:id/certifications/:certificationId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const certificationId = parseInt(req.params.certificationId);
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.studentCertification.delete({
      where: { 
        id: certificationId.toString()
      }
    });

    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[DELETE] Attempting to delete user with ID: ${id}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      console.log(`[DELETE] User not found: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log(`[DELETE] User found: ${user.email} (${user.role})`);

    // Delete associated profiles first
    if (user.role === 'STUDENT') {
      const deletedProfiles = await prisma.studentProfile.deleteMany({
        where: { userId: id }
      });
      console.log(`[DELETE] Deleted ${deletedProfiles.count} student profiles`);
    } else if (user.role === 'COMPANY') {
      const deletedProfiles = await prisma.company_profiles.deleteMany({
        where: { userId: id }
      });
      console.log(`[DELETE] Deleted ${deletedProfiles.count} company profiles`);
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    });

    console.log(`[DELETE] Successfully deleted user: ${id}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
