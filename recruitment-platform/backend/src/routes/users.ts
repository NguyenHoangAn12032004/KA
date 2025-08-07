import { Router } from 'express';
import { prisma } from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

// Create the router
const router = Router();

// GET /api/users-enhanced/profile - Get current user's complete profile with related data
router.get('/profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    console.log('📝 [GET Profile] Fetching complete profile for user:', userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: {
          include: {
            student_educations: true,
            student_experiences: true,
            student_projects: true,
            student_certifications: true
          }
        },
        company_profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = null;
    if (user.role === 'STUDENT' && user.student_profiles) {
      const profile = user.student_profiles;
      profileData = {
        ...profile,
        education: profile.student_educations || [],
        workExperiences: profile.student_experiences || [],
        projects: profile.student_projects || [],
        certifications: profile.student_certifications || []
      };
    } else if (user.role === 'COMPANY' && user.company_profiles) {
      profileData = user.company_profiles;
    }

    console.log('✅ [GET Profile] Profile data retrieved successfully');
    
    res.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('❌ [GET Profile] Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        student_profiles: {
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
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// GET /api/users/:id - Get user by ID with profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[GET] Fetching user by ID:', id);
    
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        student_profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            avatar: true,
            university: true,
            major: true,
            graduationYear: true,
            gpa: true,
            skills: true,
            experience: true,
            portfolio: true,
            github: true,
            linkedin: true,
            resume: true,
            preferredJobTypes: true,
            preferredWorkModes: true,
            preferredLocations: true,
            expectedSalaryMin: true,
            expectedSalaryMax: true,
            profile_completion: true,
            createdAt: true,
            updatedAt: true
          }
        },
        company_profiles: {
          select: {
            id: true,
            companyName: true,
            companySize: true,
            industry: true,
            website: true,
            logo: true,
            description: true,
            contactPerson: true,
            phone: true,
            address: true,
            city: true,
            country: true,
            linkedin: true,
            facebook: true,
            twitter: true,
            isVerified: true,
            verificationDoc: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) {
      console.log('[GET] User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('[GET] User found:', user.email, '- Role:', user.role);
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('[GET] Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Delete user (admin action)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[DELETE] Attempting to delete user with ID: ' + id);

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id }
    });

    if (!user) {
      console.log('[DELETE] User not found: ' + id);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    console.log('[DELETE] User found: ' + user.email + ' (' + user.role + ')');

    // Delete associated profiles first
    if (user.role === 'STUDENT') {
      const deletedProfiles = await prisma.student_profiles.deleteMany({
        where: { userId: id }
      });
      console.log('[DELETE] Deleted ' + deletedProfiles.count + ' student profiles');
    } else if (user.role === 'COMPANY') {
      const deletedProfiles = await prisma.company_profiles.deleteMany({
        where: { userId: id }
      });
      console.log('[DELETE] Deleted ' + deletedProfiles.count + ' company profiles');
    }

    // Delete the user
    const deletedUser = await prisma.users.delete({
      where: { id }
    });

    console.log('[DELETE] User deleted successfully: ' + deletedUser.email);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        id: deletedUser.id,
        email: deletedUser.email,
        role: deletedUser.role
      }
    });

  } catch (error) {
    console.log('[DELETE] Error deleting user: ' + error);
    
    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error : 'INTERNAL_SERVER_ERROR'
    });
  }
});

