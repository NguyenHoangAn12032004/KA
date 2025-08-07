import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    responseTime: number;
    needsHumanAgent: boolean;
  };
}

class ChatbotService {
  private baseURL = `${API_BASE_URL}/api/ai`;

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      console.log('🤖 Sending message to chatbot:', message);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để sử dụng chatbot');
      }

      console.log('🔑 Using token:', token.substring(0, 20) + '...');

      const response = await axios.post(
        `${this.baseURL}/chat`,
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      console.log('✅ Chatbot response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Chatbot API Error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Yêu cầu quá thời gian. Vui lòng thử lại.');
      }
      
      throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    }
  }

  // Predefined quick messages for better UX
  getQuickMessages(): string[] {
    return [
      'Tôi cần tìm việc làm phù hợp',
      'Làm thế nào để tạo CV tốt?',
      'Các kỹ năng cần thiết cho developer là gì?',
      'Tôi muốn biết về lương của vị trí này',
      'Làm sao để chuẩn bị phỏng vấn?',
      'Tôi cần tư vấn nghề nghiệp'
    ];
  }
}

export const chatbotService = new ChatbotService();
