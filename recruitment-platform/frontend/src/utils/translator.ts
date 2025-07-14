/**
 * Clean Vietnamese to English Translator
 * Fixed all duplicate keys and organized mappings
 */

import { convertVietnameseToEnglish } from './vietnameseConverter';

// Vietnamese to English translations mapping (NO DUPLICATES)
const translations: { [key: string]: string } = {
  // Universities
  'Đại học Bách khoa Hà Nội': 'Hanoi University of Science and Technology',
  'Đại học Quốc gia Hà Nội': 'Vietnam National University, Hanoi',
  'Đại học Công nghệ': 'University of Technology',
  'Đại học Kinh tế Quốc dân': 'National Economics University',
  'Đại học Ngoại thương': 'Foreign Trade University',
  'Đại học Sư phạm Hà Nội': 'Hanoi National University of Education',
  'Đại học Khoa học Tự nhiên': 'University of Science',
  'Đại học Xây dựng': 'National University of Civil Engineering',
  'Đại học Y Hà Nội': 'Hanoi Medical University',
  'Đại học Luật Hà Nội': 'Hanoi Law University',

  // Majors and degrees
  'Công nghệ Thông tin': 'Information Technology',
  'Khoa học Máy tính': 'Computer Science',
  'Kỹ thuật Phần mềm': 'Software Engineering',
  'Hệ thống Thông tin': 'Information Systems',
  'Mạng máy tính': 'Computer Networks',
  'An toàn Thông tin': 'Information Security',
  'Trí tuệ Nhân tạo': 'Artificial Intelligence',
  'Khoa học Dữ liệu': 'Data Science',
  'Cử nhân': 'Bachelor',
  'Thạc sĩ': 'Master',
  'Tiến sĩ': 'Doctor',

  // Skills
  'Lập trình': 'Programming',
  'Phát triển web': 'Web Development',
  'Phát triển ứng dụng': 'Application Development',
  'Cơ sở dữ liệu': 'Database',
  'Thiết kế': 'Design',
  'Quản lý dự án': 'Project Management',
  'Làm việc nhóm': 'Teamwork',
  'Giải quyết vấn đề': 'Problem Solving',
  'Giao tiếp': 'Communication',
  'Lãnh đạo': 'Leadership',

  // Locations
  'Hà Nội': 'Hanoi',
  'Thành phố Hồ Chí Minh': 'Ho Chi Minh City',
  'TP.HCM': 'Ho Chi Minh City',
  'Đà Nẵng': 'Da Nang',
  'Hải Phòng': 'Hai Phong',
  'Cần Thơ': 'Can Tho',
  'Việt Nam': 'Vietnam',

  // Time units
  'tháng': 'months',
  'thang': 'months',
  'năm': 'years', 
  'nam': 'years',

  // Prepositions and connectors
  'tại': 'at',
  'tai': 'at',
  'với': 'with',
  'voi': 'with',
  'và': 'and',
  'va': 'and',
  'trên': 'on',
  'tren': 'on',
  'trong': 'in',
  'theo': 'according to',

  // Action verbs - Vietnamese with diacritics
  'Phát triển': 'Developed',
  'Tối ưu hóa': 'Optimized',
  'Triển khai': 'Deployed',
  'Làm việc': 'Worked',
  'Xây dựng': 'Built',
  'Quản lý': 'Managed',
  'Tích hợp': 'Integrated',
  'Kiểm thử': 'Tested',

  // Action verbs - Vietnamese without diacritics
  'Phat trien': 'Developed',
  'Toi uu hoa': 'Optimized', 
  'Trien khai': 'Deployed',
  'Lam viec': 'Worked',
  'Xay dung': 'Built',
  'Thiet ke': 'Designed',
  'Quan ly': 'Managed',
  'Tich hop': 'Integrated',
  'Kiem thu': 'Tested',

  // Common phrases
  'theo phương pháp': 'using methodology',
  'theo phuong phap': 'using methodology',
  'phương pháp Agile': 'Agile methodology',
  'phuong phap Agile': 'Agile methodology',
  'làm việc với': 'worked with',
  'lam viec voi': 'worked with',
  'làm việc với team': 'worked with team',
  'lam viec voi team': 'worked with team',

  // Job types
  'thực tập': 'internship',
  'thuc tap': 'internship',
  'toàn thời gian': 'full-time',
  'toan thoi gian': 'full-time',
  'bán thời gian': 'part-time',
  'ban thoi gian': 'part-time',

  // Technical terms
  'cơ sở dữ liệu': 'database',
  'co so du lieu': 'database',
  'hệ thống': 'system',
  'he thong': 'system',
  'ứng dụng': 'application',
  'ung dung': 'application',
  'website': 'website',
  'giao diện': 'interface',
  'giao dien': 'interface'
};

/**
 * Translate a single text from Vietnamese to English
 */
