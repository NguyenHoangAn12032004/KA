const { PrismaClient } = require('@prisma/client');

async function checkSchemaTypes() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 CHECKING CURRENT SCHEMA DATA TYPES\n');
        
        // Check key table ID types
        const tables = ['jobs', 'student_profiles', 'users', 'company_profiles'];
        
        for (const tableName of tables) {
            console.log(`📋 ${tableName} table:`);
            
            const columns = await prisma.$queryRaw`
                SELECT column_name, data_type, udt_name
                FROM information_schema.columns 
                WHERE table_name = ${tableName}
                AND column_name IN ('id', 'userId', 'jobId', 'studentId', 'companyId')
                ORDER BY column_name
            `;
            
            columns.forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type} (${col.udt_name})`);
            });
            console.log('');
        }
        
        // Check if UUID extension is enabled
        const uuidExt = await prisma.$queryRaw`
            SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') as has_uuid_ext
        `;
        
        console.log(`🔧 UUID Extension: ${uuidExt[0].has_uuid_ext ? '✅ Enabled' : '❌ Not Enabled'}`);
        
        // Check sample data types from actual records
        console.log('\n📊 Sample Record ID Types:');
        
        try {
            const jobSample = await prisma.$queryRaw`SELECT id, typeof(id) FROM jobs LIMIT 1`;
            console.log(`   Jobs ID sample:`, typeof jobSample[0]?.id, jobSample[0]?.id);
        } catch (error) {
            console.log('   ⚠️  Could not get job sample');
        }
        
        try {
            const userSample = await prisma.$queryRaw`SELECT id FROM users LIMIT 1`;
            console.log(`   Users ID sample:`, typeof userSample[0]?.id, userSample[0]?.id);
        } catch (error) {
            console.log('   ⚠️  Could not get user sample');
        }
        
        console.log('\n🎯 RECOMMENDED FIXES:');
        
        // Check if we need to fix foreign key compatibility
        const needsFix = columns.some(col => col.udt_name === 'text' && col.column_name === 'id');
        
        if (needsFix) {
            console.log('❌ ISSUE: ID columns are TEXT instead of UUID');
            console.log('   Fix: Use TEXT type for foreign keys instead of UUID in junction tables');
        } else {
            console.log('✅ Schema types look compatible');
        }
        
    } catch (error) {
        console.error('❌ Schema check failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    checkSchemaTypes();
}

module.exports = checkSchemaTypes; 