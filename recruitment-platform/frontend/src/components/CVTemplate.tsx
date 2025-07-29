import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  Stack,
  LinearProgress,
  useTheme,
  alpha,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  GitHub,
  LinkedIn,
  Language,
  School,
  Work,
  Star,
  CalendarToday,
  PictureAsPdf,
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useThemeSettings } from '../contexts/ThemeContext';
import './CVTemplate.css'; // Import custom CSS for accessibility
import { ensureTextContrast, adjustBrightness } from '../utils/accessibilityUtils';

interface CVTemplateProps {
  profile: any;
}

const CVTemplate: React.FC<CVTemplateProps> = ({ profile }) => {
  const theme = useTheme();
  const { darkMode, highContrast } = useThemeSettings();
  const cvRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);

  if (!profile) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Không có dữ liệu hồ sơ</Typography>
      </Box>
    );
  }

  // Hàm xuất CV sang PDF
  const exportToPDF = async () => {
    if (!cvRef.current) return;
    
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`CV_${profile.firstName}_${profile.lastName}.pdf`);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
      alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại sau.');
    } finally {
      setDownloading(false);
    }
  };

  // Phân loại kỹ năng
  const frontEndSkills = (profile.skills || []).filter((s: string) => /react|typescript|js|html|css|ajax|bootstrap/i.test(s));
  const backEndSkills = (profile.skills || []).filter((s: string) => /php|mysql|node|express|api|java|python|c\+\+|c#/i.test(s));
  const uiuxSkills = (profile.skills || []).filter((s: string) => /figma|sketch|adobe|xd|photoshop|illustrator|balsamiq|canva/i.test(s));
  const otherSkills = (profile.skills || []).filter((s: string) => 
    !(/react|typescript|js|html|css|ajax|bootstrap|php|mysql|node|express|api|figma|sketch|adobe|xd|photoshop|illustrator|balsamiq|canva|java|python|c\+\+|c#/i.test(s))
  );

  // Get background and text colors with proper contrast
  const bgColor = darkMode ? '#1E1E1E' : '#fff';
  const textColor = ensureTextContrast(darkMode ? '#FFFFFF' : '#333333', bgColor);
  const secondaryTextColor = ensureTextContrast(
    darkMode ? '#AAAAAA' : '#757575',
    bgColor,
    3.5 // Slightly lower contrast requirement for secondary text
  );

  // Hàm hiển thị skill với rating
  const renderSkillWithRating = (skill: string, rating: number = 4) => {
    // Ensure progress bar colors have proper contrast
    const progressBgColor = highContrast 
      ? (darkMode ? '#555555' : '#DDDDDD') 
      : alpha(theme.palette.primary.main, 0.1);
    
    const progressBarColor = highContrast 
      ? (darkMode ? '#FFFFFF' : '#000000') 
      : theme.palette.primary.main;
    
    // Ensure star colors have proper contrast
    const filledStarColor = highContrast 
      ? (darkMode ? '#FFFFFF' : '#000000') 
      : theme.palette.primary.main;
    
    const emptyStarColor = ensureTextContrast(
      alpha(theme.palette.text.disabled, 0.3),
      bgColor,
      2 // Lower contrast for empty stars as they're decorative
    );

    return (
      <Box key={skill} sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" fontWeight={500}>{skill}</Typography>
          <Box sx={{ display: 'flex' }}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                sx={{ 
                  fontSize: 16, 
                  color: i < rating ? filledStarColor : emptyStarColor,
                  mr: 0.2
                }} 
              />
            ))}
          </Box>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={rating * 20} 
          sx={{ 
            height: 6, // Increased height for better visibility
            borderRadius: 2,
            bgcolor: progressBgColor,
            '& .MuiLinearProgress-bar': {
              bgcolor: progressBarColor
            }
          }} 
        />
      </Box>
    );
  };

  // Determine header background color based on theme settings
  const headerBgColor = highContrast
    ? (darkMode ? '#333333' : '#EEEEEE')
    : theme.palette.primary.main;

  // Determine header text color based on theme settings and ensure contrast
  const headerTextColor = ensureTextContrast(
    highContrast ? (darkMode ? '#FFFFFF' : '#000000') : 'white',
    headerBgColor
  );

  // Determine section header border color with proper contrast
  const sectionBorderColor = highContrast 
    ? (darkMode ? '#FFFFFF' : '#000000') 
    : theme.palette.primary.main;

  // Determine icon color with proper contrast
  const iconColor = highContrast 
    ? (darkMode ? '#FFFFFF' : '#000000') 
    : theme.palette.primary.main;

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}>
        <Tooltip title="Tải xuống CV dưới dạng PDF">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdf />}
            onClick={exportToPDF}
            disabled={downloading}
            className="CVTemplate-downloadBtn"
            sx={{ borderRadius: '0 8px 0 8px' }}
          >
            {downloading ? 'Đang tạo PDF...' : 'Tải xuống PDF'}
          </Button>
        </Tooltip>
      </Box>
      
      <Paper 
        ref={cvRef}
        elevation={3}
        className="CVTemplate-paper"
        sx={{ 
          maxWidth: 1000, 
          mx: 'auto', 
          mt: 4, 
          mb: 8,
          bgcolor: bgColor,
          color: textColor,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          overflow: 'hidden',
          position: 'relative',
          border: highContrast ? `2px solid ${darkMode ? '#FFFFFF' : '#000000'}` : 'none'
        }}
      >
      {/* Header */}
      <Box 
        sx={{ 
          p: 4,
          pb: 6,
          bgcolor: headerBgColor,
          color: headerTextColor,
          position: 'relative',
          borderRadius: highContrast ? 0 : '8px 8px 50% 50% / 8px 8px 15% 15%',
          boxShadow: highContrast ? 'none' : `0 4px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: highContrast 
              ? 'transparent' 
              : `linear-gradient(to bottom, transparent, ${alpha(theme.palette.primary.dark, 0.3)})`,
            zIndex: 1
          }
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <Avatar
              src={profile.avatar}
              alt={`${profile.firstName} ${profile.lastName}`}
              sx={{
                width: 150,
                height: 150,
                border: highContrast 
                  ? `4px solid ${darkMode ? '#FFFFFF' : '#000000'}` 
                  : '4px solid white',
                boxShadow: highContrast ? 'none' : '0 4px 10px rgba(0,0,0,0.2)',
                mx: { xs: 'auto', md: 0 }
              }}
            >
              {profile.firstName?.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={9}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: headerTextColor }}>
              {profile.firstName} {profile.lastName}
            </Typography>
            <Typography variant="h5" fontWeight={500} sx={{ mb: 2, opacity: highContrast ? 1 : 0.9, color: headerTextColor }}>
              {profile.title || profile.major || 'Frontend Developer'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, maxWidth: 600, color: headerTextColor }}>
              {profile.summary || 'Passionate frontend developer with experience in creating responsive, user-friendly web applications using modern JavaScript frameworks and libraries.'}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {profile.email && (
                <Chip 
                  icon={<Email sx={{ color: highContrast ? headerTextColor : undefined }} />} 
                  label={profile.email} 
                  sx={{ 
                    bgcolor: highContrast ? 'transparent' : 'rgba(255,255,255,0.2)', 
                    color: headerTextColor,
                    mb: 1,
                    border: highContrast ? `1px solid ${headerTextColor}` : 'none'
                  }} 
                />
              )}
              {profile.phone && (
                <Chip 
                  icon={<Phone sx={{ color: highContrast ? headerTextColor : undefined }} />} 
                  label={profile.phone} 
                  sx={{ 
                    bgcolor: highContrast ? 'transparent' : 'rgba(255,255,255,0.2)', 
                    color: headerTextColor,
                    mb: 1,
                    border: highContrast ? `1px solid ${headerTextColor}` : 'none'
                  }} 
                />
              )}
              {profile.location && (
                <Chip 
                  icon={<LocationOn sx={{ color: highContrast ? headerTextColor : undefined }} />} 
                  label={profile.location} 
                  sx={{ 
                    bgcolor: highContrast ? 'transparent' : 'rgba(255,255,255,0.2)', 
                    color: headerTextColor,
                    mb: 1,
                    border: highContrast ? `1px solid ${headerTextColor}` : 'none'
                  }} 
                />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Body */}
      <Grid container spacing={4} sx={{ p: 4 }}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={4}>
            {/* Contact */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: `2px solid ${sectionBorderColor}`
              }}>
                Contact
              </Typography>
              <Stack spacing={2}>
                {profile.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2">{profile.email}</Typography>
                  </Box>
                )}
                {profile.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2">{profile.phone}</Typography>
                  </Box>
                )}
                {profile.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2">{profile.location}</Typography>
                  </Box>
                )}
                {profile.github && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GitHub sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2" component="a" href={profile.github} target="_blank" sx={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      ...(highContrast && { 
                        textDecoration: 'underline',
                        fontWeight: 500
                      })
                    }}>
                      {profile.github.replace('https://github.com/', '')}
                    </Typography>
                  </Box>
                )}
                {profile.linkedin && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinkedIn sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2" component="a" href={profile.linkedin} target="_blank" sx={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      ...(highContrast && { 
                        textDecoration: 'underline',
                        fontWeight: 500
                      })
                    }}>
                      {profile.linkedin.replace('https://www.linkedin.com/in/', '')}
                    </Typography>
                  </Box>
                )}
                {profile.portfolio && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Language sx={{ mr: 1, color: iconColor }} />
                    <Typography variant="body2" component="a" href={profile.portfolio} target="_blank" sx={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      ...(highContrast && { 
                        textDecoration: 'underline',
                        fontWeight: 500
                      })
                    }}>
                      Portfolio
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Skills */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: `2px solid ${sectionBorderColor}`
              }}>
                Technical Skills
              </Typography>
              
              {frontEndSkills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Frontend</Typography>
                  {frontEndSkills.map((skill: string) => renderSkillWithRating(skill))}
                </Box>
              )}
              
              {backEndSkills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Backend</Typography>
                  {backEndSkills.map((skill: string) => renderSkillWithRating(skill))}
                </Box>
              )}
              
              {uiuxSkills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>UI/UX Design</Typography>
                  {uiuxSkills.map((skill: string) => renderSkillWithRating(skill))}
                </Box>
              )}
              
              {otherSkills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Other Skills</Typography>
                  {otherSkills.map((skill: string) => renderSkillWithRating(skill, 3))}
                </Box>
              )}
            </Box>

            {/* Education */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: `2px solid ${sectionBorderColor}`
              }}>
                Education
              </Typography>
              <Stack spacing={2}>
                {(profile.education || []).map((edu: any, idx: number) => (
                  <Box key={idx}>
                    <Typography variant="subtitle1" fontWeight={600}>{edu.institution}</Typography>
                    <Typography variant="body2" color={darkMode && !highContrast ? secondaryTextColor : undefined}>
                      {edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <CalendarToday sx={{ 
                        fontSize: 14, 
                        mr: 0.5, 
                        color: secondaryTextColor
                      }} />
                      <Typography variant="caption" color={secondaryTextColor}>
                        {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {(!profile.education || profile.education.length === 0) && (
                  <Typography variant="body2" color={secondaryTextColor}>
                    No education information available
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ 
                  mb: 2, 
                  pb: 1, 
                  borderBottom: `2px solid ${sectionBorderColor}`
                }}>
                  Languages
                </Typography>
                <Stack spacing={1.5}>
                  {profile.languages.map((lang: any, idx: number) => (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>{lang.name}</Typography>
                        <Typography variant="caption">{lang.level}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={
                          lang.level === 'Native' ? 100 :
                          lang.level === 'Fluent' ? 90 :
                          lang.level === 'Advanced' ? 80 :
                          lang.level === 'Intermediate' ? 60 :
                          lang.level === 'Basic' ? 40 : 60
                        } 
                        sx={{ 
                          height: 6,
                          borderRadius: 2,
                          bgcolor: highContrast 
                            ? (darkMode ? '#555555' : '#DDDDDD') 
                            : alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: highContrast 
                              ? (darkMode ? '#FFFFFF' : '#000000') 
                              : theme.palette.primary.main
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Stack spacing={4}>
            {/* Work Experience */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: `2px solid ${sectionBorderColor}`
              }}>
                Work Experience
              </Typography>
              
              <Stack spacing={3}>
                {(profile.workExperiences || []).map((exp: any, idx: number) => (
                  <Box key={idx} sx={{ position: 'relative', pl: { xs: 0, sm: 3 } }}>
                    <Box 
                      sx={{ 
                        display: { xs: 'none', sm: 'block' },
                        position: 'absolute', 
                        left: -8, 
                        top: 0, 
                        bottom: 0, 
                        width: highContrast ? 3 : 2, 
                        bgcolor: sectionBorderColor,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -4,
                          top: 8,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: sectionBorderColor,
                        }
                      }} 
                    />
                    
                    <Typography variant="subtitle1" fontWeight={600}>{exp.position}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>{exp.company}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ 
                        fontSize: 14, 
                        mr: 0.5, 
                        color: secondaryTextColor
                      }} />
                      <Typography variant="caption" color={secondaryTextColor}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {exp.description}
                    </Typography>
                    
                    {exp.achievements && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>Key Achievements:</Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {exp.achievements.split('\n').map((item: string, i: number) => (
                            <li key={i}><Typography variant="body2">{item}</Typography></li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Box>
                ))}
                
                {(!profile.workExperiences || profile.workExperiences.length === 0) && (
                  <Typography variant="body2" color={secondaryTextColor}>
                    No work experience information available
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Projects */}
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ 
                mb: 2, 
                pb: 1, 
                borderBottom: `2px solid ${sectionBorderColor}`
              }}>
                Projects
              </Typography>
              
              <Stack spacing={3}>
                {(profile.projects || []).map((proj: any, idx: number) => (
                  <Box key={idx}>
                    <Typography variant="subtitle1" fontWeight={600}>{proj.title}</Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ 
                        fontSize: 14, 
                        mr: 0.5, 
                        color: secondaryTextColor
                      }} />
                      <Typography variant="caption" color={secondaryTextColor}>
                        {proj.startDate ? new Date(proj.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {proj.endDate ? new Date(proj.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      {proj.description}
                    </Typography>
                    
                    {proj.technologies && proj.technologies.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>Technologies:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {proj.technologies.map((tech: string, i: number) => (
                            <Chip 
                              key={i} 
                              label={tech} 
                              size="small" 
                              color="primary" 
                              variant={highContrast ? "outlined" : "outlined"}
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5,
                                ...(highContrast && {
                                  color: textColor,
                                  borderColor: textColor,
                                  borderWidth: 1
                                })
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {proj.githubUrl && (
                        <Typography 
                          variant="body2" 
                          component="a" 
                          href={proj.githubUrl} 
                          target="_blank"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: iconColor,
                            textDecoration: highContrast ? 'underline' : 'none',
                            fontWeight: highContrast ? 500 : 400,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          <GitHub sx={{ fontSize: 16, mr: 0.5, color: iconColor }} /> Source Code
                        </Typography>
                      )}
                      
                      {proj.liveUrl && (
                        <Typography 
                          variant="body2" 
                          component="a" 
                          href={proj.liveUrl} 
                          target="_blank"
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: iconColor,
                            textDecoration: highContrast ? 'underline' : 'none',
                            fontWeight: highContrast ? 500 : 400,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          <Language sx={{ fontSize: 16, mr: 0.5, color: iconColor }} /> Live Demo
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                
                {(!profile.projects || profile.projects.length === 0) && (
                  <Typography variant="body2" color={secondaryTextColor}>
                    No projects information available
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ 
                  mb: 2, 
                  pb: 1, 
                  borderBottom: `2px solid ${sectionBorderColor}`
                }}>
                  Certifications
                </Typography>
                
                <Grid container spacing={2}>
                  {profile.certifications.map((cert: any, idx: number) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box sx={{ 
                        p: 2, 
                        border: highContrast 
                          ? `2px solid ${darkMode ? '#FFFFFF' : '#000000'}`
                          : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: highContrast ? 0 : 1,
                        height: '100%',
                        '&:hover': {
                          boxShadow: highContrast 
                            ? 'none' 
                            : `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderColor: highContrast 
                            ? (darkMode ? '#FFFFFF' : '#000000')
                            : theme.palette.primary.main
                        }
                      }}>
                        <Typography variant="subtitle2" fontWeight={600}>{cert.name}</Typography>
                        <Typography variant="body2" color={secondaryTextColor}>
                          {cert.issuer}
                        </Typography>
                        {cert.year && (
                          <Typography variant="caption" color={secondaryTextColor}>
                            Issued: {cert.year}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
    </Box>
  );
};

export default CVTemplate; 