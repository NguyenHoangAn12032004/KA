import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export const getApplications = async (req: Request, res: Response) => {
  try {
    console.log('Fetching applications...');
    
    // Get company ID from authenticated user
    const companyId = (req as any).user?.companyId;
    if (!companyId) {
      console.log('No company ID found in request');
      return res.status(403).json({
        success: false,
        error: 'Company ID not found'
      });
    }

    // Get all jobs for this company
    const companyJobs = await prisma.job.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true
      }
    });

    const jobIds = companyJobs.map(job => job.id);
    console.log(`Found ${jobIds.length} jobs for company ${companyId}`);

    // Get applications for these jobs
    const applications = await prisma.application.findMany({
      where: {
        jobId: {
          in: jobIds
        }
      },
      include: {
        student: {
          include: {
            studentProfile: {
              include: {
                educations: true,
                workExperiences: true,
                languages: true,
                certifications: true,
                projects: true
              }
            }
          }
        },
        job: {
          include: {
            company_profiles: true
          }
        },
        interviews: true
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    console.log(`Found ${applications.length} applications`);

    // Transform data to match frontend needs
    const transformedApplications = applications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      status: app.status,
      appliedAt: app.appliedAt,
      updatedAt: app.updatedAt,
      statusHistory: app.statusHistory,
      hrNotes: app.hrNotes,
      feedback: app.feedback,
      rating: app.rating,
      student: {
        id: app.student.id,
        firstName: app.student.studentProfile?.firstName || '',
        lastName: app.student.studentProfile?.lastName || '',
        email: app.student.email,
        phone: app.student.studentProfile?.phone,
        avatar: app.student.studentProfile?.avatar,
        university: app.student.studentProfile?.university,
        major: app.student.studentProfile?.major,
        graduationYear: app.student.studentProfile?.graduationYear,
        gpa: app.student.studentProfile?.gpa,
        skills: app.student.studentProfile?.skills || [],
        experience: app.student.studentProfile?.experience,
        portfolio: app.student.studentProfile?.portfolio,
        github: app.student.studentProfile?.github,
        linkedin: app.student.studentProfile?.linkedin,
        resume: app.student.studentProfile?.resume,
        educations: app.student.studentProfile?.educations.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: edu.current,
          gpa: edu.gpa,
          achievements: edu.achievements
        })) || [],
        workExperiences: app.student.studentProfile?.workExperiences.map(exp => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
          skills: exp.skills,
          achievements: exp.achievements
        })) || [],
        languages: app.student.studentProfile?.languages.map(lang => ({
          name: lang.name,
          proficiency: lang.proficiency,
          certification: lang.certification
        })) || [],
        certifications: app.student.studentProfile?.certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          credentialUrl: cert.credentialUrl
        })) || [],
        projects: app.student.studentProfile?.projects.map(proj => ({
          title: proj.title,
          description: proj.description,
          technologies: proj.technologies,
          startDate: proj.startDate,
          endDate: proj.endDate,
          current: proj.current,
          githubUrl: proj.githubUrl,
          liveUrl: proj.liveUrl,
          imageUrl: proj.imageUrl
        })) || []
      },
      interviews: app.interviews.map(interview => ({
        id: interview.id,
        title: interview.title,
        description: interview.description,
        type: interview.type,
        scheduledAt: interview.scheduledAt,
        duration: interview.duration,
        location: interview.location,
        meetingLink: interview.meetingLink,
        interviewer: interview.interviewer,
        interviewerEmail: interview.interviewerEmail,
        status: interview.status,
        notes: interview.notes,
        rating: interview.rating,
        feedback: interview.feedback
      }))
    }));

    console.log('Successfully transformed applications data');

    res.json({
      success: true,
      data: transformedApplications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, hrNotes, feedback, rating } = req.body;

  try {
    // Get current application
    const currentApp = await prisma.application.findUnique({
      where: { id },
      include: {
        student: true,
        job: {
          include: {
            company_profiles: true
          }
        }
      }
    });

    if (!currentApp) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Update status history
    const statusHistory = JSON.parse(currentApp.statusHistory as string);
    statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: hrNotes
    });

    // Update application
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        status,
        hrNotes,
        feedback,
        rating,
        statusHistory: JSON.stringify(statusHistory),
        reviewedAt: status !== currentApp.status ? new Date() : undefined,
        respondedAt: ['ACCEPTED', 'REJECTED'].includes(status) ? new Date() : undefined
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        },
        job: true
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: currentApp.studentId,
        type: 'APPLICATION_STATUS_CHANGED',
        title: 'Trạng thái ứng tuyển đã được cập nhật',
        message: `Đơn ứng tuyển vị trí ${currentApp.job.title} của bạn đã được cập nhật sang trạng thái mới`,
        data: {
          applicationId: id,
          jobId: currentApp.jobId,
          oldStatus: currentApp.status,
          newStatus: status
        }
      }
    });

    // Get Socket.IO instance
    const io: Server = req.app.get('io');

    // Emit socket event
    io.to(`user:${currentApp.studentId}`).emit('application-status-changed', {
      applicationId: id,
      status,
      jobTitle: currentApp.job.title,
      companyName: currentApp.job.company_profiles.companyName
    });

    res.json({
      success: true,
      data: updatedApp
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 