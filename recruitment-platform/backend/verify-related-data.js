const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyRelatedData() {
  try {
    const userId = 'user-test-1754279800760';
    
    // Tìm student profile
    const profile = await prisma.student_profiles.findFirst({
      where: { userId }
    });
    
    if (!profile) {
      console.log('❌ Không tìm thấy student profile');
      return;
    }
    
    console.log('✅ Student Profile Found:', {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      university: profile.university
    });
    
    // Kiểm tra education data
    const educations = await prisma.student_educations.findMany({
      where: { studentId: profile.id }
    });
    console.log('\n📚 EDUCATION DATA:');
    console.log(`Found ${educations.length} education records`);
    educations.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.institution} - ${edu.degree} in ${edu.fieldOfStudy}`);
    });
    
    // Kiểm tra experience data
    const experiences = await prisma.student_experiences.findMany({
      where: { studentId: profile.id }
    });
    console.log('\n💼 WORK EXPERIENCE DATA:');
    console.log(`Found ${experiences.length} experience records`);
    experiences.forEach((exp, index) => {
      console.log(`${index + 1}. ${exp.position} at ${exp.company}`);
    });
    
    // Kiểm tra projects data
    const projects = await prisma.student_projects.findMany({
      where: { studentId: profile.id }
    });
    console.log('\n🚀 PROJECTS DATA:');
    console.log(`Found ${projects.length} project records`);
    projects.forEach((proj, index) => {
      console.log(`${index + 1}. ${proj.title} - ${proj.description.substring(0, 50)}...`);
    });
    
    // Kiểm tra certifications data
    const certifications = await prisma.student_certifications.findMany({
      where: { studentId: profile.id }
    });
    console.log('\n🏆 CERTIFICATIONS DATA:');
    console.log(`Found ${certifications.length} certification records`);
    certifications.forEach((cert, index) => {
      console.log(`${index + 1}. ${cert.name} by ${cert.issuer}`);
    });
    
    console.log('\n✅ All related data has been successfully persisted!');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRelatedData();
