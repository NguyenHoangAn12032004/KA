import jsPDF from 'jspdf';
import { convertVietnameseNames } from './vietnameseConverter';
import { translateProfile, translateExperience, translateToEnglish } from './translator-clean';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  skills?: string[];
  portfolio?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  experience?: Experience[];
  education?: Education[];
  projects?: Project[];
  languages?: Language[];
  certifications?: Certification[];
}

interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  major?: string;
  gpa?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

interface Language {
  name: string;
  level: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export const generateProfessionalCV = (profile: ProfileData): void => {
  console.log('🔄 Generating Professional CV for:', profile);

  try {
    // Translate all Vietnamese data to English
    const translatedProfile = translateProfile(profile);
    console.log('🌐 Translated profile:', translatedProfile);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Professional color scheme
    const colors = {
      primary: [41, 98, 255],      // Blue
      secondary: [99, 102, 241],   // Indigo  
      accent: [16, 185, 129],      // Green
      dark: [17, 24, 39],          // Dark gray
      medium: [75, 85, 99],        // Medium gray
      light: [156, 163, 175],      // Light gray
      background: [248, 250, 252]  // Very light gray
    };
    
    let currentY = 0;
    
    // Helper functions
    const setColor = (color: number[], type: 'text' | 'fill' | 'draw' = 'text') => {
      if (type === 'text') {
        pdf.setTextColor(color[0], color[1], color[2]);
      } else if (type === 'fill') {
        pdf.setFillColor(color[0], color[1], color[2]);
      } else {
        pdf.setDrawColor(color[0], color[1], color[2]);
      }
    };
    
    const addRect = (x: number, y: number, w: number, h: number, fill = false) => {
      if (fill) {
        pdf.rect(x, y, w, h, 'F');
      } else {
        pdf.rect(x, y, w, h);
      }
    };
    
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        maxWidth = 0,
        align = 'left'
      } = options;
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      // Clean Vietnamese text for better compatibility
      const cleanText = text
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/[đ]/g, 'd')
        .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A')
        .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
        .replace(/[ÌÍỊỈĨ]/g, 'I')
        .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
        .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U')
        .replace(/[ỲÝỴỶỸ]/g, 'Y')
        .replace(/[Đ]/g, 'D');
      
