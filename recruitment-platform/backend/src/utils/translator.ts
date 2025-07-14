/**
 * Comprehensive Vietnamese to English Translator (Backend)
 * Translates all CV data from Vietnamese to English
 */

import { convertVietnameseToEnglish } from './vietnameseConverter';

// Vietnamese to English translations mapping
const translations: { [key: string]: string } = {
  // Universities
  'Đại học Bách khoa Hà Nội': 'Hanoi University of Science and Technology',
  'Đại học Bách khoa TP.HCM': 'Ho Chi Minh City University of Technology',
  'Đại học Quốc gia Hà Nội': 'Vietnam National University, Hanoi',
  'Đại học Quốc gia TP.HCM': 'Vietnam National University, Ho Chi Minh City',
  'Đại học FPT': 'FPT University',
  'Đại học Công nghệ': 'University of Technology',
  
  // Majors/Fields of Study
  'Công nghệ Thông tin': 'Information Technology',
  'Khoa học Máy tính': 'Computer Science',
  'Kỹ thuật Phần mềm': 'Software Engineering',
  'An toàn Thông tin': 'Information Security',
  'Khoa học Dữ liệu': 'Data Science',
  'Thiết kế Đồ họa': 'Graphic Design',
  'Kỹ thuật Điện tử - Viễn thông': 'Electronics and Telecommunications Engineering',
  
  // Companies
  'FPT Software': 'FPT Software',
  'VNG Corporation': 'VNG Corporation',
  'Viettel': 'Viettel Group',
  'Bosch Việt Nam': 'Bosch Vietnam',
  
  // Cities
  'Hà Nội': 'Hanoi',
  'TP.HCM': 'Ho Chi Minh City',
  'Đà Nẵng': 'Da Nang',
  'Remote': 'Remote',
  
  // Common terms
  'tháng': 'months',
  'năm': 'years',
  'thực tập': 'internship',
  'tại': 'at',
  'với': 'with',
  'theo phương pháp': 'using',
  'Phát triển': 'Developed',
  'Thiết kế': 'Designed',
  'Tối ưu hóa': 'Optimized',
  'Triển khai': 'Implemented',
  'Làm việc': 'Worked'
};

/**
 * Translate text from Vietnamese to English
 */
export function translateToEnglish(text: string): string {
  if (!text) return '';
  
  let translatedText = text;
  
  // First, convert Vietnamese characters to English
  translatedText = convertVietnameseToEnglish(translatedText);
  
  // Then apply specific translations
  Object.entries(translations).forEach(([vietnamese, english]) => {
    const regex = new RegExp(vietnamese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translatedText = translatedText.replace(regex, english);
  });
  
  return translatedText;
}

/**
 * Translate complete profile data
 */
export function translateProfile(profile: any): any {
  if (!profile) return profile;
  
  const translatedProfile = { ...profile };
  
  // Translate university
  if (profile.university) {
    translatedProfile.university = translateToEnglish(profile.university);
  }
  
  // Translate major
  if (profile.major) {
    const translated = translateToEnglish(profile.major);
    translatedProfile.major = translated.includes('Bachelor') ? translated : `Bachelor of Science in ${translated}`;
  }
  
  // Translate experience
  if (profile.experience) {
    translatedProfile.experience = translateToEnglish(profile.experience)
      .replace(/(\d+)\s*thang/gi, '$1 months')
      .replace(/(\d+)\s*nam/gi, '$1 years');
  }
  
  // Translate preferred locations
  if (profile.preferredLocations && Array.isArray(profile.preferredLocations)) {
    translatedProfile.preferredLocations = profile.preferredLocations.map((location: string) => 
      translateToEnglish(location)
    );
  }
  
  return translatedProfile;
}
