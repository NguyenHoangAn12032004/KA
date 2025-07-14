// @ts-ignore
import html2pdf from 'html2pdf.js';

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

export const generateCVHTML = (profile: ProfileData): void => {
  console.log('🔄 Generating CV with HTML method for profile:', profile);

  // Create HTML content with proper Vietnamese font support
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CV - ${profile.firstName} ${profile.lastName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 30px;
        }
        
        .cv-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        
        .header {
          text-align: left;
          margin-bottom: 30px;
          border-bottom: 3px solid #2962ff;
          padding-bottom: 20px;
        }
        
        .name {
          font-size: 32px;
          font-weight: 700;
          color: #2962ff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .contact-info {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .links {
          font-size: 14px;
          color: #2962ff;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2962ff;
          text-transform: uppercase;
          border-bottom: 2px solid #e3f2fd;
          padding-bottom: 5px;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }
        
        .content {
          margin-left: 0;
        }
        
        .item {
          margin-bottom: 15px;
        }
        
        .item-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 3px;
        }
        
        .item-subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .item-description {
          font-size: 14px;
          color: #444;
          line-height: 1.6;
        }
        
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .skill-tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .date-range {
          font-size: 13px;
          color: #888;
          font-style: italic;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }
        
        /* Print optimizations */
        @media print {
          body { padding: 0; }
          .cv-container { max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="cv-container">
        <!-- Header -->
        <div class="header">
          <div class="name">${profile.firstName || 'Sinh viên'} ${profile.lastName || 'Demo'}</div>
          <div class="contact-info">
            ${[profile.email, profile.phone, profile.address].filter(Boolean).join(' | ')}
          </div>
          ${[profile.portfolio, profile.linkedin, profile.github].filter(Boolean).length > 0 ? `
          <div class="links">
            ${[
              profile.portfolio ? `Portfolio: ${profile.portfolio}` : '',
              profile.linkedin ? `LinkedIn: ${profile.linkedin}` : '',
              profile.github ? `GitHub: ${profile.github}` : ''
            ].filter(Boolean).join(' | ')}
          </div>
          ` : ''}
        </div>

        <!-- Summary -->
        ${profile.summary ? `
        <div class="section">
          <div class="section-title">Giới thiệu</div>
          <div class="content">
            <div class="item-description">${profile.summary}</div>
          </div>
        </div>
        ` : ''}

        <!-- Education -->
        <div class="section">
          <div class="section-title">Học vấn</div>
          <div class="content">
            ${profile.education && profile.education.length > 0 ? 
              profile.education.map(edu => `
                <div class="item">
                  <div class="item-title">${edu.degree} - ${edu.institution}</div>
                  ${edu.major ? `<div class="item-subtitle">Chuyên ngành: ${edu.major}</div>` : ''}
                  ${edu.gpa ? `<div class="item-subtitle">GPA: ${edu.gpa}</div>` : ''}
                  <div class="date-range">${edu.startDate} - ${edu.current ? 'Hiện tại' : edu.endDate || 'N/A'}</div>
                </div>
              `).join('') :
              `<div class="item">
                <div class="item-title">${profile.university || 'Đại học'} ${profile.major ? `- ${profile.major}` : ''}</div>
                ${profile.graduationYear ? `<div class="item-subtitle">Năm tốt nghiệp: ${profile.graduationYear}</div>` : ''}
                ${profile.gpa ? `<div class="item-subtitle">GPA: ${profile.gpa}</div>` : ''}
              </div>`
            }
          </div>
        </div>

        <!-- Experience -->
        ${profile.experience && profile.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Kinh nghiệm làm việc</div>
          <div class="content">
            ${profile.experience.map(exp => `
              <div class="item">
                <div class="item-title">${exp.position} - ${exp.company}</div>
                ${exp.location ? `<div class="item-subtitle">${exp.location}</div>` : ''}
                <div class="date-range">${exp.startDate} - ${exp.current ? 'Hiện tại' : exp.endDate || 'N/A'}</div>
                ${exp.description ? `<div class="item-description">${exp.description.replace(/\\n/g, '<br>')}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Projects -->
        ${profile.projects && profile.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Dự án</div>
          <div class="content">
            ${profile.projects.map(project => `
              <div class="item">
                <div class="item-title">${project.name}</div>
                <div class="item-description">${project.description}</div>
                ${project.technologies && project.technologies.length > 0 ? `
                  <div class="item-subtitle">Công nghệ: ${project.technologies.join(', ')}</div>
                ` : ''}
                ${project.link ? `<div class="item-subtitle" style="color: #2962ff;">Link: ${project.link}</div>` : ''}
                ${project.github ? `<div class="item-subtitle" style="color: #2962ff;">GitHub: ${project.github}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Skills -->
        <div class="section">
          <div class="section-title">Kỹ năng</div>
          <div class="content">
            ${profile.skills && profile.skills.length > 0 ? `
              <div class="skills-grid">
                ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            ` : '<div class="item-description">Sẽ được cập nhật sau...</div>'}
          </div>
        </div>

        <!-- Languages -->
        ${profile.languages && profile.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Ngôn ngữ</div>
          <div class="content">
            ${profile.languages.map(lang => `
              <div class="item-subtitle">${lang.name}: ${lang.level}</div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Certifications -->
        ${profile.certifications && profile.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Chứng chỉ</div>
          <div class="content">
            ${profile.certifications.map(cert => `
              <div class="item">
                <div class="item-title">${cert.name} - ${cert.issuer}</div>
                <div class="date-range">${cert.date}</div>
                ${cert.link ? `<div class="item-subtitle" style="color: #2962ff;">${cert.link}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          CV được tạo tự động - ${new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a temporary element to render HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.top = '0';
  document.body.appendChild(element);

  // Configure html2pdf options
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `CV_${profile.firstName || 'SinhVien'}_${profile.lastName || 'Demo'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    }
  };

  // Generate PDF
  html2pdf().set(opt).from(element).save().then(() => {
    // Clean up
    document.body.removeChild(element);
    console.log('✅ CV generated successfully with Vietnamese font support!');
  }).catch((error: any) => {
    console.error('❌ Error generating CV:', error);
    document.body.removeChild(element);
  });
};

export default generateCVHTML;