// POST /api/users/update-profile - Enhanced Update with related data
router.post('/update-profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    console.log('📝 [Enhanced Profile] Updating profile for user:', userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        student_profiles: true,
        company_profiles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let updatedProfile;
    if (user.role === 'STUDENT') {
      // Handle student profile update
      const studentData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
        university: profileData.university,
        major: profileData.major,
        graduationYear: profileData.graduationYear ? parseInt(profileData.graduationYear) : null,
        gpa: profileData.gpa ? parseFloat(profileData.gpa) : null,
        skills: profileData.skills || [],
        experience: profileData.summary || profileData.experience,
        avatar: profileData.avatar,
        linkedin: profileData.linkedin,
        github: profileData.github,
        portfolio: profileData.website || profileData.portfolio,
        resume: profileData.resume,
        preferredJobTypes: profileData.preferredJobTypes || [],
        preferredWorkModes: profileData.preferredWorkModes || [],
        preferredLocations: profileData.preferredLocations || [],
        expectedSalaryMin: profileData.expectedSalaryMin,
        expectedSalaryMax: profileData.expectedSalaryMax,
        profile_completion: profileData.profile_completion || 0,
        updatedAt: new Date()
      };

      if (user.student_profiles) {
        updatedProfile = await prisma.student_profiles.update({
          where: { userId: userId },
          data: studentData
        });
      } else {
        updatedProfile = await prisma.student_profiles.create({
          data: {
            ...studentData,
            users: { connect: { id: userId } },
            id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
          }
        });
      }

      // Handle related data updates
      const studentId = updatedProfile.id;
      
      // Update education data
      if (profileData.education && Array.isArray(profileData.education)) {
        // Delete existing education records
        await prisma.student_educations.deleteMany({
          where: { studentId: studentId }
        });
        
        // Create new education records
        for (const edu of profileData.education) {
          if (edu.institution || edu.degree) {
            await prisma.student_educations.create({
              data: {
                id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                student_profiles: {
                  connect: { id: studentId }
                },
                institution: edu.institution || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.fieldOfStudy || '',
                startDate: new Date(edu.startDate) || new Date(),
                endDate: edu.endDate ? new Date(edu.endDate) : null,
                current: Boolean(edu.current),
                gpa: edu.gpa ? parseFloat(edu.gpa.toString()) : null,
                achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
        }
      }
      
      // Update work experiences data
      if (profileData.workExperiences && Array.isArray(profileData.workExperiences)) {
        // Delete existing work experience records
        await prisma.student_experiences.deleteMany({
          where: { studentId: studentId }
        });
        
        // Create new work experience records
        for (const exp of profileData.workExperiences) {
          if (exp.company || exp.position) {
            await prisma.student_experiences.create({
              data: {
                id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                student_profiles: {
                  connect: { id: studentId }
                },
                company: exp.company || '',
                position: exp.position || '',
                startDate: new Date(exp.startDate) || new Date(),
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                current: Boolean(exp.current),
                description: exp.description || '',
                skills: Array.isArray(exp.skills) ? exp.skills : [],
                achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
        }
      }
      
      // Update projects data
      if (profileData.projects && Array.isArray(profileData.projects)) {
        // Delete existing project records
        await prisma.student_projects.deleteMany({
          where: { studentId: studentId }
        });
        
        // Create new project records
        for (const project of profileData.projects) {
          if (project.title || project.description) {
            await prisma.student_projects.create({
              data: {
                id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                student_profiles: {
                  connect: { id: studentId }
                },
                title: project.title || '',
                description: project.description || '',
                technologies: Array.isArray(project.technologies) ? project.technologies : [],
                startDate: new Date(project.startDate) || new Date(),
                endDate: project.endDate ? new Date(project.endDate) : null,
                current: Boolean(project.current),
                githubUrl: project.githubUrl || null,
                liveUrl: project.liveUrl || null,
                imageUrl: project.imageUrl || null,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
        }
      }
      
      // Update certifications data
      if (profileData.certifications && Array.isArray(profileData.certifications)) {
        // Delete existing certification records
        await prisma.student_certifications.deleteMany({
          where: { studentId: studentId }
        });
        
        // Create new certification records
        for (const cert of profileData.certifications) {
          if (cert.name || cert.issuer) {
            await prisma.student_certifications.create({
              data: {
                id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                student_profiles: {
                  connect: { id: studentId }
                },
                name: cert.name || '',
                issuer: cert.issuer || '',
                issueDate: new Date(cert.issueDate || cert.year) || new Date(),
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                credentialId: cert.credentialId || null,
                credentialUrl: cert.credentialUrl || null,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
          }
        }
      }

    } else if (user.role === 'COMPANY') {
      // Handle company profile update
      const companyData = {
        companyName: profileData.companyName,
        industry: profileData.industry,
        companySize: profileData.companySize,
        website: profileData.website,
        description: profileData.description,
        contactPerson: profileData.contactPerson,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        logo: profileData.logo,
        linkedin: profileData.linkedin,
        facebook: profileData.facebook,
        twitter: profileData.twitter,
        updatedAt: new Date()
      };

      if (user.company_profiles) {
        updatedProfile = await prisma.company_profiles.update({
          where: { userId: userId },
          data: companyData
        });
      } else {
        updatedProfile = await prisma.company_profiles.create({
          data: {
            ...companyData,
            users: { connect: { id: userId } },
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
          }
        });
      }
    }

    console.log('✅ [Enhanced Profile] Profile updated successfully for user:', userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('❌ [Enhanced Profile] Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;
