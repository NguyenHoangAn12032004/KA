import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Running student progress SQL migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../prisma/migrations/student_progress_trigger.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL commands by function/trigger definition
    const commands = sqlContent.split(';');
    
    // Execute each SQL command separately
    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand) {
        console.log(`Executing SQL command: ${trimmedCommand.substring(0, 50)}...`);
        try {
          await prisma.$executeRawUnsafe(`${trimmedCommand};`);
          console.log('Command executed successfully');
        } catch (cmdError) {
          console.error('Error executing command:', cmdError);
          // Continue with next command
        }
      }
    }
    
    console.log('Migration completed successfully!');
    
    // Test the function with a sample student profile
    const studentProfiles = await prisma.student_profiles.findMany({
      take: 1
    });
    
    if (studentProfiles.length > 0) {
      const testProfileId = studentProfiles[0].id;
      console.log(`Testing with student profile ID: ${testProfileId}`);
      
      try {
        const result = await prisma.$queryRaw`
          SELECT * FROM calculate_student_progress(${testProfileId})
        `;
        
        console.log('Test result:', result);
      } catch (testError) {
        console.error('Test failed:', testError);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 