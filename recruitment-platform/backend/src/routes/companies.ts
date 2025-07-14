import { Router } from 'express';
import { prisma } from '../utils/database';

const router = Router();

// Get all companies with their statistics
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company_profiles.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            createdAt: true,
            isActive: true
          }
        },
        jobs: {
          select: {
            id: true,
            isActive: true,
            _count: {
              select: {
                applications: true
              }
            }
          }
        },
        _count: {
          select: {
            jobs: true
          }
        }
      }
    });

    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.companyName,
      industry: company.industry || 'Technology',
      size: company.companySize || '1-50',
      location: company.city || 'Vietnam',
      description: company.description || `${company.companyName} is a leading company in ${company.industry || 'technology'} sector.`,
      website: company.website || '',
      rating: 4.2, // Default rating - this could be calculated from reviews later
      totalReviews: Math.floor(Math.random() * 100) + 10, // Mock for now
      openJobs: company.jobs.filter(job => job.isActive).length,
      benefits: ['Health Insurance', 'Professional Development'], // Default benefits for now
      founded: '2020', // Default founded year
      isFollowing: false, // This would depend on the current user
      totalJobs: company._count.jobs,
      totalApplications: company.jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0)
    }));

    res.json({
      success: true,
      data: {
        companies: formattedCompanies,
        total: formattedCompanies.length
      }
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await prisma.company_profiles.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        },
        jobs: {
          include: {
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const formattedCompany = {
      id: company.id,
      name: company.companyName,
      industry: company.industry || 'Technology',
      size: company.companySize || '1-50',
      location: company.city || 'Vietnam',
      description: company.description || `${company.companyName} is a leading company in ${company.industry || 'technology'} sector.`,
      website: company.website || '',
      rating: 4.2,
      totalReviews: Math.floor(Math.random() * 100) + 10,
      openJobs: company.jobs.filter(job => job.isActive).length,
      benefits: ['Health Insurance', 'Professional Development'], // Default benefits
      founded: '2020', // Default founded year
      jobs: company.jobs.map(job => ({
        id: job.id,
        title: job.title,
        location: job.location,
        salary: job.salaryMin && job.salaryMax 
          ? `${job.salaryMin/1000000}-${job.salaryMax/1000000} triệu`
          : 'Thỏa thuận',
        type: job.jobType,
        applicants: job._count?.applications || 0,
        isActive: job.isActive,
        createdAt: job.createdAt
      }))
    };

    res.json({
      success: true,
      data: formattedCompany
    });

  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if company exists
    const existingCompany = await prisma.company_profiles.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update company profile
    const updatedCompany = await prisma.company_profiles.update({
      where: { id },
      data: {
        companyName: updateData.companyName || existingCompany.companyName,
        industry: updateData.industry || existingCompany.industry,
        companySize: updateData.companySize || existingCompany.companySize,
        description: updateData.description || existingCompany.description,
        website: updateData.website || existingCompany.website,
        address: updateData.address || existingCompany.address,
        city: updateData.city || existingCompany.city,
        phone: updateData.phone || existingCompany.phone
      }
    });

    res.json({
      success: true,
      data: updatedCompany,
      message: 'Company updated successfully'
    });

  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if company exists
    const company = await prisma.company_profiles.findUnique({
      where: { id },
      include: {
        users: true,
        jobs: true
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Delete associated jobs first
    await prisma.job.deleteMany({
      where: { companyId: id }
    });

    // Delete company profile
    await prisma.company_profiles.delete({
      where: { id }
    });

    // Optionally delete the user account
    if (company.users) {
      await prisma.user.delete({
        where: { id: company.userId }
      });
    }

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
