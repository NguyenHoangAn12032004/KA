import React, { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  useTheme,
  alpha,
  keyframes,
  Fade,
  Slide,
  Zoom,
  Badge,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Grid,
  CircularProgress,
  Checkbox,
  ListItemIcon,
  FormControlLabel,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from "@mui/lab";

import {
  Work,
  Assessment,
  Person,
  PhotoCamera,
  School,
  EmojiEvents,
  Verified,
  Save,
  Edit,
  Cancel,
  Email,
  Phone,
  LocationOn,
  GitHub,
  LinkedIn,
  Delete,
  Add,
  Visibility,
  WorkspacePremium,
  Star,
  TrendingUp,
  ZoomIn,
  CalendarToday,
  Grade,
  DesignServices,
  Code,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  Description,
  ViewModule,
  Sync,
  Language,
} from "@mui/icons-material";

import { useAuth } from "../contexts/AuthContext";
import { usersAPI } from "../services/api";
import { toast } from "react-toastify";
import { API_URL } from "../config";
import CVTemplate from "./CVTemplate";

const GridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

const GridItem = styled(Box)(({ theme }) => ({
  width: '100%',
}));

// Modern animations
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.4),
                0 0 40px rgba(102, 126, 234, 0.2),
                0 0 60px rgba(102, 126, 234, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.6),
                0 0 60px rgba(102, 126, 234, 0.3),
                0 0 90px rgba(102, 126, 234, 0.2);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const shimmerAnimation = keyframes`
  100% { transform: translateX(100%); }
`;

