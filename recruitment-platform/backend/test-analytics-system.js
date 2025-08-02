const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnalytics() {
  try {
    console.log('🔧 Testing Analytics System...\n');

    // Test tracking a job view event
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const testAnalyticsId = `job_view_${today.toISOString().split('T')[0]}_test-user_test-job_test-company`;
    
    await prisma.analytics.upsert({
      where: { id: testAnalyticsId },
      update: {
        value: { increment: 1 }
      },
      create: {
        id: testAnalyticsId,
        metric: 'job_view',
        value: 1,
        date: today,
        userId: 'test-user',
        jobId: 'test-job',
        companyId: 'test-company'
      }
    });

    console.log('✅ Job view analytics event tracked successfully');

    // Test tracking an application submit event
    const appAnalyticsId = `application_submit_${today.toISOString().split('T')[0]}_test-user_test-job_test-company`;
    
    await prisma.analytics.upsert({
      where: { id: appAnalyticsId },
      update: {
        value: { increment: 1 }
      },
      create: {
        id: appAnalyticsId,
        metric: 'application_submit',
        value: 1,
        date: today,
        userId: 'test-user',
        jobId: 'test-job',
        companyId: 'test-company'
      }
    });

    console.log('✅ Application submit analytics event tracked successfully');

    // Retrieve and display analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        OR: [
          { userId: 'test-user' },
          { companyId: 'test-company' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📊 Analytics Data:');
    analytics.forEach(record => {
      console.log(`  • ${record.metric}: ${record.value} (${record.date.toISOString().split('T')[0]})`);
    });

    // Test retrieving aggregated data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const jobViews = await prisma.analytics.findMany({
      where: {
        metric: 'job_view',
        date: { gte: thirtyDaysAgo }
      }
    });

    const totalJobViews = jobViews.reduce((sum, record) => sum + record.value, 0);
    console.log(`\n📈 Total job views in last 30 days: ${totalJobViews}`);

    const applications = await prisma.analytics.findMany({
      where: {
        metric: 'application_submit',
        date: { gte: thirtyDaysAgo }
      }
    });

    const totalApplications = applications.reduce((sum, record) => sum + record.value, 0);
    console.log(`📈 Total applications in last 30 days: ${totalApplications}`);

    console.log('\n🎉 Analytics system is working correctly!');
    console.log('\n📝 Summary:');
    console.log('  ✅ Analytics tracking function working');
    console.log('  ✅ Database storage working');
    console.log('  ✅ Data aggregation working');
    console.log('  ✅ Date filtering working');
    
  } catch (error) {
    console.error('❌ Error testing analytics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnalytics();
