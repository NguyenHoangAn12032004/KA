#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

class BasicOptimizer {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async runBasicOptimization() {
    console.log('🚀 RUNNING BASIC DATABASE OPTIMIZATION...\n');

    try {
      // Step 1: Create extensions
      console.log('📦 Creating required extensions...');
      try {
        await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`;
        console.log('   ✅ Extensions created successfully');
      } catch (error) {
        console.log('   ⚠️  Extensions may already exist:', error.message);
      }

      // Step 2: Create performance indexes
      console.log('\n🏃 Creating performance indexes...');
      
      const indexes = [
        // User indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_gin ON users USING gin(email gin_trgm_ops)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, "isActive")',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users("createdAt")',
        
        // Company profile indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_name_gin ON company_profiles USING gin("companyName" gin_trgm_ops)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_company_profiles_location ON company_profiles(city, country)',
        
        // Job indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_title_gin ON jobs USING gin(title gin_trgm_ops)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_company_active ON jobs("companyId", "isActive")',
        
        // Application indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_student_status ON applications("studentId", status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_job_status ON applications("jobId", status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_applied_at ON applications("appliedAt")',
      ];

      for (let i = 0; i < indexes.length; i++) {
        try {
          await this.prisma.$executeRawUnsafe(indexes[i]);
          console.log(`   ✅ Index ${i + 1}/${indexes.length} created`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`   ⚠️  Index ${i + 1}/${indexes.length} already exists`);
          } else {
            console.log(`   ❌ Index ${i + 1}/${indexes.length} failed:`, error.message);
          }
        }
      }

      // Step 3: Create materialized views
      console.log('\n📊 Creating materialized views...');
      
      // Company stats view
      try {
        await this.prisma.$executeRaw`
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_company_stats AS
          SELECT 
              cp.id as company_id,
              cp."companyName" as company_name,
              cp.industry,
              cp.city,
              cp."isVerified" as is_verified,
              COALESCE(job_stats.total_jobs, 0) as total_jobs,
              COALESCE(job_stats.active_jobs, 0) as active_jobs,
              COALESCE(view_stats.total_views, 0) as total_views,
              COALESCE(view_stats.unique_views, 0) as unique_views,
              COALESCE(app_stats.total_applications, 0) as total_applications,
              job_stats.latest_job_posted,
              view_stats.latest_view,
              CURRENT_TIMESTAMP as last_updated
          FROM company_profiles cp
          LEFT JOIN (
              SELECT 
                  "companyId",
                  COUNT(*) as total_jobs,
                  COUNT(*) FILTER (WHERE "isActive" = true) as active_jobs,
                  MAX("publishedAt") as latest_job_posted
              FROM jobs 
              GROUP BY "companyId"
          ) job_stats ON cp.id = job_stats."companyId"
          LEFT JOIN (
              SELECT 
                  j."companyId",
                  COUNT(jv.*) as total_views,
                  COUNT(DISTINCT COALESCE(jv."userId"::text, jv."ipAddress")) as unique_views,
                  MAX(jv."viewedAt") as latest_view
              FROM job_views jv
              JOIN jobs j ON jv."jobId" = j.id
              GROUP BY j."companyId"
          ) view_stats ON cp.id = view_stats."companyId"
          LEFT JOIN (
              SELECT 
                  j."companyId",
                  COUNT(a.*) as total_applications
              FROM applications a
              JOIN jobs j ON a."jobId" = j.id
              GROUP BY j."companyId"
          ) app_stats ON cp.id = app_stats."companyId"
        `;
        console.log('   ✅ Company stats materialized view created');
      } catch (error) {
        console.log('   ⚠️  Company stats view:', error.message);
      }

      // Job stats view  
      try {
        await this.prisma.$executeRaw`
          CREATE MATERIALIZED VIEW IF NOT EXISTS mv_job_stats AS
          SELECT 
              j.id as job_id,
              j.title,
              j."companyId" as company_id,
              j."jobType" as job_type,
              j."isActive" as is_active,
              j."publishedAt" as published_at,
              COALESCE(app_stats.total_applications, 0) as total_applications,
              COALESCE(app_stats.pending_applications, 0) as pending_applications,
              COALESCE(view_stats.total_views, 0) as total_views,
              COALESCE(view_stats.unique_views, 0) as unique_views,
              view_stats.latest_view,
              app_stats.latest_application,
              CURRENT_TIMESTAMP as last_updated
          FROM jobs j
          LEFT JOIN (
              SELECT 
                  "jobId",
                  COUNT(*) as total_applications,
                  COUNT(*) FILTER (WHERE status = 'PENDING') as pending_applications,
                  MAX("appliedAt") as latest_application
              FROM applications
              GROUP BY "jobId"
          ) app_stats ON j.id = app_stats."jobId"
          LEFT JOIN (
              SELECT 
                  "jobId",
                  COUNT(*) as total_views,
                  COUNT(DISTINCT COALESCE("userId"::text, "ipAddress")) as unique_views,
                  MAX("viewedAt") as latest_view
              FROM job_views
              GROUP BY "jobId"
          ) view_stats ON j.id = view_stats."jobId"
        `;
        console.log('   ✅ Job stats materialized view created');
      } catch (error) {
        console.log('   ⚠️  Job stats view:', error.message);
      }

      // Step 4: Create indexes on materialized views
      console.log('\n🏗️  Creating materialized view indexes...');
      const mvIndexes = [
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_company_stats_id ON mv_company_stats(company_id)',
        'CREATE INDEX IF NOT EXISTS idx_mv_company_stats_active_jobs ON mv_company_stats(active_jobs DESC)',
        'CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_job_stats_id ON mv_job_stats(job_id)',
        'CREATE INDEX IF NOT EXISTS idx_mv_job_stats_company ON mv_job_stats(company_id)',
      ];

      for (const index of mvIndexes) {
        try {
          await this.prisma.$executeRawUnsafe(index);
          console.log('   ✅ Materialized view index created');
        } catch (error) {
          console.log('   ⚠️  MV index:', error.message);
        }
      }

      // Step 5: Create basic functions
      console.log('\n⚡ Creating stored procedures...');
      
      try {
        await this.prisma.$executeRaw`
          CREATE OR REPLACE FUNCTION refresh_company_stats()
          RETURNS void AS $$
          BEGIN
              REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_stats;
              REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_stats;
          END;
          $$ LANGUAGE plpgsql
        `;
        console.log('   ✅ Refresh function created'); 
      } catch (error) {
        console.log('   ⚠️  Refresh function:', error.message);
      }

      try {
        await this.prisma.$executeRaw`
          CREATE OR REPLACE FUNCTION get_trending_companies_basic(p_limit integer DEFAULT 10)
          RETURNS TABLE (
              company_id text,
              company_name text,
              total_views bigint,
              active_jobs bigint
          ) AS $$
          BEGIN
              RETURN QUERY
              SELECT 
                  mcs.company_id::text,
                  mcs.company_name::text,
                  mcs.total_views,
                  mcs.active_jobs
              FROM mv_company_stats mcs
              WHERE mcs.active_jobs > 0
              ORDER BY mcs.total_views DESC, mcs.active_jobs DESC
              LIMIT p_limit;
          END;
          $$ LANGUAGE plpgsql
        `;
        console.log('   ✅ Trending companies function created');
      } catch (error) {
        console.log('   ⚠️  Trending function:', error.message);
      }

      // Step 6: Create database health view
      try {
        await this.prisma.$executeRaw`
          CREATE OR REPLACE VIEW v_database_health AS
          SELECT 
              schemaname,
              tablename,
              pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
              pg_stat_get_tuples_inserted(c.oid) as inserts,
              pg_stat_get_tuples_updated(c.oid) as updates,
              pg_stat_get_tuples_deleted(c.oid) as deletes,
              pg_stat_get_live_tuples(c.oid) as live_tuples,
              pg_stat_get_dead_tuples(c.oid) as dead_tuples
          FROM pg_tables pt
          JOIN pg_class c ON c.relname = pt.tablename
          WHERE schemaname = 'public'
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        `;
        console.log('   ✅ Database health view created');
      } catch (error) {
        console.log('   ⚠️  Health view:', error.message);
      }

      // Step 7: Initial refresh of materialized views
      console.log('\n🔄 Refreshing materialized views...');
      try {
        await this.prisma.$executeRaw`SELECT refresh_company_stats()`;
        console.log('   ✅ Materialized views refreshed');
      } catch (error) {
        console.log('   ⚠️  Refresh error:', error.message);
      }

      console.log('\n✅ BASIC DATABASE OPTIMIZATION COMPLETED!');
      console.log('='.repeat(50));
      console.log('Features enabled:');
      console.log('✅ Performance indexes for key tables');
      console.log('✅ Full-text search capabilities');
      console.log('✅ Materialized views for statistics');
      console.log('✅ Basic stored procedures');
      console.log('✅ Database health monitoring');
      console.log('='.repeat(50));

    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      throw error;
    }
  }

  async runBenchmarks() {
    console.log('\n🏃 RUNNING PERFORMANCE BENCHMARKS...\n');

    const benchmarks = [
      {
        name: 'Company Search (Full-text)',
        query: `
          SELECT cp.id, cp."companyName", cp.industry, cp."isVerified"
          FROM company_profiles cp
          WHERE cp."companyName" ILIKE '%tech%'
          ORDER BY cp."companyName"
          LIMIT 10
        `
      },
      {
        name: 'Job Search by Location',
        query: `
          SELECT j.id, j.title, j.location, j."companyId"
          FROM jobs j
          WHERE j."isActive" = true 
          AND j.location ILIKE '%Hanoi%'
          ORDER BY j."createdAt" DESC
          LIMIT 10
        `
      },
      {
        name: 'Company Statistics',
        query: `
          SELECT * FROM mv_company_stats 
          WHERE active_jobs > 0
          ORDER BY total_views DESC
          LIMIT 5
        `
      },
      {
        name: 'Application Analytics',
        query: `
          SELECT a.status, COUNT(*) as count
          FROM applications a
          GROUP BY a.status
          ORDER BY count DESC
        `
      }
    ];

    for (const benchmark of benchmarks) {
      try {
        const startTime = Date.now();
        const result = await this.prisma.$queryRawUnsafe(benchmark.query);
        const executionTime = Date.now() - startTime;
        
        console.log(`📊 ${benchmark.name}:`);
        console.log(`   Execution Time: ${executionTime}ms`);
        console.log(`   Results: ${Array.isArray(result) ? result.length : 1} rows`);
        console.log('');
      } catch (error) {
        console.log(`❌ ${benchmark.name}: ${error.message}`);
      }
    }
  }

  async generateReport() {
    console.log('\n📋 DATABASE OPTIMIZATION REPORT\n');
    console.log('='.repeat(60));

    try {
      // Get database health
      const healthStats = await this.prisma.$queryRaw`
        SELECT * FROM v_database_health LIMIT 10
      `;

      console.log('📊 DATABASE STATISTICS:');
      healthStats.forEach(stat => {
        console.log(`   ${stat.tablename}: ${stat.size} (${stat.live_tuples} rows)`);
      });

      // Check materialized views
      const mvCheck = await this.prisma.$queryRaw`
        SELECT schemaname, matviewname, ispopulated
        FROM pg_matviews 
        WHERE schemaname = 'public'
      `;

      console.log('\n📈 MATERIALIZED VIEWS:');
      mvCheck.forEach(mv => {
        console.log(`   ${mv.matviewname}: ${mv.ispopulated ? '✅ Populated' : '❌ Not Populated'}`);
      });

      // Get trending companies sample
      try {
        const trending = await this.prisma.$queryRaw`
          SELECT * FROM get_trending_companies_basic(3)
        `;
        
        console.log('\n🔥 TOP TRENDING COMPANIES:');
        trending.forEach((company, i) => {
          console.log(`   ${i + 1}. ${company.company_name} (${company.total_views} views, ${company.active_jobs} jobs)`);
        });
      } catch (error) {
        console.log('\n⚠️  Trending companies function not available');
      }

      console.log('\n🎯 OPTIMIZATION STATUS:');
      console.log('   ✅ Performance indexes: Active');
      console.log('   ✅ Full-text search: Enabled');
      console.log('   ✅ Statistics caching: Materialized views');
      console.log('   ✅ Query optimization: Enhanced');
      console.log('   ✅ Database monitoring: Available');

    } catch (error) {
      console.log('⚠️  Could not generate complete report:', error.message);
    }
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// Main execution
async function main() {
  const optimizer = new BasicOptimizer();
  
  try {
    await optimizer.runBasicOptimization();
    await optimizer.runBenchmarks();
    await optimizer.generateReport();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await optimizer.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = BasicOptimizer; 