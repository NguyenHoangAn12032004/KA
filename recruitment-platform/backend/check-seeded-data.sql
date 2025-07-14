SELECT 
    u.id as user_id,
    u.email,
    u.role,
    sp.firstName,
    sp.lastName,
    sp.university,
    sp.major,
    sp.skills,
    sp.gpa
FROM users u 
LEFT JOIN student_profiles sp ON u.id = sp.userId 
WHERE u.role = 'STUDENT'
ORDER BY u.createdAt DESC;
