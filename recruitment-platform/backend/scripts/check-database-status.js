const { PrismaClient } = require('@prisma/client');

async function checkDatabaseStatus() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 CHECKING DATABASE STATUS AFTER OPTIMIZATION\n');
        
        // Check existing triggers
        console.log('📋 Existing Triggers:');
        const triggers = await prisma.$queryRaw`
            SELECT trigger_name, event_object_table, action_timing, event_manipulation
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name
        `;
        
        if (triggers.length > 0) {
            triggers.forEach(trigger => {
                console.log(`   ✅ ${trigger.event_object_table}.${trigger.trigger_name} (${trigger.action_timing} ${trigger.event_manipulation})`);
            });
        } else {
            console.log('   ⚠️  No triggers found');
        }
        
        // Check existing functions
        console.log('\n🔧 Database Functions:');
        const functions = await prisma.$queryRaw`
            SELECT proname as function_name, prokind
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND proname NOT LIKE 'uuid_%'
            ORDER BY proname
        `;
        
        if (functions.length > 0) {
            functions.forEach(func => {
                const type = func.prokind === 'f' ? 'FUNCTION' : 'PROCEDURE';
                console.log(`   ✅ ${func.function_name} (${type})`);
            });
        } else {
            console.log('   ⚠️  No custom functions found');
        }
        
        // Check materialized views
        console.log('\n📊 Materialized Views:');
        const mvs = await prisma.$queryRaw`
            SELECT schemaname, matviewname, ispopulated 
            FROM pg_matviews 
            WHERE schemaname = 'public'
            ORDER BY matviewname
        `;
        
        if (mvs.length > 0) {
            mvs.forEach(mv => {
                const status = mv.ispopulated ? '✅ Populated' : '❌ Not Populated';
                console.log(`   ${mv.matviewname}: ${status}`);
            });
        } else {
            console.log('   ⚠️  No materialized views found');
        }
        
        // Check indexes
        console.log('\n🏗️  Key Indexes:');
        const indexes = await prisma.$queryRaw`
            SELECT schemaname, tablename, indexname, indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname LIKE 'idx_%'
            ORDER BY tablename, indexname
            LIMIT 10
        `;
        
        if (indexes.length > 0) {
            indexes.forEach(idx => {
                console.log(`   ✅ ${idx.tablename}.${idx.indexname}`);
            });
        } else {
            console.log('   ⚠️  No custom indexes found');
        }
        
        // Database health
        console.log('\n💊 Database Health:');
        const health = await prisma.$queryRaw`
            SELECT schemaname, tablename, 
                   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                   pg_stat_get_live_tuples(c.oid) as live_tuples
            FROM pg_tables pt
            JOIN pg_class c ON c.relname = pt.tablename
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 8
        `;
        
        health.forEach(table => {
            console.log(`   📦 ${table.tablename}: ${table.size} (${table.live_tuples} rows)`);
        });
        
        // Test basic optimization queries
        console.log('\n⚡ Performance Test:');
        
        try {
            const start = Date.now();
            const companies = await prisma.$queryRaw`
                SELECT cp.id, cp."companyName", cp.industry 
                FROM company_profiles cp 
                WHERE cp."companyName" ILIKE '%tech%'
                LIMIT 5
            `;
            const time = Date.now() - start;
            console.log(`   ✅ Company search: ${time}ms (${companies.length} results)`);
        } catch (error) {
            console.log(`   ❌ Company search failed: ${error.message}`);
        }
        
        try {
            const start = Date.now();
            const jobs = await prisma.$queryRaw`
                SELECT j.id, j.title, j."isActive"
                FROM jobs j 
                WHERE j."isActive" = true
                LIMIT 5
            `;
            const time = Date.now() - start;
            console.log(`   ✅ Active jobs query: ${time}ms (${jobs.length} results)`);
        } catch (error) {
            console.log(`   ❌ Active jobs query failed: ${error.message}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎯 DATABASE OPTIMIZATION STATUS:');
        console.log(`   📋 Triggers: ${triggers.length} active`);
        console.log(`   🔧 Functions: ${functions.length} installed`);
        console.log(`   📊 Materialized Views: ${mvs.length} created`);
        console.log(`   🏗️  Indexes: ${indexes.length}+ performance indexes`);
        console.log(`   💊 Health: ${health.length} tables monitored`);
        
        // Assessment
        const score = Math.min(100, 
            (triggers.length * 10) + 
            (functions.length * 5) + 
            (mvs.length * 15) + 
            (indexes.length * 2)
        );
        
        let grade, status;
        if (score >= 80) {
            grade = 'A+';
            status = '🎉 EXCELLENT';
        } else if (score >= 60) {
            grade = 'B+';
            status = '✅ GOOD';
        } else if (score >= 40) {
            grade = 'C';
            status = '⚠️  FAIR';
        } else {
            grade = 'D';
            status = '❌ NEEDS WORK';
        }
        
        console.log(`   🏆 Overall Score: ${score}/100 (${grade})`);
        console.log(`   📊 Status: ${status}`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Database status check failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    checkDatabaseStatus();
}

module.exports = checkDatabaseStatus; 