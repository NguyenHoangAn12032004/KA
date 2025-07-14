import jsPDF from 'jspdf';
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

export const generateCVSimple = (profile: ProfileData): void => {
  console.log('🔄 Generating CV with simple method for profile:', profile);

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    let currentY = margin;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (needed: number) => {
      if (currentY + needed > pageHeight - 20) {
        pdf.addPage();
        currentY = margin;
      }
    };

    // Helper function to add text with encoding
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const {
        fontSize = 10,
        fontStyle = 'normal',
        maxWidth = contentWidth,
        align = 'left'
      } = options;
      
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      
      // Convert Vietnamese characters to simpler ones for better compatibility
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
      
      if (maxWidth) {
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        lines.forEach((line: string, index: number) => {
          pdf.text(line, x, y + (index * (fontSize * 0.35 + 2)), { align });
        });
        return lines.length * (fontSize * 0.35 + 2);
      } else {
        pdf.text(cleanText, x, y, { align });
        return fontSize * 0.35 + 2;
      }
    };

    // Header
    checkPageBreak(30);
    pdf.setTextColor(41, 98, 255);
    const nameHeight = addText(
      `${profile.firstName || 'Sinh vien'} ${profile.lastName || 'Demo'}`,
      margin, currentY,
      { fontSize: 24, fontStyle: 'bold' }
    );
    currentY += nameHeight + 5;

    // Contact info
    pdf.setTextColor(100, 100, 100);
    const contactInfo = [profile.email, profile.phone, profile.address].filter(Boolean).join(' | ');
    if (contactInfo) {
      const contactHeight = addText(contactInfo, margin, currentY, { fontSize: 10 });
      currentY += contactHeight + 3;
    }

    // Links
    const links = [
      profile.portfolio ? `Portfolio: ${profile.portfolio}` : '',
      profile.linkedin ? `LinkedIn: ${profile.linkedin}` : '',
      profile.github ? `GitHub: ${profile.github}` : ''
    ].filter(Boolean).join(' | ');
    
    if (links) {
      pdf.setTextColor(41, 98, 255);
      const linksHeight = addText(links, margin, currentY, { fontSize: 10 });
      currentY += linksHeight + 5;
    }

    // Divider line
    pdf.setDrawColor(41, 98, 255);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Section helper
    const addSection = (title: string) => {
      checkPageBreak(20);
      pdf.setTextColor(41, 98, 255);
      const titleHeight = addText(title.toUpperCase(), margin, currentY, { fontSize: 14, fontStyle: 'bold' });
      currentY += titleHeight;
      
      // Underline
      const textWidth = pdf.getTextWidth(title.toUpperCase());
      pdf.line(margin, currentY, margin + textWidth, currentY);
      currentY += 8;
    };

    // Summary
    if (profile.summary) {
      addSection('Gioi thieu');
      pdf.setTextColor(0, 0, 0);
      const summaryHeight = addText(profile.summary, margin, currentY, { fontSize: 10 });
      currentY += summaryHeight + 10;
    }

    // Education
    addSection('Hoc van');
    pdf.setTextColor(0, 0, 0);
    
    if (profile.education && profile.education.length > 0) {
      profile.education.forEach((edu) => {
        checkPageBreak(25);
        const eduTitle = `${edu.degree} - ${edu.institution}`;
        const titleHeight = addText(eduTitle, margin, currentY, { fontSize: 11, fontStyle: 'bold' });
        currentY += titleHeight;
        
        if (edu.major) {
          const majorHeight = addText(`Chuyen nganh: ${edu.major}`, margin, currentY, { fontSize: 10 });
          currentY += majorHeight;
        }
        
        if (edu.gpa) {
          const gpaHeight = addText(`GPA: ${edu.gpa}`, margin, currentY, { fontSize: 10 });
          currentY += gpaHeight;
        }
        
        const period = `${edu.startDate} - ${edu.current ? 'Hien tai' : edu.endDate || 'N/A'}`;
        pdf.setTextColor(100, 100, 100);
        const periodHeight = addText(period, margin, currentY, { fontSize: 10 });
        currentY += periodHeight + 5;
        pdf.setTextColor(0, 0, 0);
      });
    } else {
      const eduTitle = `${profile.university || 'Dai hoc'} ${profile.major ? `- ${profile.major}` : ''}`;
      const titleHeight = addText(eduTitle, margin, currentY, { fontSize: 11, fontStyle: 'bold' });
      currentY += titleHeight;
      
      if (profile.graduationYear) {
        const yearHeight = addText(`Nam tot nghiep: ${profile.graduationYear}`, margin, currentY, { fontSize: 10 });
        currentY += yearHeight;
      }
      
      if (profile.gpa) {
        const gpaHeight = addText(`GPA: ${profile.gpa}`, margin, currentY, { fontSize: 10 });
        currentY += gpaHeight;
      }
    }
    currentY += 10;

    // Experience
    if (profile.experience && profile.experience.length > 0) {
      addSection('Kinh nghiem lam viec');
      profile.experience.forEach((exp) => {
        checkPageBreak(30);
        const expTitle = `${exp.position} - ${exp.company}`;
        const titleHeight = addText(expTitle, margin, currentY, { fontSize: 11, fontStyle: 'bold' });
        currentY += titleHeight;
        
        if (exp.location) {
          pdf.setTextColor(100, 100, 100);
          const locationHeight = addText(exp.location, margin, currentY, { fontSize: 10 });
          currentY += locationHeight;
          pdf.setTextColor(0, 0, 0);
        }
        
        const period = `${exp.startDate} - ${exp.current ? 'Hien tai' : exp.endDate || 'N/A'}`;
        pdf.setTextColor(100, 100, 100);
        const periodHeight = addText(period, margin, currentY, { fontSize: 10 });
        currentY += periodHeight;
        pdf.setTextColor(0, 0, 0);
        
        if (exp.description) {
          const descHeight = addText(exp.description, margin, currentY, { fontSize: 10 });
          currentY += descHeight + 5;
        }
      });
      currentY += 5;
    }

    // Skills
    addSection('Ky nang');
    if (profile.skills && profile.skills.length > 0) {
      const skillsText = profile.skills.join(' • ');
      const skillsHeight = addText(skillsText, margin, currentY, { fontSize: 10 });
      currentY += skillsHeight;
    } else {
      const skillsHeight = addText('Se duoc cap nhat sau...', margin, currentY, { fontSize: 10 });
      currentY += skillsHeight;
    }
    currentY += 10;

    // Projects
    if (profile.projects && profile.projects.length > 0) {
      addSection('Du an');
      profile.projects.forEach((project) => {
        checkPageBreak(25);
        const titleHeight = addText(project.name, margin, currentY, { fontSize: 11, fontStyle: 'bold' });
        currentY += titleHeight;
        
        const descHeight = addText(project.description, margin, currentY, { fontSize: 10 });
        currentY += descHeight;
        
        if (project.technologies && project.technologies.length > 0) {
          pdf.setTextColor(100, 100, 100);
          const techHeight = addText(`Cong nghe: ${project.technologies.join(', ')}`, margin, currentY, { fontSize: 10 });
          currentY += techHeight;
          pdf.setTextColor(0, 0, 0);
        }
        
        if (project.link) {
          pdf.setTextColor(41, 98, 255);
          const linkHeight = addText(`Link: ${project.link}`, margin, currentY, { fontSize: 10 });
          currentY += linkHeight;
          pdf.setTextColor(0, 0, 0);
        }
        
        currentY += 5;
      });
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footerText = `CV duoc tao tu dong - ${new Date().toLocaleDateString('vi-VN')}`;
    pdf.text(footerText, margin, pageHeight - 10);

    // Save
    const fileName = `CV_${profile.firstName || 'SinhVien'}_${profile.lastName || 'Demo'}.pdf`;
    pdf.save(fileName);
    
    console.log('✅ CV generated successfully with simple method!');
    
  } catch (error) {
    console.error('❌ Error generating simple CV:', error);
    throw error;
  }
};

export default generateCVSimple;
