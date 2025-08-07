const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { 
        role: 'ADMIN',
        email: 'admin@recruitment.com'
      }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);

    // Create admin user
    const adminUser = await prisma.users.create({
      data: {
        id: uuidv4(),
        email: 'admin@recruitment.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        updatedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@recruitment.com');
    console.log('🔑 Password: Admin123!@#');
    console.log('🆔 User ID:', adminUser.id);
    console.log('👤 Role:', adminUser.role);

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Admin creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin creation failed:', error);
    process.exit(1);
  });