      if (maxWidth > 0) {
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        lines.forEach((line: string, index: number) => {
          pdf.text(line, x, y + (index * (fontSize * 0.4)), { align });
        });
        return lines.length * (fontSize * 0.4);
      } else {
        pdf.text(cleanText, x, y, { align });
        return fontSize * 0.4;
      }
    };
    
    // =================== HEADER SECTION ===================
    // Background header
    setColor(colors.primary, 'fill');
    addRect(0, 0, pageWidth, 55, true);
    
    // Name - Convert Vietnamese to English
    setColor([255, 255, 255], 'text');
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    const convertedNames = convertVietnameseNames(
      translatedProfile.firstName || 'Professional', 
      translatedProfile.lastName || 'Candidate'
    );
    pdf.text(convertedNames.fullName, 20, 23);
    
    // Title/Position based on major (now in English)
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'normal');
    const jobTitle = translateToEnglish(translatedProfile.major || '') || 'Software Developer';
    pdf.text(jobTitle, 20, 38);
    
    currentY = 65;
    
    // =================== CONTACT INFO ===================
    setColor(colors.dark, 'text');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const contactItems = [
      { icon: 'Email:', text: translatedProfile.email || 'email@example.com' },
      { icon: 'Phone:', text: translatedProfile.phone || '+84 XXX XXX XXX' },
      { icon: 'Portfolio:', text: translatedProfile.portfolio || 'portfolio.com' },
      { icon: 'LinkedIn:', text: translatedProfile.linkedin || 'linkedin.com/in/profile' },
      { icon: 'GitHub:', text: translatedProfile.github || 'github.com/username' }
    ].filter(item => item.text && !item.text.includes('XXX'));
    
    // Layout contact info in 2 columns
    let contactY = currentY;
    contactItems.forEach((item, index) => {
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? 20 : 110;
      
      if (index > 0 && index % 2 === 0) {
        contactY += 6;
      }
      
      // Icon/Label
      setColor(colors.medium, 'text');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.icon, x, contactY);
      
      // Value
      setColor(colors.dark, 'text');
      pdf.setFont('helvetica', 'normal');
      const valueX = x + pdf.getTextWidth(item.icon) + 2;
      const maxWidth = isLeftColumn ? 85 - pdf.getTextWidth(item.icon) : 80 - pdf.getTextWidth(item.icon);
      addText(item.text, valueX, contactY, { maxWidth: maxWidth, fontSize: 9 });
    });
    
    currentY = contactY + 15;
    
    // =================== PROFESSIONAL SUMMARY ===================
    // Use experience field if summary is empty, and translate it
    const summaryText = translatedProfile.summary || translatedProfile.experience;
    if (summaryText) {
      // Section header with better styling
      setColor(colors.primary, 'fill');
      addRect(20, currentY - 3, 170, 6, true);
      
      setColor([255, 255, 255], 'text');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROFESSIONAL SUMMARY', 22, currentY + 1);
      currentY += 12;
      
      // Content with better spacing (now fully translated)
      setColor(colors.dark, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryHeight = addText(summaryText, 20, currentY, { maxWidth: 170 });
      currentY += summaryHeight + 12;
    }
    
    // =================== TECHNICAL SKILLS ===================
    if (translatedProfile.skills && translatedProfile.skills.length > 0) {
      // Section header with consistent styling
      setColor(colors.primary, 'fill');
      addRect(20, currentY - 3, 170, 6, true);
      
      setColor([255, 255, 255], 'text');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TECHNICAL SKILLS', 22, currentY + 1);
      currentY += 12;
      
      // Skills in organized format
      setColor(colors.dark, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Organize skills into categories if possible
      const skillCategories = [
        { 
          name: 'Design Tools', 
          skills: translatedProfile.skills?.filter((skill: string) => 
            skill.toLowerCase().includes('photoshop') || 
            skill.toLowerCase().includes('illustrator') ||
            skill.toLowerCase().includes('figma') ||
            skill.toLowerCase().includes('sketch')
          ) || []
        },
        { 
          name: 'Programming', 
          skills: translatedProfile.skills?.filter((skill: string) => 
            skill.toLowerCase().includes('javascript') ||
            skill.toLowerCase().includes('python') ||
            skill.toLowerCase().includes('java') ||
            skill.toLowerCase().includes('html') ||
            skill.toLowerCase().includes('css')
          ) || []
        },
        { 
          name: 'Other Skills', 
          skills: translatedProfile.skills?.filter((skill: string) => 
            !skill.toLowerCase().includes('photoshop') &&
            !skill.toLowerCase().includes('illustrator') &&
            !skill.toLowerCase().includes('figma') &&
            !skill.toLowerCase().includes('sketch') &&
            !skill.toLowerCase().includes('javascript') &&
            !skill.toLowerCase().includes('python') &&
            !skill.toLowerCase().includes('java') &&
            !skill.toLowerCase().includes('html') &&
            !skill.toLowerCase().includes('css')
          ) || []
        }
      ].filter(category => category.skills.length > 0);
      
      if (skillCategories.length > 0) {
        skillCategories.forEach(category => {
          setColor(colors.medium, 'text');
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${category.name}:`, 20, currentY);
          currentY += 5;
          
          setColor(colors.dark, 'text');
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const skillsText = category.skills.join(' • ');
          const skillsHeight = addText(skillsText, 25, currentY, { maxWidth: 165 });
          currentY += skillsHeight + 3;
        });
      } else {
        // Fallback to simple list
        const skillsText = (translatedProfile.skills || []).join(' • ');
        const skillsHeight = addText(skillsText, 20, currentY, { maxWidth: 170 });
        currentY += skillsHeight;
      }
      currentY += 10;
    }
    
    // =================== EDUCATION ===================
    // Section header with consistent styling
    setColor(colors.primary, 'fill');
    addRect(20, currentY - 3, 170, 6, true);
    
    setColor([255, 255, 255], 'text');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EDUCATION', 22, currentY + 1);
    currentY += 12;
    
    // Education content
    if (translatedProfile.education && translatedProfile.education.length > 0) {
      translatedProfile.education.forEach((edu: any) => {
        setColor(colors.dark, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const degree = edu.degree === 'Cử nhân' ? 'Bachelor of Science' : edu.degree;
        pdf.text(`${degree} in ${edu.major || 'Computer Science'}`, 20, currentY);
        currentY += 6;
        
        setColor(colors.medium, 'text');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(edu.institution, 20, currentY);
        
        // Date and GPA on the right
        const dateText = `${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || 'N/A'}`;
        pdf.text(dateText, 190, currentY, { align: 'right' });
        currentY += 5;
        
        if (edu.gpa) {
          setColor(colors.accent, 'text');
          pdf.setFontSize(9);
          pdf.text(`GPA: ${edu.gpa}/4.0`, 20, currentY);
          currentY += 8;
        } else {
          currentY += 3;
        }
      });
    } else if (translatedProfile.university) {
      // Fallback: create education from basic profile data (all translated)
      setColor(colors.dark, 'text');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(translatedProfile.major || 'Bachelor of Science', 20, currentY);
      currentY += 6;
      
      setColor(colors.medium, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(translatedProfile.university, 20, currentY);
      
      // Date and GPA on the right
      const graduationYear = translatedProfile.graduationYear || '2024';
      const startYear = parseInt(graduationYear) - 4;
      const dateText = `${startYear} - ${graduationYear}`;
      pdf.text(dateText, 190, currentY, { align: 'right' });
      currentY += 5;
      
      if (translatedProfile.gpa) {
        setColor(colors.accent, 'text');
        pdf.setFontSize(9);
        pdf.text(`GPA: ${translatedProfile.gpa}/4.0`, 20, currentY);
        currentY += 8;
      } else {
        currentY += 8;
      }
    }
    currentY += 10;
    
    // =================== EXPERIENCE ===================
    if (profile.experience && profile.experience.length > 0) {
      // Section header
      setColor(colors.primary, 'fill');
      addRect(20, currentY - 5, 170, 8, true);
      
      setColor([255, 255, 255], 'text');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROFESSIONAL EXPERIENCE', 22, currentY);
      currentY += 15;
      
      profile.experience.forEach(exp => {
        // Position and Company
        setColor(colors.dark, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(exp.position, 20, currentY);
        currentY += 6;
        
        setColor(colors.medium, 'text');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(exp.company, 20, currentY);
        
        // Date range
        const period = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'}`;
        pdf.text(period, 190, currentY, { align: 'right' });
        currentY += 8;
        
        // Description
        if (exp.description) {
          setColor(colors.dark, 'text');
          pdf.setFontSize(9);
          const descHeight = addText(exp.description, 20, currentY, { maxWidth: 170 });
          currentY += descHeight + 10;
        }
      });
    }
    
    // =================== PROJECTS ===================
    if (profile.projects && profile.projects.length > 0) {
      // Check if we need a new page
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }
      
      // Section header
      setColor(colors.primary, 'fill');
      addRect(20, currentY - 5, 170, 8, true);
      
      setColor([255, 255, 255], 'text');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KEY PROJECTS', 22, currentY);
      currentY += 15;
      
      profile.projects.slice(0, 3).forEach(project => { // Show max 3 projects
        setColor(colors.dark, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(project.name, 20, currentY);
        currentY += 6;
        
        setColor(colors.dark, 'text');
        pdf.setFontSize(9);
        const descHeight = addText(project.description, 20, currentY, { maxWidth: 170 });
        currentY += descHeight + 3;
        
        if (project.technologies && project.technologies.length > 0) {
          setColor(colors.accent, 'text');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          const techText = `Technologies: ${project.technologies.join(', ')}`;
          const techHeight = addText(techText, 20, currentY, { maxWidth: 170 });
          currentY += techHeight + 8;
        }
      });
    }
    
    // =================== FOOTER ===================
    setColor(colors.light, 'text');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const footerText = `Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save with English name format
    const convertedNamesForFile = convertVietnameseNames(
      profile.firstName || 'Professional', 
      profile.lastName || 'CV'
    );
    const fileName = `${convertedNamesForFile.firstName}_${convertedNamesForFile.lastName}_Resume.pdf`;
    pdf.save(fileName);
    
    console.log('✅ Professional CV generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating professional CV:', error);
    throw error;
  }
};

export default generateProfessionalCV;
