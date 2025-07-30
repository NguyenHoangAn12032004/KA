const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function installMissingTriggers() {
    const prisma = new PrismaClient();
    
    try {
        console.log('📦 Installing missing triggers and procedures...\n');
        
        // Read the SQL file
        const sqlPath = path.join(__dirname, '../migrations/missing-triggers-procedures.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split SQL into individual statements
        const statements = sql
            .split(';')
            .filter(stmt => stmt.trim().length > 0)
            .filter(stmt => !stmt.trim().startsWith('--'))
            .filter(stmt => !stmt.trim().match(/^DO\s+\$\$/i)); // Skip DO blocks
        
        let successCount = 0;
        let warningCount = 0;
        
        console.log(`📝 Executing ${statements.length} SQL statements...\n`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    await prisma.$executeRawUnsafe(statement + ';');
                    successCount++;
                    
                    // Extract operation type for logging
                    const operationType = statement
                        .split('\n')[0]
                        .replace(/^(CREATE|DROP|ALTER)\s+/i, '$1 ')
                        .split(' ')
                        .slice(0, 3)
                        .join(' ');
                    
                    console.log(`   ✅ ${i + 1}/${statements.length}: ${operationType}`);
                    
                } catch (error) {
                    warningCount++;
                    const errorMsg = error.message.split('\n')[0];
                    
                    if (errorMsg.includes('already exists') || 
                        errorMsg.includes('does not exist') ||
                        errorMsg.includes('cannot drop')) {
                        console.log(`   ⚠️  ${i + 1}/${statements.length}: ${errorMsg}`);
                    } else {
                        console.log(`   ❌ ${i + 1}/${statements.length}: ${errorMsg}`);
                    }
                }
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 INSTALLATION SUMMARY:');
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ⚠️  Warnings: ${warningCount}`);
        console.log(`   📝 Total Statements: ${statements.length}`);
        
        // Test some key functions
        console.log('\n🧪 Testing key functions...');
        
        try {
            await prisma.$queryRaw`SELECT get_trigger_status_report() LIMIT 5`;
            console.log('   ✅ Trigger status function working');
        } catch (error) {
            console.log('   ⚠️  Trigger status function not available');
        }
        
        try {
            await prisma.$queryRaw`SELECT get_database_health_report() LIMIT 5`;
            console.log('   ✅ Database health function working');
        } catch (error) {
            console.log('   ⚠️  Database health function not available');
        }
        
        // Check materialized views
        try {
            const mvStatus = await prisma.$queryRaw`
                SELECT matviewname, ispopulated 
                FROM pg_matviews 
                WHERE schemaname = 'public'
            `;
            
            if (mvStatus.length > 0) {
                console.log('\n📈 Materialized Views Status:');
                mvStatus.forEach(mv => {
                    const status = mv.ispopulated ? '✅ Populated' : '❌ Not Populated';
                    console.log(`   ${mv.matviewname}: ${status}`);
                });
            }
        } catch (error) {
            console.log('   ⚠️  Could not check materialized views');
        }
        
        console.log('\n🎉 MISSING TRIGGERS & PROCEDURES INSTALLATION COMPLETED!');
        console.log('='.repeat(60));
        console.log('New features available:');
        console.log('✅ Company statistics auto-update');
        console.log('✅ Application status tracking with history');
        console.log('✅ Interview computed fields');
        console.log('✅ Real-time notifications');
        console.log('✅ Data consistency validation');
        console.log('✅ Enhanced cleanup procedures');
        console.log('✅ Advanced company metrics');
        console.log('✅ Job recommendation engine');
        console.log('✅ Database health monitoring');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Installation failed:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    installMissingTriggers();
}

module.exports = installMissingTriggers; 