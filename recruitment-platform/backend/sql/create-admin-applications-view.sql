-- View tối ưu cho applications với student profiles
CREATE OR REPLACE VIEW admin_applications_view AS
SELECT 
    a.id,
    a.jobId,
    a.studentId,
    a.coverLetter,
    a.status,
    a.appliedAt,
    a.createdAt,
    a.updatedAt,
    
    -- Job information
    j.title as job_title,
    j.location as job_location,
    
    -- Student user information  
    u.email as student_email,
    
    -- Student profile information
    sp.firstName,
    sp.lastName,
    sp.phone,
    sp.avatar,
    sp.university,
    sp.major,
    sp.graduationYear,
    sp.skills,
    sp.experience,
    sp.portfolio,
    sp.github,
    sp.linkedin,
    
    -- Company information
    cp.companyName,
    cp.id as companyId
    
FROM applications a
LEFT JOIN jobs j ON a.jobId = j.id
LEFT JOIN users u ON a.studentId = u.id
LEFT JOIN student_profiles sp ON u.id = sp.userId
LEFT JOIN company_profiles cp ON j.companyId = cp.id
ORDER BY a.createdAt DESC;
