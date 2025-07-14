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

export const generateModernCV = (profile: ProfileData): void => {
  console.log('🔄 Generating Modern CV for:', profile);

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Modern color palette
    const colors = {
      primary: [74, 144, 226],      // Modern blue
      secondary: [45, 55, 72],      // Dark slate
      accent: [72, 187, 120],       // Green
      text: [45, 55, 72],           // Dark text
      light: [113, 128, 150],       // Light gray
      background: [247, 250, 252],  // Very light blue
      white: [255, 255, 255]
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
    
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        maxWidth = 0,
        align = 'left'
      } = options;
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      // Clean text for better compatibility
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
          pdf.text(line, x, y + (index * (fontSize * 0.35)), { align });
        });
        return lines.length * (fontSize * 0.35);
      } else {
        pdf.text(cleanText, x, y, { align });
        return fontSize * 0.35;
      }
    };

    const addSection = (title: string, y: number) => {
      // Section background
      setColor(colors.background, 'fill');
      pdf.rect(15, y - 2, 180, 7, 'F');
      
      // Section title
      setColor(colors.primary, 'text');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title.toUpperCase(), 18, y + 2);
      
      // Underline
      setColor(colors.primary, 'draw');
      pdf.setLineWidth(0.5);
      pdf.line(18, y + 3.5, 18 + pdf.getTextWidth(title.toUpperCase()), y + 3.5);
      
      return y + 10;
    };
    
    // =================== HEADER ===================
    // Header background
    setColor(colors.primary, 'fill');
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Name - Convert Vietnamese to English
    setColor(colors.white, 'text');
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const convertedNames = convertVietnameseNames(
      profile.firstName || 'Professional', 
      profile.lastName || 'Candidate'
    );
    pdf.text(convertedNames.fullName, 20, 20);
    
    // Job title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const jobTitle = profile.major === 'Thiết kế Đồ họa' ? 'UI/UX Designer' : 
                     profile.major === 'Khoa học Máy tính' ? 'Software Developer' :
                     profile.major === 'An toàn Thông tin' ? 'Cybersecurity Analyst' :
                     profile.major === 'Khoa học Dữ liệu' ? 'Data Scientist' :
                     profile.major === 'Kỹ thuật Điện tử - Viễn thông' ? 'Hardware Engineer' :
                     'Software Engineer';
    pdf.text(jobTitle, 20, 32);
    
    currentY = 55;
    
    // =================== CONTACT INFORMATION ===================
    setColor(colors.text, 'text');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const contacts = [
      profile.email,
      profile.phone,
      profile.portfolio,
      profile.linkedin,
      profile.github
    ].filter(Boolean);
    
    const contactText = contacts.join(' | ');
    addText(contactText, 20, currentY, { maxWidth: 170 });
    currentY += 15;
    
    // =================== PROFESSIONAL SUMMARY ===================
    if (profile.summary) {
      currentY = addSection('Professional Summary', currentY);
      setColor(colors.text, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryHeight = addText(profile.summary, 20, currentY, { maxWidth: 170 });
      currentY += summaryHeight + 12;
    }
    
    // =================== EDUCATION ===================
    currentY = addSection('Education', currentY);
    
    if (profile.education && profile.education.length > 0) {
      profile.education.forEach(edu => {
        // Degree and Institution
        setColor(colors.text, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        const degree = edu.degree === 'Cử nhân' ? 'Bachelor of Science' : edu.degree;
        const institution = edu.institution === 'Đại học Quốc gia Hà Nội' ? 'Vietnam National University, Hanoi' :
                           edu.institution === 'Đại học Bách khoa Hà Nội' ? 'Hanoi University of Science & Technology' :
                           edu.institution === 'Đại học Công nghệ Thông tin - ĐHQG TP.HCM' ? 'University of Information Technology' :
                           edu.institution;
        
        pdf.text(`${degree}`, 20, currentY);
        currentY += 5;
        
        setColor(colors.light, 'text');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(institution, 20, currentY);
        
        // Date on the right
        const dateText = `${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || 'N/A'}`;
        pdf.text(dateText, 190, currentY, { align: 'right' });
        currentY += 4;
        
        // Major and GPA
        if (edu.major) {
          setColor(colors.text, 'text');
          const major = edu.major === 'Thiết kế Đồ họa' ? 'Graphic Design' :
                       edu.major === 'Khoa học Máy tính' ? 'Computer Science' :
                       edu.major;
          pdf.text(`Major: ${major}`, 20, currentY);
          currentY += 4;
        }
        
        if (edu.gpa) {
          setColor(colors.accent, 'text');
          pdf.setFontSize(9);
          pdf.text(`GPA: ${edu.gpa}/4.0`, 20, currentY);
          currentY += 6;
        }
        currentY += 3;
      });
    } else {
      // Default education
      setColor(colors.text, 'text');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      const degree = 'Bachelor of Science';
      const major = profile.major === 'Thiết kế Đồ họa' ? 'Graphic Design' :
                    profile.major === 'Khoa học Máy tính' ? 'Computer Science' :
                    profile.major || 'Computer Science';
      
      pdf.text(`${degree} in ${major}`, 20, currentY);
      currentY += 5;
      
      setColor(colors.light, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const uni = profile.university === 'Đại học Quốc gia Hà Nội' ? 'Vietnam National University, Hanoi' :
                  profile.university || 'University';
      pdf.text(uni, 20, currentY);
      
      if (profile.graduationYear) {
        const startYear = parseInt(profile.graduationYear) - 4;
        pdf.text(`${startYear} - ${profile.graduationYear}`, 190, currentY, { align: 'right' });
      }
      currentY += 4;
      
      if (profile.gpa) {
        setColor(colors.accent, 'text');
        pdf.setFontSize(9);
        pdf.text(`GPA: ${profile.gpa}/4.0`, 20, currentY);
        currentY += 6;
      }
    }
    currentY += 8;
    
    // =================== TECHNICAL SKILLS ===================
    if (profile.skills && profile.skills.length > 0) {
      currentY = addSection('Technical Skills', currentY);
      
      setColor(colors.text, 'text');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Create skill bullets
      const skillsPerLine = 3;
      const skills = profile.skills;
      
      for (let i = 0; i < skills.length; i += skillsPerLine) {
        const lineSkills = skills.slice(i, i + skillsPerLine);
        const skillLine = lineSkills.map(skill => `• ${skill}`).join('    ');
        addText(skillLine, 20, currentY, { maxWidth: 170 });
        currentY += 6;
      }
      currentY += 8;
    }
    
    // =================== EXPERIENCE ===================
    if (profile.experience && profile.experience.length > 0) {
      currentY = addSection('Professional Experience', currentY);
      
      profile.experience.forEach(exp => {
        // Position
        setColor(colors.text, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(exp.position, 20, currentY);
        currentY += 5;
        
        // Company and Date
        setColor(colors.light, 'text');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(exp.company, 20, currentY);
        
        const period = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'}`;
        pdf.text(period, 190, currentY, { align: 'right' });
        currentY += 6;
        
        // Description
        if (exp.description) {
          setColor(colors.text, 'text');
          pdf.setFontSize(9);
          const descHeight = addText(exp.description, 20, currentY, { maxWidth: 170 });
          currentY += descHeight + 8;
        }
      });
    }
    
    // =================== PROJECTS ===================
    if (profile.projects && profile.projects.length > 0) {
      if (currentY > pageHeight - 50) {
        pdf.addPage();
        currentY = 20;
      }
      
      currentY = addSection('Key Projects', currentY);
      
      profile.projects.slice(0, 2).forEach(project => {
        setColor(colors.text, 'text');
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(project.name, 20, currentY);
        currentY += 5;
        
        setColor(colors.text, 'text');
        pdf.setFontSize(9);
        const descHeight = addText(project.description, 20, currentY, { maxWidth: 170 });
        currentY += descHeight + 2;
        
        if (project.technologies && project.technologies.length > 0) {
          setColor(colors.accent, 'text');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          const techText = `Technologies: ${project.technologies.join(', ')}`;
          addText(techText, 20, currentY, { maxWidth: 170 });
          currentY += 8;
        }
      });
    }
    
    // =================== FOOTER ===================
    setColor(colors.light, 'text');
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const footerText = `Resume generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Save with English name format
    const convertedNamesForFile = convertVietnameseNames(
      profile.firstName || 'Professional', 
      profile.lastName || 'Resume'
    );
    const fileName = `${convertedNamesForFile.firstName}_${convertedNamesForFile.lastName}_Modern.pdf`;
    pdf.save(fileName);
    
    console.log('✅ Modern CV generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating modern CV:', error);
    throw error;
  }
};

export default generateModernCV;