export function translateToEnglish(text: string): string {
  if (!text) return '';
  
  let translatedText = text;
  
  // First, convert Vietnamese characters to English
  translatedText = convertVietnameseToEnglish(translatedText);
  
  // Then apply specific translations
  Object.entries(translations).forEach(([vietnamese, english]) => {
    const regex = new RegExp(`\\b${vietnamese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translatedText = translatedText.replace(regex, english);
  });
  
  return translatedText;
}

/**
 * Translate university name
 */
export function translateUniversity(university: string): string {
  if (!university) return '';
  
  const translated = translateToEnglish(university);
  
  // Handle common patterns
  if (translated.includes('Dai hoc') && !Object.values(translations).includes(translated)) {
    return translated.replace(/Dai hoc\s*/gi, 'University of ');
  }
  
  return translated;
}

/**
 * Translate job experience text with improved handling
 */
export function translateExperience(experience: string): string {
  if (!experience) return '';
  
  let translated = experience;
  
  // Convert Vietnamese characters first
  translated = convertVietnameseToEnglish(translated);
  
  // Handle specific complex phrases first (longer phrases first)
  translated = translated
    .replace(/\bLam\s+viec\s+voi\s+team\s+theo\s+phuong\s+phap\s+Agile\b/gi, 'Worked with team using Agile methodology')
    .replace(/\btheo\s+phuong\s+phap\s+Agile\b/gi, 'using Agile methodology')
    .replace(/\bLam\s+viec\s+voi\s+team\b/gi, 'Worked with team')
    .replace(/\btheo\s+phuong\s+phap\b/gi, 'using methodology')
    .replace(/\bphuong\s+phap\s+Agile\b/gi, 'Agile methodology');

  // Apply word-by-word translations
  Object.entries(translations).forEach(([vietnamese, english]) => {
    const regex = new RegExp(`\\b${vietnamese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translated = translated.replace(regex, english);
  });
  
  // Handle remaining patterns and clean up
  translated = translated
    .replace(/(\d+)\s*(thang|months)/gi, '$1 months')
    .replace(/(\d+)\s*(nam|years)/gi, '$1 years')
    .replace(/\s+/g, ' ')
    .trim();
  
  return translated;
}

/**
 * Translate major/field of study
 */
export function translateMajor(major: string): string {
  if (!major) return '';
  
  const translated = translateToEnglish(major);
  
  // Add "Bachelor of Science in" prefix if not present
  if (translated && !translated.toLowerCase().includes('bachelor')) {
    return `Bachelor of Science in ${translated}`;
  }
  
  return translated;
}

/**
 * Translate complete profile data
 */
export function translateProfile(profile: any): any {
  if (!profile) return profile;
  
  const translatedProfile = { ...profile };
  
  // Translate names
  if (profile.firstName) {
    translatedProfile.firstName = convertVietnameseToEnglish(profile.firstName);
  }
  if (profile.lastName) {
    translatedProfile.lastName = convertVietnameseToEnglish(profile.lastName);
  }
  
  // Translate university
  if (profile.university) {
    translatedProfile.university = translateUniversity(profile.university);
  }
  
  // Translate major
  if (profile.major) {
    translatedProfile.major = translateMajor(profile.major);
  }
  
  // Translate experience
  if (profile.experience) {
    if (typeof profile.experience === 'string') {
      translatedProfile.experience = translateExperience(profile.experience);
    } else if (Array.isArray(profile.experience)) {
      translatedProfile.experience = profile.experience.map((exp: any) => ({
        ...exp,
        description: exp.description ? translateExperience(exp.description) : exp.description
      }));
    }
  }
  
  // Translate education
  if (profile.education && Array.isArray(profile.education)) {
    translatedProfile.education = profile.education.map((edu: any) => ({
      ...edu,
      institution: edu.institution ? translateUniversity(edu.institution) : edu.institution,
      degree: edu.degree ? translateMajor(edu.degree) : edu.degree,
      major: edu.major ? translateToEnglish(edu.major) : edu.major
    }));
  }
  
  // Translate address/location
  if (profile.address) {
    translatedProfile.address = translateToEnglish(profile.address);
  }
  
  // Translate preferred locations
  if (profile.preferredLocations && Array.isArray(profile.preferredLocations)) {
    translatedProfile.preferredLocations = profile.preferredLocations.map((location: string) => 
      translateToEnglish(location)
    );
  }
  
  // Translate skills if needed
  if (profile.skills && Array.isArray(profile.skills)) {
    translatedProfile.skills = profile.skills.map((skill: string) => translateToEnglish(skill));
  }
  
  return translatedProfile;
}

/**
 * Get English job title (legacy function for compatibility)
 */
export function getEnglishJobTitle(vietnameseTitle: string): string {
  return translateToEnglish(vietnameseTitle);
}
