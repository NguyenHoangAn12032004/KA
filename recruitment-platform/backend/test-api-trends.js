const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🧪 Testing database function directly...');
    const result = await prisma.$queryRaw`SELECT * FROM get_dashboard_analytics(30)`;
    const stats = result[0];
    
    console.log('Raw DB result:');
    console.log('- job_views_30d:', stats.job_views_30d.toString());
    console.log('- applications_30d:', stats.applications_30d.toString());
    console.log('- interviews_30d:', stats.interviews_30d.toString());
    console.log('- job_views_trend:', stats.job_views_trend.toString());
    console.log('- applications_trend:', stats.applications_trend.toString());
    console.log('- interviews_trend:', stats.interviews_trend.toString());
    
    console.log('✅ Formatted analytics with trends:');
    const analytics = {
      success: true,
      data: {
        jobViews30d: Number(stats.job_views_30d) || 0,
        applications30d: Number(stats.applications_30d) || 0,
        interviews30d: Number(stats.interviews_30d) || 0,
        totalUsers: Number(stats.total_users) || 0,
        totalJobs: Number(stats.total_jobs) || 0,
        totalApplications: Number(stats.total_applications) || 0,
        totalCompanies: Number(stats.total_companies) || 0,
        trends: {
          jobViews: Number(stats.job_views_trend) || 0,
          applications: Number(stats.applications_trend) || 0,
          interviews: Number(stats.interviews_trend) || 0
        },
        analytics: {
          job_view: Number(stats.job_views_30d) || 0,
          application_submit: Number(stats.applications_30d) || 0,
          interview: Number(stats.interviews_30d) || 0
        }
      }
    };
    
    console.log('Formatted response:', JSON.stringify(analytics, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
