const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'recruitment_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function runCompanyTriggers() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    
    console.log('📂 Reading triggers and procedures file...');
    const sqlFile = path.join(__dirname, 'migrations', 'company_triggers_procedures.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Executing triggers and procedures...');
    await client.query(sqlContent);
    
    console.log('✅ Company triggers and procedures installed successfully!');
    
    // Test the functions
    console.log('🧪 Testing database functions...');
    
    // Test get_trending_companies function
    const trendingResult = await client.query('SELECT * FROM get_trending_companies(5, 7)');
    console.log('📈 Trending companies (sample):', trendingResult.rows.length > 0 ? 'Found data' : 'No data yet');
    
    // Test data freshness analysis
    const freshnessResult = await client.query('SELECT * FROM analyze_data_freshness()');
    console.log('📊 Data freshness analysis:', freshnessResult.rows);
    
    // Test trigger performance view
    const performanceResult = await client.query('SELECT * FROM trigger_performance LIMIT 5');
    console.log('⚡ Trigger performance:', performanceResult.rows.length > 0 ? 'Monitoring active' : 'No performance data yet');
    
    // Create sample company analytics data if needed
    console.log('📝 Creating sample analytics data...');
    await createSampleAnalytics(client);
    
    console.log('🎉 All company optimization features are now active!');
    console.log('');
    console.log('Real-time features enabled:');
    console.log('- ✅ Company statistics auto-update');
    console.log('- ✅ View tracking with notifications');
    console.log('- ✅ Job count synchronization');
    console.log('- ✅ Application count tracking');
    console.log('- ✅ Performance monitoring');
    console.log('- ✅ Trending companies calculation');
    console.log('');
    console.log('🔔 Database will now send real-time notifications via:');
    console.log('- LISTEN company_stats_updated');
    console.log('- LISTEN company_view_tracked');
    console.log('- LISTEN job_application_count_updated');
    console.log('- LISTEN job_view_count_updated');
    
  } catch (error) {
    console.error('❌ Error installing company triggers:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed.');
  }
}

async function createSampleAnalytics(client) {
  try {
    // Check if we have any companies
    const companiesResult = await client.query('SELECT id, companyName FROM company_profiles LIMIT 3');
    
    if (companiesResult.rows.length === 0) {
      console.log('ℹ️  No companies found. Skipping sample analytics creation.');
      return;
    }
    
    console.log(`📊 Creating sample analytics for ${companiesResult.rows.length} companies...`);
    
    for (const company of companiesResult.rows) {
      // Create sample view activities
      for (let i = 0; i < 5; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const viewDate = new Date();
        viewDate.setDate(viewDate.getDate() - daysAgo);
        
        await client.query(`
          INSERT INTO activity_logs (
            id, userId, activityType, entityType, entityId, data, createdAt, updatedAt
          ) VALUES (
            gen_random_uuid()::text,
            NULL,
            'VIEW_COMPANY',
            'COMPANY',
            $1,
            json_build_object('ipAddress', '192.168.1.' || (RANDOM() * 255)::int, 'userAgent', 'Sample Browser'),
            $2,
            $2
          ) ON CONFLICT DO NOTHING
        `, [company.id, viewDate]);
      }
      
      console.log(`  ✅ Created sample analytics for ${company.companyname}`);
    }
    
    console.log('📈 Sample analytics data created successfully!');
    
  } catch (error) {
    console.log('⚠️  Warning: Could not create sample analytics:', error.message);
  }
}

// Performance monitoring functions
async function monitorTriggerPerformance() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    console.log('🔍 Checking trigger performance...');
    
    const performanceQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        ROUND(
          CASE 
            WHEN idx_tup_read > 0 
            THEN (idx_tup_fetch::float / idx_tup_read::float) * 100 
            ELSE 0 
          END, 2
        ) as efficiency_percent
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('company_profiles', 'jobs', 'applications', 'activity_logs', 'job_views')
      AND idx_tup_read > 0
      ORDER BY idx_tup_read DESC
      LIMIT 10;
    `;
    
    const result = await client.query(performanceQuery);
    
    if (result.rows.length > 0) {
      console.log('📊 Index Performance Report:');
      console.table(result.rows);
    } else {
      console.log('ℹ️  No index usage data available yet.');
    }
    
    // Check for slow queries
    const slowQueriesQuery = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        ROUND(total_time / calls, 2) as avg_time_ms
      FROM pg_stat_statements
      WHERE query LIKE '%company_profiles%' 
      OR query LIKE '%activity_logs%'
      ORDER BY mean_time DESC
      LIMIT 5;
    `;
    
    try {
      const slowQueries = await client.query(slowQueriesQuery);
      if (slowQueries.rows.length > 0) {
        console.log('🐌 Potential slow queries:');
        console.table(slowQueries.rows);
      }
    } catch (e) {
      console.log('ℹ️  pg_stat_statements not available for query analysis.');
    }
    
  } catch (error) {
    console.error('❌ Error monitoring performance:', error);
  } finally {
    await client.end();
  }
}

// Database health check
async function checkDatabaseHealth() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    console.log('🏥 Performing database health check...');
    
    // Check table sizes
    const tableSizeQuery = `
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('company_profiles', 'jobs', 'applications', 'activity_logs', 'job_views')
      ORDER BY size_bytes DESC;
    `;
    
    const tableSizes = await client.query(tableSizeQuery);
    console.log('💾 Table sizes:');
    console.table(tableSizes.rows);
    
    // Check recent activity
    const activityQuery = `
      SELECT 
        activityType,
        COUNT(*) as count,
        MAX(createdAt) as latest_activity
      FROM activity_logs
      WHERE createdAt >= NOW() - INTERVAL '24 hours'
      GROUP BY activityType
      ORDER BY count DESC;
    `;
    
    const recentActivity = await client.query(activityQuery);
    if (recentActivity.rows.length > 0) {
      console.log('📈 Recent activity (last 24 hours):');
      console.table(recentActivity.rows);
    } else {
      console.log('ℹ️  No recent activity recorded.');
    }
    
    // Check trigger status
    const triggerQuery = `
      SELECT 
        tgname,
        tgrelid::regclass as table_name,
        tgenabled
      FROM pg_trigger
      WHERE tgname IN (
        'job_stats_trigger',
        'application_count_trigger', 
        'job_view_trigger',
        'company_view_trigger'
      );
    `;
    
    const triggers = await client.query(triggerQuery);
    console.log('🔧 Trigger status:');
    console.table(triggers.rows);
    
    console.log('✅ Database health check completed!');
    
  } catch (error) {
    console.error('❌ Error during health check:', error);
  } finally {
    await client.end();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'install':
      await runCompanyTriggers();
      break;
    case 'monitor':
      await monitorTriggerPerformance();
      break;
    case 'health':
      await checkDatabaseHealth();
      break;
    case 'all':
      await runCompanyTriggers();
      await monitorTriggerPerformance();
      await checkDatabaseHealth();
      break;
    default:
      console.log('📚 Company Database Optimization Tool');
      console.log('');
      console.log('Usage: node run-company-triggers.js <command>');
      console.log('');
      console.log('Commands:');
      console.log('  install  - Install company triggers and procedures');
      console.log('  monitor  - Check trigger performance');
      console.log('  health   - Perform database health check');
      console.log('  all      - Run all commands');
      console.log('');
      console.log('Examples:');
      console.log('  node run-company-triggers.js install');
      console.log('  node run-company-triggers.js monitor');
      console.log('  node run-company-triggers.js health');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runCompanyTriggers,
  monitorTriggerPerformance,
  checkDatabaseHealth
}; 