// Profile Completion Component
const ProfileCompletion: React.FC<{ completion: number }> = ({
  completion,
}) => {
  const theme = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  // Xác định trạng thái hoàn thiện
  const getCompletionStatus = () => {
    if (completion >= 90) return { 
      icon: '🌟', 
      text: 'Hồ sơ tuyệt vời!',
      color: theme.palette.success.main,
      description: 'Hồ sơ của bạn đã hoàn thiện và sẵn sàng để ứng tuyển.'
    };
    if (completion >= 70) return { 
      icon: '👍', 
      text: 'Hồ sơ hoàn thiện tốt',
      color: theme.palette.info.main,
      description: 'Hồ sơ của bạn đã khá đầy đủ, nhưng có thể bổ sung thêm chi tiết.'
    };
    if (completion >= 50) return { 
      icon: '📝', 
      text: 'Đang hoàn thiện',
      color: theme.palette.warning.main,
      description: 'Hồ sơ của bạn cần thêm thông tin để tăng khả năng được chú ý.'
    };
    return { 
      icon: '🔍', 
      text: 'Cần bổ sung thêm thông tin',
      color: theme.palette.error.main,
      description: 'Hồ sơ của bạn cần được bổ sung nhiều thông tin quan trọng.'
    };
  };

  const status = getCompletionStatus();

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.success.main, 0.1)} 0%, 
          ${alpha(theme.palette.info.main, 0.1)} 100%)`,
        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: `${floatingAnimation} 4s ease-in-out infinite`,
            }}
          >
            <Assessment sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Hoàn thiện hồ sơ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completion}% hoàn thành
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={() => setShowDetails(!showDetails)}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            {showDetails ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: 12,
            borderRadius: 6,
            background: alpha(theme.palette.success.main, 0.2),
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: `${completion}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.info.main})`,
              borderRadius: 6,
              transition: "width 1.5s ease-out",
              animation: `${shimmerAnimation} 2s ease-in-out infinite`,
              backgroundSize: "200% 100%",
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography
          variant="body2"
            sx={{ color: status.color, fontWeight: 600, display: 'flex', alignItems: 'center' }}
          >
            <span style={{ marginRight: '4px' }}>{status.icon}</span> {status.text}
        </Typography>
          
          {completion < 100 && (
            <Button 
              size="small" 
              startIcon={<Edit />}
              sx={{ ml: 'auto', fontSize: '0.75rem' }}
            >
              Cập nhật hồ sơ
            </Button>
          )}
        </Box>
        
        <Collapse in={showDetails}>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
            <Typography variant="body2" sx={{ mb: 1, color: status.color }}>
              {status.description}
            </Typography>
            
            <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
              Các mục cần hoàn thiện:
            </Typography>
            
            <List dense disablePadding>
              {completion < 100 && (
                <>
                  {completion < 50 && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircle fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Thông tin cá nhân cơ bản" 
                        secondary="Họ tên, email, số điện thoại"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  
                  {completion < 70 && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircle fontSize="small" color={completion >= 50 ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Thông tin học vấn" 
                        secondary="Trường học, bằng cấp, chuyên ngành"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  
                  {completion < 90 && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircle fontSize="small" color={completion >= 70 ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dự án và kỹ năng" 
                        secondary="Thêm dự án và liệt kê kỹ năng"
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )}
                  
                  <ListItem disablePadding sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircle fontSize="small" color={completion >= 90 ? "success" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Hoàn thiện chi tiết" 
                      secondary="Thêm mô tả, liên kết và avatar"
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                </>
              )}
              
              {completion === 100 && (
                <ListItem disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <Verified fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Hồ sơ hoàn thiện 100%" 
                    secondary="Tất cả thông tin đã được cập nhật đầy đủ"
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Skill Component
const SkillChip: React.FC<{
  skill: any;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ skill, onEdit, onDelete }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getSkillColor = (level: string) => {
    switch (level) {
      case "EXPERT":
        return theme.palette.error.main;
      case "ADVANCED":
        return theme.palette.warning.main;
      case "INTERMEDIATE":
        return theme.palette.info.main;
      case "BEGINNER":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Chip
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      label={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {skill.skillName}
          </Typography>
          <Badge
            badgeContent={skill.level}
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: getSkillColor(skill.level),
                color: "white",
                fontSize: "0.6rem",
                fontWeight: 700,
              },
            }}
          />
        </Box>
      }
      sx={{
        background: `linear-gradient(135deg, ${alpha(getSkillColor(skill.level), 0.1)}, ${alpha(getSkillColor(skill.level), 0.05)})`,
        border: `1px solid ${alpha(getSkillColor(skill.level), 0.3)}`,
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: `0 4px 12px ${alpha(getSkillColor(skill.level), 0.3)}`,
        },
      }}
      deleteIcon={isHovered && onDelete ? <Delete /> : undefined}
      onDelete={isHovered && onDelete ? onDelete : undefined}
    />
  );
};

// Experience Timeline Component
const ExperienceTimeline: React.FC<{ experiences: any[] }> = ({
  experiences,
}) => {
  const theme = useTheme();

  if (!experiences || experiences.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có kinh nghiệm nào được thêm
        </Typography>
      </Card>
    );
  }

  return (
    <Timeline position="alternate">
      {experiences.map((exp, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent sx={{ m: "auto 0", color: 'text.secondary' }}>
            {exp.startDate} - {exp.endDate || "Hiện tại"}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot sx={{ boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}` }}>
              <Work />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={{ py: "12px", px: 2 }}>
            <Card
              sx={{
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.9)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={700}>
                  {exp.position}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  fontWeight={600}
                >
                  {exp.company}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {exp.description}
                </Typography>
                {exp.skills && exp.skills.length > 0 && (
                  <Box
                    sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}
                  >
                    {exp.skills.map((skill: string, i: number) => (
                      <Chip
                        key={i}
                        label={skill}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [otherSkills, setOtherSkills] = useState<string[]>([]);
  const [newOtherSkill, setNewOtherSkill] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'cv'>('default');
  const [syncing, setSyncing] = useState(false);

  // Hàm lấy dữ liệu hồ sơ từ server
  const fetchProfileData = async () => {
    setSyncing(true);
    try {
      console.log('🔄 Đang đồng bộ dữ liệu hồ sơ từ server...');
      
      const response = await usersAPI.getProfile();
      
      if (!response.data) {
        console.error('❌ Không có dữ liệu trong phản hồi');
        toast.error('Không thể đồng bộ dữ liệu từ server');
        return;
      }
      
      const profileData = response.data;
      
      // Đảm bảo dữ liệu education được đồng bộ đúng cách
      if (profileData.educations && profileData.educations.length > 0) {
        profileData.education = profileData.educations.map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
          endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
          current: edu.current || false
        }));
      }
      
      // Đảm bảo dữ liệu dự án được đồng bộ đúng cách
      if (profileData.projects && profileData.projects.length > 0) {
        profileData.projects = profileData.projects.map((proj: any) => ({
          ...proj,
          technologies: proj.technologies || [],
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          description: proj.description || '',
          githubUrl: proj.githubUrl || '',
          liveUrl: proj.liveUrl || ''
        }));
      }
      
      // Đảm bảo dữ liệu chứng chỉ được đồng bộ đúng cách
      if (profileData.certifications && profileData.certifications.length > 0) {
        profileData.certifications = profileData.certifications.map((cert: any) => ({
          ...cert,
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || ''
        }));
      }
      
      // Đảm bảo dữ liệu kinh nghiệm làm việc được đồng bộ đúng cách
      // Chú ý: API trả về workExperience (không có 's') nhưng frontend sử dụng workExperiences
      if (profileData.workExperience && profileData.workExperience.length > 0) {
        console.log('💼 Đồng bộ dữ liệu kinh nghiệm làm việc từ API:', profileData.workExperience);
        profileData.workExperiences = profileData.workExperience.map((exp: any) => ({
          ...exp,
          company: exp.company || '',
          position: exp.position || '',
          description: exp.description || '',
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
          current: exp.current || false,
          achievements: exp.achievements || ''
        }));
        console.log('💼 Dữ liệu kinh nghiệm làm việc sau khi đồng bộ:', profileData.workExperiences);
      } else if (!profileData.workExperiences) {
        // Đảm bảo workExperiences luôn là một mảng
        profileData.workExperiences = [];
      }
      
      setProfile(profileData);
      setProfileData(profileData);
      
      // Extract other skills from profile data
      const frontEndSkills = (profileData.skills || []).filter((s: string) => /react|typescript|js|html|css|ajax|bootstrap/i.test(s));
      const backEndSkills = (profileData.skills || []).filter((s: string) => /php|mysql|node|express|api/i.test(s));
      const uiuxSkills = (profileData.skills || []).filter((s: string) => /figma|balsamiq|canva/i.test(s));
      
      // Other skills are those not in the above categories
      const others = (profileData.skills || []).filter((s: string) => 
        !(/react|typescript|js|html|css|ajax|bootstrap|php|mysql|node|express|api|figma|balsamiq|canva/i.test(s))
      );
      setOtherSkills(others);
      
      toast.success('Đồng bộ dữ liệu thành công!');
    } catch (err) {
      console.error('❌ Lỗi khi đồng bộ dữ liệu:', err);
      toast.error('Không thể đồng bộ dữ liệu từ server');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    console.log('🔄 StudentProfile: Fetching profile data...');
    console.log('🔑 Current token:', localStorage.getItem('token'));
    console.log('👤 Current user:', JSON.parse(localStorage.getItem('user') || '{}'));
    
    setLoading(true);
    
    // Kiểm tra trong localStorage trước
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('📊 Stored profile_completion in localStorage:', storedUser.profile_completion);
    } catch (err) {
      console.error('❌ Error reading localStorage:', err);
    }
    
    // Cập nhật đường dẫn API endpoint
    usersAPI.getProfile().then((response) => {
      console.log('📥 Profile response received:', response);
      
      if (!response.data) {
        console.error('❌ No data in profile response');
        setLoading(false);
        return;
      }
      
      const profileData = response.data;
      
      // Kiểm tra và đồng bộ giá trị profile_completion từ localStorage nếu cần
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.profile_completion && (!profileData.profile_completion || profileData.profile_completion < storedUser.profile_completion)) {
          console.log('📊 Using profile_completion from localStorage:', storedUser.profile_completion);
          profileData.profile_completion = storedUser.profile_completion;
        }
      } catch (err) {
        console.error('❌ Error syncing profile_completion from localStorage:', err);
      }
      
      console.log('📥 Processed profile data:', profileData);
      
      // Log avatar data for debugging
      if (profileData.avatar) {
        console.log('🖼️ Avatar data:', profileData.avatar.substring(0, 50) + '...');
      } else {
        console.log('⚠️ No avatar data found');
      }
      
      console.log('📊 Final processed profile data:', profileData);
      
      // Debug education data
      console.log('📚 Education data from API:', profileData.education);
      console.log('📚 Educations data from API:', profileData.educations);
      
      // Đảm bảo dữ liệu education được đồng bộ đúng cách
      if (profileData.educations && profileData.educations.length > 0) {
        console.log('📚 Using educations array from API');
        profileData.education = profileData.educations.map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
          endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
          current: edu.current || false
        }));
        console.log('📚 Synchronized education data:', profileData.education);
      }
      
      // Đảm bảo dữ liệu kinh nghiệm làm việc được đồng bộ đúng cách
      // Chú ý: API trả về workExperience (không có 's') nhưng frontend sử dụng workExperiences
      if (profileData.workExperience && profileData.workExperience.length > 0) {
        console.log('💼 Synchronizing work experiences from API');
        profileData.workExperiences = profileData.workExperience.map((exp: any) => ({
          ...exp,
          company: exp.company || '',
          position: exp.position || '',
          description: exp.description || '',
          startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
          endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
          current: exp.current || false,
          achievements: exp.achievements || ''
        }));
        console.log('💼 Synchronized work experience data:', profileData.workExperiences);
      } else if (!profileData.workExperiences) {
        // Đảm bảo workExperiences luôn là một mảng
        profileData.workExperiences = [];
      }
      
      // Đảm bảo dữ liệu chứng chỉ được đồng bộ đúng cách
      if (profileData.certifications && profileData.certifications.length > 0) {
        console.log('🏆 Synchronizing certifications from API');
        profileData.certifications = profileData.certifications.map((cert: any) => ({
          ...cert,
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || ''
        }));
        console.log('🏆 Synchronized certifications data:', profileData.certifications);
      } else if (!profileData.certifications) {
        // Đảm bảo certifications luôn là một mảng
        profileData.certifications = [];
      }
      
      // Đảm bảo dữ liệu dự án được đồng bộ đúng cách
      if (profileData.projects && profileData.projects.length > 0) {
        console.log('🚀 Synchronizing projects from API');
        profileData.projects = profileData.projects.map((proj: any) => ({
          ...proj,
          technologies: proj.technologies || [],
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          description: proj.description || '',
          githubUrl: proj.githubUrl || '',
          liveUrl: proj.liveUrl || ''
        }));
        console.log('🚀 Synchronized projects data:', profileData.projects);
      } else if (!profileData.projects) {
        // Đảm bảo projects luôn là một mảng
        profileData.projects = [];
      }
      
      setProfile(profileData);
      setProfileData(profileData);
      
      // Extract other skills from profile data
      const frontEndSkills = (profileData.skills || []).filter((s: string) => /react|typescript|js|html|css|ajax|bootstrap/i.test(s));
      const backEndSkills = (profileData.skills || []).filter((s: string) => /php|mysql|node|express|api/i.test(s));
      const uiuxSkills = (profileData.skills || []).filter((s: string) => /figma|balsamiq|canva/i.test(s));
      
      // Other skills are those not in the above categories
      const others = (profileData.skills || []).filter((s: string) => 
        !(/react|typescript|js|html|css|ajax|bootstrap|php|mysql|node|express|api|figma|balsamiq|canva/i.test(s))
      );
      setOtherSkills(others);
      
      setLoading(false);
    }).catch((err) => {
      console.error('❌ Error loading profile:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Tạo profile mặc định nếu không thể lấy dữ liệu
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const defaultProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: '',
        skills: [],
        education: [],
        projects: [],
        workExperiences: [],
        certifications: [],
        summary: ''
      };
      
      console.log('⚠️ Using default profile:', defaultProfile);
      setProfile(defaultProfile);
      setProfileData(defaultProfile);
      setOtherSkills([]);
      setLoading(false);
    });
  }, []);

  // Xử lý upload avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a local preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const dataUrl = event.target.result as string;
          setProfileData({ ...profileData, avatar: dataUrl });
          console.log('📷 Avatar preview created as data URL');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý thay đổi input
  const handleChange = (field: string, value: any) => {
    setProfileData({ ...profileData, [field]: value });
  };

  // Thêm/xóa kỹ năng
  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    setProfileData({ ...profileData, skills: [...(profileData.skills || []), skill] });
  };
  
  const handleRemoveSkill = (idx: number) => {
    setProfileData({ ...profileData, skills: profileData.skills.filter((_: any, i: number) => i !== idx) });
  };
  
  // Thêm/xóa other skills
  const handleAddOtherSkill = () => {
    if (!newOtherSkill.trim()) return;
    
    // Add to both other skills list and profile data skills
    setOtherSkills([...otherSkills, newOtherSkill]);
    setProfileData({ ...profileData, skills: [...(profileData.skills || []), newOtherSkill] });
    setNewOtherSkill('');
  };
  
  const handleRemoveOtherSkill = (idx: number) => {
    const skillToRemove = otherSkills[idx];
    
    // Remove from other skills list
    setOtherSkills(otherSkills.filter((_, i) => i !== idx));
    
    // Also remove from profile data skills
    setProfileData({ 
      ...profileData, 
      skills: profileData.skills.filter((skill: string) => skill !== skillToRemove) 
    });
  };

  // Thêm/xóa học vấn
  const handleAddEducation = () => {
    console.log('➕ Adding new education entry');
    const newEducation = [...(profileData.education || []), { 
      institution: '', 
      degree: '', 
      fieldOfStudy: '', 
      startDate: new Date().toISOString().split('T')[0], 
      endDate: '' 
    }];
    console.log('📚 Updated education array:', newEducation);
    setProfileData({ ...profileData, education: newEducation });
  };

  const handleRemoveEducation = (idx: number) => {
    console.log(`❌ Removing education at index ${idx}`);
    const newEducation = profileData.education.filter((_: any, i: number) => i !== idx);
    console.log('📚 Updated education array after removal:', newEducation);
    setProfileData({ ...profileData, education: newEducation });
  };

  // Thêm/xóa dự án
  const handleAddProject = () => {
    setProfileData({
      ...profileData,
      projects: [
        ...(profileData.projects || []),
        {
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          githubUrl: '',
          liveUrl: '',
          technologies: []
        }
      ]
    });
  };
  const handleRemoveProject = (idx: number) => {
    setProfileData({ ...profileData, projects: profileData.projects.filter((_: any, i: number) => i !== idx) });
  };
  
  // Thêm/xóa chứng chỉ
  const handleAddCertification = () => {
    setProfileData({
      ...profileData,
      certifications: [
        ...(profileData.certifications || []),
        {
          name: '',
          issuer: '',
          year: new Date().getFullYear()
        }
      ]
    });
  };
  const handleRemoveCertification = (idx: number) => {
    setProfileData({ 
      ...profileData, 
      certifications: profileData.certifications.filter((_: any, i: number) => i !== idx) 
    });
  };

  // Thêm/xóa kinh nghiệm làm việc
  const handleAddWorkExperience = () => {
    setProfileData({
      ...profileData,
      workExperiences: [
        ...(profileData.workExperiences || []),
        {
          company: '',
          position: '',
          description: '',
          startDate: '',
          endDate: '',
          current: false,
          achievements: ''
        }
      ]
    });
  };
  const handleRemoveWorkExperience = (idx: number) => {
    setProfileData({
      ...profileData,
      workExperiences: profileData.workExperiences.filter((_: any, i: number) => i !== idx)
    });
  };

  // Lưu hồ sơ
  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = profileData.avatar;
      
      // Upload avatar if a new one was selected
      if (avatarFile) {
        try {
          avatarUrl = await usersAPI.uploadAvatar(avatarFile);
          console.log('✅ Avatar uploaded successfully');
        } catch (error) {
          console.error('❌ Avatar upload failed:', error);
          toast.error('Không thể tải lên ảnh đại diện, vui lòng thử lại sau.');
          // Continue with the rest of the profile update even if avatar upload fails
        }
      }
      
      // Đảm bảo mọi project đều có technologies là mảng
      const safeProjects = (profileData.projects || []).map((p: any) => ({
        ...p,
        technologies: Array.isArray(p.technologies) ? p.technologies : []
      }));
      
      // Đảm bảo education data hợp lệ
      const safeEducation = (profileData.education || []).map((edu: any) => {
        console.log('🏫 Processing education item:', edu);
        return {
          ...edu,
          institution: edu.institution || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || new Date().toISOString().split('T')[0],
          endDate: edu.endDate || null
        };
      });
      console.log('🏫 Final education data:', safeEducation);
      
      // Đảm bảo workExperiences data hợp lệ
      const safeWorkExperiences = (profileData.workExperiences || []).map((exp: any) => {
        console.log('💼 Processing work experience item:', exp);
        return {
          ...exp,
          company: exp.company || '',
          position: exp.position || '',
          description: exp.description || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || null,
          current: exp.current || false,
          achievements: exp.achievements || '',
          skills: exp.skills || []
        };
      });
      console.log('💼 Final work experiences data:', safeWorkExperiences);
      
      // Đảm bảo certifications data hợp lệ
      const safeCertifications = (profileData.certifications || []).map((cert: any) => ({
        ...cert,
        name: cert.name || '',
        issuer: cert.issuer || '',
        year: cert.year || ''
      }));
      
      // Đảm bảo skills là mảng và bao gồm cả otherSkills
      const allSkills = Array.isArray(profileData.skills) ? [...profileData.skills] : [];
      
      // Log để debug
      console.log('🔍 Skills before saving:', allSkills);
      console.log('🔍 Other skills before saving:', otherSkills);
      console.log('📝 Summary before saving:', profileData.summary);
      
      // Tính toán mức độ hoàn thiện hồ sơ
      const profileCompletion = calculateProfileCompletion();
      console.log('📊 Saving profile completion value:', profileCompletion);
      
      // Lưu giá trị profile_completion vào localStorage ngay lập tức
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profile_completion = profileCompletion;
        localStorage.setItem('user', JSON.stringify(user));
        console.log('📊 Saved profile_completion to localStorage:', profileCompletion);
      } catch (err) {
        console.error('❌ Error saving to localStorage:', err);
      }
      
      // Chuẩn bị dữ liệu để gửi lên server
      const dataToSend = {
        ...profileData,
        avatar: avatarUrl, // Sử dụng base64 data URL trực tiếp
        projects: safeProjects,
        education: safeEducation,
        workExperiences: safeWorkExperiences,
        certifications: safeCertifications,
        skills: allSkills, // Đảm bảo skills được gửi đi
        summary: profileData.summary || '', // Đảm bảo summary được gửi đi
        profile_completion: profileCompletion // Lưu giá trị hoàn thiện hồ sơ
      };
      
      console.log('📤 Sending profile data:', dataToSend);
      console.log('🔑 Using token:', localStorage.getItem('token'));
      console.log('📊 Sending profile_completion in request:', dataToSend.profile_completion);
      console.log('💼 Sending work experiences in request:', dataToSend.workExperiences);
      
      // Kiểm tra xem API endpoint có đúng không
      console.log('🔗 API URL:', API_URL + '/api/users-enhanced/update-profile');
      
      const response = await usersAPI.updateProfile(dataToSend);
      
      console.log('📥 Profile update response:', response);
      
      // Update profile with the response data to get the updated profile_completion
      if (response.data && response.data.data) {
        const updatedProfile = response.data.data;
        
        // Ensure skills array exists
        if (!updatedProfile.skills) {
          updatedProfile.skills = [];
        }
        
        console.log('✅ Updated profile received:', updatedProfile);
        console.log('🔍 Skills after update:', updatedProfile.skills);
        console.log('📊 Profile completion after update:', updatedProfile.profile_completion || profileCompletion);
        console.log('💼 Work experiences after update:', updatedProfile.workExperience || []);
        
        // Đảm bảo giá trị profile_completion được cập nhật
        if (!updatedProfile.profile_completion) {
          updatedProfile.profile_completion = profileCompletion;
          console.log('⚠️ profile_completion missing in response, using calculated value:', profileCompletion);
        }
        
        // Chuyển đổi workExperience thành workExperiences nếu cần
        if (updatedProfile.workExperience && !updatedProfile.workExperiences) {
          updatedProfile.workExperiences = updatedProfile.workExperience;
          console.log('⚠️ Converting workExperience to workExperiences for frontend consistency');
        }
        
        // Lưu profile_completion vào localStorage để đảm bảo nhất quán
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.profile_completion = updatedProfile.profile_completion;
          localStorage.setItem('user', JSON.stringify(user));
          console.log('📊 Updated profile_completion in localStorage:', updatedProfile.profile_completion);
        } catch (err) {
          console.error('❌ Error updating localStorage:', err);
        }
        
        setProfile(updatedProfile);
        setProfileData(updatedProfile);
        
        // Extract other skills again
        const frontEndSkills = (updatedProfile.skills || []).filter((s: string) => /react|typescript|js|html|css|ajax|bootstrap/i.test(s));
        const backEndSkills = (updatedProfile.skills || []).filter((s: string) => /php|mysql|node|express|api/i.test(s));
        const uiuxSkills = (updatedProfile.skills || []).filter((s: string) => /figma|balsamiq|canva/i.test(s));
        
        // Other skills are those not in the above categories
        const others = (updatedProfile.skills || []).filter((s: string) => 
          !(/react|typescript|js|html|css|ajax|bootstrap|php|mysql|node|express|api|figma|balsamiq|canva/i.test(s))
        );
        setOtherSkills(others);
        console.log('🔍 Other skills after update:', others);
      } else {
        // If no data in response, update with our local data
        const updatedProfile = { 
          ...profileData, 
          avatar: avatarUrl, 
          projects: safeProjects,
          education: safeEducation,
          workExperiences: safeWorkExperiences,
          certifications: safeCertifications,
          skills: allSkills,
          profile_completion: profileCompletion // Đảm bảo giá trị profile_completion được cập nhật
        };
        setProfile(updatedProfile);
        
        // Extract other skills again
        const frontEndSkills = (allSkills || []).filter((s: string) => /react|typescript|js|html|css|ajax|bootstrap/i.test(s));
        const backEndSkills = (allSkills || []).filter((s: string) => /php|mysql|node|express|api/i.test(s));
        const uiuxSkills = (allSkills || []).filter((s: string) => /figma|balsamiq|canva/i.test(s));
        
        // Other skills are those not in the above categories
        const others = (allSkills || []).filter((s: string) => 
          !(/react|typescript|js|html|css|ajax|bootstrap|php|mysql|node|express|api|figma|balsamiq|canva/i.test(s))
        );
        setOtherSkills(others);
      }
      
      // Reset avatar file after successful upload
      setAvatarFile(null);
      
      setEditMode(false);
      toast.success('Cập nhật hồ sơ thành công!');
      
      // Đồng bộ lại dữ liệu từ server sau khi lưu
      await fetchProfileData();
    } catch (e: any) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      if (e.response && e.response.data && e.response.data.message) {
        toast.error('Lỗi: ' + e.response.data.message);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu!');
      }
      // Log chi tiết dữ liệu gửi đi để dev dễ debug
      console.error('Lỗi khi lưu hồ sơ:', e);
    } finally {
      setSaving(false);
    }
  };

  // Hàm test API
  const handleTestAPI = async () => {
    try {
      const testData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        skills: profileData.skills || [],
        test: 'This is a test'
      };
      
      console.log('🧪 Testing API with data:', testData);
      
      const response = await usersAPI.testProfileUpdate(testData);
      
      console.log('🧪 Test response:', response);
      
      toast.success('API test successful!');
    } catch (error) {
      console.error('❌ API test failed:', error);
      toast.error('API test failed!');
    }
  };

  // Tính toán mức độ hoàn thiện hồ sơ theo thời gian thực
  const calculateProfileCompletion = () => {
    // Các trường bắt buộc cơ bản (40%)
    const basicFields = [
      { name: 'firstName', weight: 5 },
      { name: 'lastName', weight: 5 },
      { name: 'email', weight: 5 },
      { name: 'phone', weight: 5 },
      { name: 'summary', weight: 10 },
      { name: 'avatar', weight: 10 },
    ];
    
    // Các phần thông tin bổ sung (60%)
    const additionalSections = [
      // Thông tin liên hệ (15%)
      { name: 'linkedin', weight: 5 },
      { name: 'github', weight: 5 },
      { name: 'portfolio', weight: 5 },
      
      // Kỹ năng (15%)
      { 
        name: 'skills', 
        weight: 10,
        check: () => (profileData.skills?.length > 0) 
      },
      { 
        name: 'otherSkills', 
        weight: 5,
        check: () => (profileData.otherSkills?.length > 0 || profileData.customSkills?.length > 0) 
      },
      
      // Học vấn (15%)
      { 
        name: 'education', 
        weight: 15,
        check: () => {
          const educations = profileData.education || profileData.educations || [];
          return educations.length > 0 && educations.some((edu: any) => 
            edu.institution && edu.degree && edu.fieldOfStudy && edu.startDate
          );
        }
      },
      
      // Dự án (15%)
      { 
        name: 'projects', 
        weight: 15,
        check: () => {
          const projects = profileData.projects || [];
          return projects.length > 0 && projects.some((proj: any) => 
            proj.title && proj.description && proj.startDate && 
            (proj.technologies?.length > 0 || proj.githubUrl || proj.liveUrl)
          );
        }
      },
      
      // Kinh nghiệm làm việc (10%)
      {
        name: 'workExperiences',
        weight: 10,
        check: () => {
          const workExperiences = profileData.workExperiences || [];
          return workExperiences.length > 0 && workExperiences.some((exp: any) =>
            exp.company && exp.position && exp.description && exp.startDate
          );
        }
      },
      
      // Chứng chỉ (5%)
      {
        name: 'certifications',
        weight: 5,
        check: () => {
          const certifications = profileData.certifications || [];
          return certifications.length > 0 && certifications.some((cert: any) =>
            cert.name && cert.issuer
          );
        }
      }
    ];
    
    // Tính điểm cho các trường cơ bản
    let basicScore = 0;
    for (const field of basicFields) {
      if (profileData[field.name]) {
        basicScore += field.weight;
      }
    }
    
    // Tính điểm cho các phần bổ sung
    let additionalScore = 0;
    for (const section of additionalSections) {
      if (section.check) {
        if (section.check()) {
          additionalScore += section.weight;
        }
      } else if (profileData[section.name]) {
        additionalScore += section.weight;
      }
    }
    
    // Tổng điểm tối đa
    const totalBasicWeight = basicFields.reduce((sum, field) => sum + field.weight, 0);
    const totalAdditionalWeight = additionalSections.reduce((sum, section) => sum + section.weight, 0);
    
    // Tính phần trăm hoàn thiện
    const totalScore = basicScore + additionalScore;
    const maxScore = totalBasicWeight + totalAdditionalWeight;
    
    console.log('📊 Profile completion calculation:', {
      basicScore,
      additionalScore,
      totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    });
    
    return Math.round((totalScore / maxScore) * 100);
  };

  // Tính toán mức độ hoàn thiện hồ sơ theo thời gian thực
  const realTimeCompletion = editMode ? calculateProfileCompletion() : (profile?.profile_completion || 0);

  // Lưu giá trị profile_completion vào localStorage khi thay đổi
  useEffect(() => {
    if (profile?.profile_completion) {
      try {
        // Lấy user từ localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Chỉ cập nhật nếu giá trị mới lớn hơn giá trị cũ
        if (!user.profile_completion || profile.profile_completion > user.profile_completion) {
          console.log('📊 Updating profile_completion in localStorage:', profile.profile_completion);
          user.profile_completion = profile.profile_completion;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        console.error('❌ Error updating localStorage:', err);
      }
    }
  }, [profile?.profile_completion]);

  // Khôi phục giá trị profile_completion từ localStorage khi reload trang
  useEffect(() => {
    try {
      if (!profile?.profile_completion) return;
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Nếu giá trị trong localStorage lớn hơn, sử dụng nó
      if (user.profile_completion && user.profile_completion > profile.profile_completion) {
        console.log('📊 Using profile_completion from localStorage:', user.profile_completion);
        setProfile({...profile, profile_completion: user.profile_completion});
      }
    } catch (err) {
      console.error('❌ Error restoring profile_completion from localStorage:', err);
    }
  }, [profile]);

  // Tạo profile mới nếu chưa có
  const createNewProfile = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newProfileData = {
        firstName: user.firstName || profileData.firstName || '',
        lastName: user.lastName || profileData.lastName || '',
        email: user.email || '',
        phone: profileData.phone || '',
        skills: profileData.skills || [],
        summary: profileData.summary || ''
      };
      
      console.log('🆕 Creating new profile:', newProfileData);
      
      const response = await usersAPI.updateProfile(newProfileData);
      
      if (response.data) {
        console.log('✅ Profile created successfully:', response.data);
        setProfile(response.data);
        setProfileData(response.data);
        toast.success('Hồ sơ đã được tạo thành công!');
      }
      
      setEditMode(false);
    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      toast.error('Lỗi khi tạo hồ sơ: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Render function
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f7fafd' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Hồ sơ sinh viên
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!editMode && (
            <>
              <Button
                variant="outlined"
                color="info"
                onClick={fetchProfileData}
                disabled={syncing}
                startIcon={<Sync />}
                sx={{ mr: 1 }}
              >
                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
              </Button>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="default" aria-label="default view">
                  <ViewModule sx={{ mr: 1 }} /> Mặc định
                </ToggleButton>
                <ToggleButton value="cv" aria-label="cv view">
                  <Description sx={{ mr: 1 }} /> CV Template
                </ToggleButton>
              </ToggleButtonGroup>
            </>
          )}
          
          {!editMode ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit />}
              onClick={() => setEditMode(true)}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={() => {
                  setEditMode(false);
                  setProfileData(profile);
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'cv' ? (
        <CVTemplate profile={profile} />
      ) : (
        // Original profile view
        <Box>
          {/* Profile Completion */}
          {profile && !editMode && (
            <ProfileCompletion completion={profile.profile_completion || 0} />
          )}
          
          {/* Main Content - Giữ nguyên nội dung hiện tại */}
          <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 3 }}>
            {/* Phần nội dung chính của hồ sơ */}
            <CardContent sx={{ p: 3 }}>
              {/* Thông tin cá nhân */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
                  {editMode ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Avatar
                        src={profileData.avatar}
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        sx={{
                          width: 150,
                          height: 150,
                          border: avatarError ? '2px solid red' : 'none',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        }}
                      >
                        {profileData.firstName?.charAt(0)}
                      </Avatar>
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="label"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'white',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                          '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                        }}
                      >
                        <input
                          hidden
                          accept="image/*"
                          type="file"
                          onChange={handleAvatarChange}
                        />
                        <PhotoCamera />
                      </IconButton>
                    </Box>
                  ) : (
                    <Avatar
                      src={profile.avatar}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      sx={{
                        width: 150,
                        height: 150,
                        mb: 2,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      }}
                    >
                      {profile.firstName?.charAt(0)}
                    </Avatar>
                  )}
                  
                  {!editMode && (
                    <>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {profile.firstName} {profile.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {profile.email}
                      </Typography>
                      
                      <Box sx={{ mt: 2, width: '100%' }}>
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Hoàn thiện hồ sơ
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={profile.profile_completion || 0}
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {profile.profile_completion || 0}% hoàn thiện
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  {editMode ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Họ"
                          value={profileData.firstName || ''}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Tên"
                          value={profileData.lastName || ''}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={profileData.email || ''}
                          disabled
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Số điện thoại"
                          value={profileData.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="GitHub"
                          value={profileData.github || ''}
                          onChange={(e) => handleChange('github', e.target.value)}
                          size="small"
                          placeholder="https://github.com/username"
                          InputProps={{
                            startAdornment: (
                              <GitHub fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="LinkedIn"
                          value={profileData.linkedin || ''}
                          onChange={(e) => handleChange('linkedin', e.target.value)}
                          size="small"
                          placeholder="https://linkedin.com/in/username"
                          InputProps={{
                            startAdornment: (
                              <LinkedIn fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Giới thiệu bản thân"
                          value={profileData.summary || ''}
                          onChange={(e) => handleChange('summary', e.target.value)}
                          multiline
                          rows={3}
                          placeholder="Viết một đoạn ngắn giới thiệu về bản thân..."
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Thông tin cá nhân
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.email || '-'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Số điện thoại
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.phone || '-'}
                          </Typography>
                        </Grid>
                        {profile.dateOfBirth && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Ngày sinh
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {new Date(profile.dateOfBirth).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        )}
                        {profile.location && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Địa chỉ
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {profile.location}
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Liên kết
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {profile.github && (
                              <Button 
                                startIcon={<GitHub />} 
                                size="small" 
                                variant="outlined"
                                href={profile.github}
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                              >
                                GitHub
                              </Button>
                            )}
                            {profile.linkedin && (
                              <Button 
                                startIcon={<LinkedIn />} 
                                size="small" 
                                variant="outlined"
                                color="info"
                                href={profile.linkedin}
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                              >
                                LinkedIn
                              </Button>
                            )}
                            {!profile.github && !profile.linkedin && (
                              <Typography variant="body1">-</Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {profile.summary && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Giới thiệu
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {profile.summary}
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              </Box>
              
              {/* Tabs để chuyển đổi giữa các phần thông tin */}
              {!editMode ? (
                <Box sx={{ mt: 4 }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Hồ sơ chi tiết
                    </Typography>
                  </Box>
                  
                  {/* Kỹ năng */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Kỹ năng</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profile.skills && profile.skills.length > 0) ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {profile.skills.map((skill: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={skill} 
                              variant="outlined" 
                              color="primary"
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">Chưa có thông tin kỹ năng</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Học vấn */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Học vấn</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profile.education && profile.education.length > 0) ? (
                        <Stack spacing={2}>
                          {profile.education.map((edu: any, idx: number) => (
                            <Box key={idx} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" fontWeight={600}>{edu.institution}</Typography>
                              <Typography variant="body2">
                                {edu.degree} {edu.fieldOfStudy ? `- ${edu.fieldOfStudy}` : ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Hiện tại'}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">Chưa có thông tin học vấn</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Dự án */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Dự án</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profile.projects && profile.projects.length > 0) ? (
                        <Stack spacing={3}>
                          {profile.projects.map((proj: any, idx: number) => (
                            <Box key={idx}>
                              <Typography variant="subtitle1" fontWeight={600}>{proj.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {proj.startDate ? new Date(proj.startDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric' }) : ''} 
                                {' - '} 
                                {proj.endDate ? new Date(proj.endDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric' }) : 'Hiện tại'}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>{proj.description}</Typography>
                              
                              {proj.technologies && proj.technologies.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                  {proj.technologies.map((tech: string, i: number) => (
                                    <Chip 
                                      key={i} 
                                      label={tech} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ mr: 0.5, mb: 0.5 }}
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                {proj.githubUrl && (
                                  <Button 
                                    size="small" 
                                    startIcon={<GitHub />} 
                                    href={proj.githubUrl} 
                                    target="_blank"
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Source Code
                                  </Button>
                                )}
                                
                                {proj.liveUrl && (
                                  <Button 
                                    size="small" 
                                    startIcon={<Language />} 
                                    href={proj.liveUrl} 
                                    target="_blank"
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Demo
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">Chưa có thông tin dự án</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Chứng chỉ */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkspacePremium sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Chứng chỉ</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profile.certifications && profile.certifications.length > 0) ? (
                        <Grid container spacing={2}>
                          {profile.certifications.map((cert: any, idx: number) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <Paper 
                                elevation={1} 
                                sx={{ 
                                  p: 2, 
                                  borderLeft: `3px solid ${theme.palette.primary.main}`,
                                  '&:hover': { boxShadow: 3 }
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight={600}>{cert.name}</Typography>
                                <Typography variant="body2">{cert.issuer}</Typography>
                                {cert.year && (
                                  <Typography variant="body2" color="text.secondary">
                                    Năm cấp: {cert.year}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography color="text.secondary">Chưa có thông tin chứng chỉ</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Kinh nghiệm làm việc */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Work sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Kinh nghiệm làm việc</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profile.workExperiences && profile.workExperiences.length > 0) ? (
                        <Timeline position="right" sx={{ p: 0, m: 0 }}>
                          {profile.workExperiences.map((exp: any, idx: number) => (
                            <TimelineItem key={idx}>
                              <TimelineOppositeContent sx={{ maxWidth: 150, minWidth: 150, py: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric' }) : ''} 
                                  {' - '} 
                                  {exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric' }) : 'Hiện tại'}
                                </Typography>
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot color="primary" />
                                {idx < profile.workExperiences.length - 1 && <TimelineConnector />}
                              </TimelineSeparator>
                              <TimelineContent sx={{ py: 1, px: 2 }}>
                                <Typography variant="subtitle1" fontWeight={600}>{exp.position}</Typography>
                                <Typography variant="body2" fontWeight={500}>{exp.company}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
                                
                                {exp.achievements && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>Thành tựu nổi bật:</Typography>
                                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                                      {exp.achievements.split('\n').map((item: string, i: number) => (
                                        <li key={i}><Typography variant="body2">{item}</Typography></li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      ) : (
                        <Typography color="text.secondary">Chưa có thông tin kinh nghiệm làm việc</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ) : (
                // Chế độ chỉnh sửa
                <Box sx={{ mt: 4 }}>
                  {/* Nội dung chỉnh sửa hiện tại */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="primary">
                      Chỉnh sửa hồ sơ chi tiết
                    </Typography>
                  </Box>
                  
                  {/* Chỉnh sửa Kỹ năng */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Kỹ năng</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Kỹ năng hiện tại</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {(profileData.skills && profileData.skills.length > 0) ? (
                            profileData.skills.map((skill: string, idx: number) => (
                              <Chip 
                                key={idx} 
                                label={skill} 
                                onDelete={() => handleRemoveSkill(idx)}
                                color="primary"
                                variant="outlined"
                                sx={{ m: 0.5 }}
                              />
                            ))
                          ) : (
                            <Typography color="text.secondary">Chưa có kỹ năng nào</Typography>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TextField
                          label="Thêm kỹ năng mới"
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1, flexGrow: 1 }}
                          value={newOtherSkill}
                          onChange={(e) => setNewOtherSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newOtherSkill.trim()) {
                              handleAddOtherSkill();
                              e.preventDefault();
                            }
                          }}
                          placeholder="Nhập kỹ năng và nhấn Enter hoặc nút Thêm"
                        />
                        <Button 
                          variant="contained" 
                          color="primary" 
                          onClick={handleAddOtherSkill}
                          disabled={!newOtherSkill.trim()}
                          startIcon={<Add />}
                        >
                          Thêm
                        </Button>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        Thêm các kỹ năng liên quan đến công việc như ngôn ngữ lập trình, công nghệ, công cụ...
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Chỉnh sửa Học vấn */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Học vấn</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profileData.education && profileData.education.length > 0) ? (
                        <Stack spacing={2}>
                          {profileData.education.map((edu: any, idx: number) => (
                            <Paper key={idx} sx={{ p: 2, position: 'relative', mb: 2 }}>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemoveEducation(idx)}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <Delete />
                              </IconButton>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Tên trường"
                                    value={edu.institution || ''}
                                    onChange={(e) => {
                                      const newEducation = [...profileData.education];
                                      newEducation[idx].institution = e.target.value;
                                      handleChange('education', newEducation);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Bằng cấp"
                                    value={edu.degree || ''}
                                    onChange={(e) => {
                                      const newEducation = [...profileData.education];
                                      newEducation[idx].degree = e.target.value;
                                      handleChange('education', newEducation);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Chuyên ngành"
                                    value={edu.fieldOfStudy || ''}
                                    onChange={(e) => {
                                      const newEducation = [...profileData.education];
                                      newEducation[idx].fieldOfStudy = e.target.value;
                                      handleChange('education', newEducation);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={edu.startDate || ''}
                                    onChange={(e) => {
                                      const newEducation = [...profileData.education];
                                      newEducation[idx].startDate = e.target.value;
                                      handleChange('education', newEducation);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày kết thúc"
                                    type="date"
                                    value={edu.endDate || ''}
                                    onChange={(e) => {
                                      const newEducation = [...profileData.education];
                                      newEducation[idx].endDate = e.target.value;
                                      handleChange('education', newEducation);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={edu.current}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={edu.current || false}
                                        onChange={(e) => {
                                          const newEducation = [...profileData.education];
                                          newEducation[idx].current = e.target.checked;
                                          if (e.target.checked) {
                                            newEducation[idx].endDate = '';
                                          }
                                          handleChange('education', newEducation);
                                        }}
                                      />
                                    }
                                    label="Đang học"
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>Chưa có thông tin học vấn</Typography>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<Add />} 
                        onClick={handleAddEducation}
                        sx={{ mt: 1 }}
                      >
                        Thêm học vấn
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Chỉnh sửa Dự án */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Code sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Dự án</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profileData.projects && profileData.projects.length > 0) ? (
                        <Stack spacing={3}>
                          {profileData.projects.map((proj: any, idx: number) => (
                            <Paper key={idx} sx={{ p: 2, position: 'relative', mb: 2 }}>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemoveProject(idx)}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <Delete />
                              </IconButton>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Tên dự án"
                                    value={proj.title || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].title = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Mô tả dự án"
                                    value={proj.description || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].description = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    multiline
                                    rows={3}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={proj.startDate || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].startDate = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày kết thúc"
                                    type="date"
                                    value={proj.endDate || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].endDate = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={proj.current}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={proj.current || false}
                                        onChange={(e) => {
                                          const newProjects = [...profileData.projects];
                                          newProjects[idx].current = e.target.checked;
                                          if (e.target.checked) {
                                            newProjects[idx].endDate = '';
                                          }
                                          handleChange('projects', newProjects);
                                        }}
                                      />
                                    }
                                    label="Đang thực hiện"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Link GitHub"
                                    value={proj.githubUrl || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].githubUrl = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                    placeholder="https://github.com/username/project"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Link Demo"
                                    value={proj.liveUrl || ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].liveUrl = e.target.value;
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                    placeholder="https://example.com"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Công nghệ sử dụng"
                                    value={proj.technologies ? proj.technologies.join(', ') : ''}
                                    onChange={(e) => {
                                      const newProjects = [...profileData.projects];
                                      newProjects[idx].technologies = e.target.value
                                        .split(',')
                                        .map((tech: string) => tech.trim())
                                        .filter((tech: string) => tech);
                                      handleChange('projects', newProjects);
                                    }}
                                    size="small"
                                    placeholder="React, Node.js, MongoDB,..."
                                    helperText="Nhập các công nghệ, phân cách bằng dấu phẩy"
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>Chưa có thông tin dự án</Typography>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<Add />} 
                        onClick={handleAddProject}
                        sx={{ mt: 1 }}
                      >
                        Thêm dự án
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Chỉnh sửa Chứng chỉ */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkspacePremium sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Chứng chỉ</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profileData.certifications && profileData.certifications.length > 0) ? (
                        <Grid container spacing={2}>
                          {profileData.certifications.map((cert: any, idx: number) => (
                            <Grid item xs={12} sm={6} key={idx}>
                              <Paper sx={{ p: 2, position: 'relative', borderLeft: `3px solid ${theme.palette.primary.main}` }}>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleRemoveCertification(idx)}
                                  sx={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                  <Delete />
                                </IconButton>
                                
                                <TextField
                                  fullWidth
                                  label="Tên chứng chỉ"
                                  value={cert.name || ''}
                                  onChange={(e) => {
                                    const newCertifications = [...profileData.certifications];
                                    newCertifications[idx].name = e.target.value;
                                    handleChange('certifications', newCertifications);
                                  }}
                                  size="small"
                                  sx={{ mb: 2 }}
                                />
                                
                                <TextField
                                  fullWidth
                                  label="Tổ chức cấp"
                                  value={cert.issuer || ''}
                                  onChange={(e) => {
                                    const newCertifications = [...profileData.certifications];
                                    newCertifications[idx].issuer = e.target.value;
                                    handleChange('certifications', newCertifications);
                                  }}
                                  size="small"
                                  sx={{ mb: 2 }}
                                />
                                
                                <TextField
                                  fullWidth
                                  label="Năm cấp"
                                  type="number"
                                  value={cert.year || ''}
                                  onChange={(e) => {
                                    const newCertifications = [...profileData.certifications];
                                    newCertifications[idx].year = e.target.value;
                                    handleChange('certifications', newCertifications);
                                  }}
                                  size="small"
                                  InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
                                />
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>Chưa có thông tin chứng chỉ</Typography>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        startIcon={<Add />} 
                        onClick={handleAddCertification}
                        sx={{ mt: 2 }}
                      >
                        Thêm chứng chỉ
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                  
                  {/* Chỉnh sửa Kinh nghiệm làm việc */}
                  <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary 
                      expandIcon={<ExpandMore />}
                      sx={{ px: 0, '& .MuiAccordionSummary-content': { alignItems: 'center' } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Work sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>Kinh nghiệm làm việc</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0 }}>
                      {(profileData.workExperiences && profileData.workExperiences.length > 0) ? (
                        <Stack spacing={3}>
                          {profileData.workExperiences.map((exp: any, idx: number) => (
                            <Paper key={idx} sx={{ p: 2, position: 'relative', mb: 2 }}>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRemoveWorkExperience(idx)}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <Delete />
                              </IconButton>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Vị trí công việc"
                                    value={exp.position || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].position = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Tên công ty"
                                    value={exp.company || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].company = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={exp.startDate || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].startDate = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Ngày kết thúc"
                                    type="date"
                                    value={exp.endDate || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].endDate = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={exp.current}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={exp.current || false}
                                        onChange={(e) => {
                                          const newWorkExperiences = [...profileData.workExperiences];
                                          newWorkExperiences[idx].current = e.target.checked;
                                          if (e.target.checked) {
                                            newWorkExperiences[idx].endDate = '';
                                          }
                                          handleChange('workExperiences', newWorkExperiences);
                                        }}
                                      />
                                    }
                                    label="Đang làm việc"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Mô tả công việc"
                                    value={exp.description || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].description = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    multiline
                                    rows={3}
                                    size="small"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Thành tựu nổi bật"
                                    value={exp.achievements || ''}
                                    onChange={(e) => {
                                      const newWorkExperiences = [...profileData.workExperiences];
                                      newWorkExperiences[idx].achievements = e.target.value;
                                      handleChange('workExperiences', newWorkExperiences);
                                    }}
                                    multiline
                                    rows={3}
                                    size="small"
                                    placeholder="Mỗi thành tựu một dòng"
                                    helperText="Nhập mỗi thành tựu trên một dòng riêng biệt"
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>Chưa có thông tin kinh nghiệm làm việc</Typography>
                      )}
                       
                      <Button 
                        variant="outlined" 
                        startIcon={<Add />} 
                        onClick={handleAddWorkExperience}
                        sx={{ mt: 1 }}
                      >
                        Thêm kinh nghiệm làm việc
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default StudentProfile;
