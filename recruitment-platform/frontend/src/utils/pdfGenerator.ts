import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { convertVietnameseNames } from './vietnameseConverter';

// Add font support for Vietnamese
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

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

export const generateCV = (profile: ProfileData): void => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Set default font to support Unicode characters better
  pdf.setFont('helvetica');
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentY = margin;
  
  // Add debug logging
  console.log('🔄 Generating CV with profile data:', profile);
  
  // Header section with contact info
  const addHeader = () => {
    // Name with Vietnamese support - convert to English format
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(41, 98, 255); // Primary blue color
    
    // Convert Vietnamese names to English format automatically
    const convertedNames = convertVietnameseNames(
      profile.firstName || 'Sinh viên', 
      profile.lastName || 'Demo'
    );
    const fullName = convertedNames.fullName;
    
    // Use the converted English name (no special characters)
    pdf.text(fullName, margin, currentY);
    currentY += 10;
    
    // Contact information
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const contactInfo = [];
    if (profile.email) contactInfo.push(profile.email);
    if (profile.phone) contactInfo.push(profile.phone);
    if (profile.address) contactInfo.push(profile.address);
    
    if (contactInfo.length > 0) {
      pdf.text(contactInfo.join(' | '), margin, currentY);
      currentY += 6;
    }
    
    // Links
    const links = [];
    if (profile.portfolio) links.push(`Portfolio: ${profile.portfolio}`);
    if (profile.linkedin) links.push(`LinkedIn: ${profile.linkedin}`);
    if (profile.github) links.push(`GitHub: ${profile.github}`);
    
    if (links.length > 0) {
      pdf.text(links.join(' | '), margin, currentY);
      currentY += 6;
    }
    
    currentY += 5;
    
    // Divider line
    pdf.setDrawColor(41, 98, 255);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
  };
  
  // Section header
  const addSectionHeader = (title: string) => {
    if (currentY > pageHeight - 30) {
      pdf.addPage();
      currentY = margin;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(41, 98, 255);
    pdf.text(title.toUpperCase(), margin, currentY);
    currentY += 2;
    
    // Underline
    pdf.setDrawColor(41, 98, 255);
    pdf.setLineWidth(0.3);
    const textWidth = pdf.getTextWidth(title.toUpperCase());
    pdf.line(margin, currentY, margin + textWidth, currentY);
    currentY += 8;
  };
  
  // Text content with word wrapping and Vietnamese support
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    // Handle Vietnamese characters by encoding text properly
    const encodedText = text.normalize('NFC'); // Normalize Unicode
    
    try {
      const lines = pdf.splitTextToSize(encodedText, contentWidth);
      for (const line of lines) {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += fontSize * 0.35 + 2;
      }
    } catch (error) {
      console.warn('Font encoding issue, using fallback:', error);
      // Fallback: try without special characters
      const fallbackText = text.replace(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]/g, '?');
      const lines = pdf.splitTextToSize(fallbackText, contentWidth);
      for (const line of lines) {
        if (currentY > pageHeight - 20) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += fontSize * 0.35 + 2;
      }
    }
  };

  // Add spacing
  const addSpacing = (space: number = 5) => {
    currentY += space;
  };

  // Start generating CV content
  addHeader();
  
  // Summary section
  if (profile.summary) {
    addSectionHeader('Giới thiệu');
    addText(profile.summary);
    addSpacing();
  }
  
  // Education
  if (profile.education && profile.education.length > 0) {
    addSectionHeader('Học vấn');
    profile.education.forEach((edu: Education) => {
      addText(`${edu.degree} - ${edu.institution}`, 11, true, [51, 51, 51]);
      if (edu.major) {
        addText(`Chuyên ngành: ${edu.major}`, 10, false, [100, 100, 100]);
      }
      if (edu.gpa) {
        addText(`GPA: ${edu.gpa}`, 10, false, [100, 100, 100]);
      }
      const period = `${edu.startDate} - ${edu.current ? 'Hiện tại' : edu.endDate || 'N/A'}`;
      addText(period, 10, false, [100, 100, 100]);
      addSpacing(3);
    });
    addSpacing();
  } else if (profile.university || profile.major || profile.graduationYear) {
    // Fallback education from basic profile
    addSectionHeader('Học vấn');
    const degree = profile.university || 'Đại học';
    const major = profile.major ? ` - ${profile.major}` : '';
    addText(`${degree}${major}`, 11, true, [51, 51, 51]);
    if (profile.graduationYear) {
      addText(`Năm tốt nghiệp: ${profile.graduationYear}`, 10, false, [100, 100, 100]);
    }
    if (profile.gpa) {
      addText(`GPA: ${profile.gpa}`, 10, false, [100, 100, 100]);
    }
    addSpacing();
  }
  
  // Experience
  if (profile.experience && profile.experience.length > 0) {
    addSectionHeader('Kinh nghiệm làm việc');
    profile.experience.forEach((exp: Experience) => {
      addText(`${exp.position} - ${exp.company}`, 11, true, [51, 51, 51]);
      if (exp.location) {
        addText(exp.location, 10, false, [100, 100, 100]);
      }
      const period = `${exp.startDate} - ${exp.current ? 'Hiện tại' : exp.endDate || 'N/A'}`;
      addText(period, 10, false, [100, 100, 100]);
      if (exp.description) {
        addText(exp.description, 10);
      }
      addSpacing(3);
    });
    addSpacing();
  }
  
  // Projects
  if (profile.projects && profile.projects.length > 0) {
    addSectionHeader('Dự án');
    profile.projects.forEach((project: Project) => {
      addText(project.name, 11, true, [51, 51, 51]);
      addText(project.description, 10);
      if (project.technologies && project.technologies.length > 0) {
        addText(`Công nghệ: ${project.technologies.join(', ')}`, 10, false, [100, 100, 100]);
      }
      if (project.link) {
        addText(`Link: ${project.link}`, 10, false, [41, 98, 255]);
      }
      if (project.github) {
        addText(`GitHub: ${project.github}`, 10, false, [41, 98, 255]);
      }
      addSpacing(3);
    });
    addSpacing();
  }
  
  // Skills - Always add, with fallback
  addSectionHeader('Kỹ năng');
  if (profile.skills && profile.skills.length > 0) {
    const skillsText = profile.skills.join(' • ');
    addText(skillsText);
  } else {
    addText('Sẽ được cập nhật sau...', 10, false, [100, 100, 100]);
  }
  addSpacing();
  
  // Languages
  if (profile.languages && profile.languages.length > 0) {
    addSectionHeader('Ngôn ngữ');
    profile.languages.forEach((lang: Language) => {
      addText(`${lang.name}: ${lang.level}`, 10);
    });
    addSpacing();
  }
  
  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    addSectionHeader('Chứng chỉ');
    profile.certifications.forEach((cert: Certification) => {
      addText(`${cert.name} - ${cert.issuer}`, 11, true, [51, 51, 51]);
      addText(cert.date, 10, false, [100, 100, 100]);
      if (cert.link) {
        addText(cert.link, 10, false, [41, 98, 255]);
      }
      addSpacing(3);
    });
  }
  
  // Add footer with generation date
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  const footerText = `CV được tạo tự động - ${new Date().toLocaleDateString('vi-VN')}`;
  pdf.text(footerText, margin, pageHeight - 10);
  
  // Save the PDF with English name format
  const convertedNames = convertVietnameseNames(
    profile.firstName || 'SinhVien', 
    profile.lastName || 'Demo'
  );
  const fileName = `CV_${convertedNames.firstName}_${convertedNames.lastName}.pdf`;
  console.log('💾 Saving CV as:', fileName);
  pdf.save(fileName);
};

export default generateCV;
