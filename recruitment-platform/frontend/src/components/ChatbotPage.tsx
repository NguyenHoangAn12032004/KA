import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  Slide,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { chatbotService, ChatMessage } from '../services/chatbotService';

const ChatbotPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    console.log('📝 Messages state updated, total messages:', messages.length);
    console.log('📝 Current messages:', messages.map(m => ({ id: m.id, isUser: m.isUser, content: m.content?.substring(0, 30) + '...' })));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      content: `Xin chào ${user?.name || 'bạn'}! 👋 Tôi là trợ lý AI của nền tảng tuyển dụng. Tôi có thể giúp bạn tìm việc, tư vấn nghề nghiệp, và trả lời các câu hỏi về tuyển dụng. Bạn cần hỗ trợ gì hôm nay?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim(); // Store message before clearing input
    console.log('🚀 Sending message:', messageToSend);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => {
      console.log('📝 Adding user message, total messages:', prev.length + 1);
      return [...prev, userMessage];
    });
    setInput(''); // Clear input after storing the message
    setIsLoading(true);
    setError(null);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing',
      content: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => {
      console.log('⏳ Adding typing indicator, total messages:', prev.length + 1);
      return [...prev, typingMessage];
    });

    try {
      console.log('🔄 Calling chatbot service...');
      const response = await chatbotService.sendMessage(messageToSend); // Use stored message
      console.log('✅ Got response from chatbot:', response);
      
      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.message, // Fix: access response.data.message instead of response.message
          isUser: false,
          timestamp: new Date(),
        };
        console.log('🤖 Adding bot response, total messages:', filtered.length + 1);
        console.log('🤖 Bot message content:', response.data.message);
        console.log('🤖 Bot message content length:', response.data.message?.length);
        console.log('🤖 Full response object:', response);
        return [...filtered, botMessage];
      });

    } catch (err: any) {
      console.error('❌ Error in handleSendMessage:', err);
      setError(err.message);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
    } finally {
      setIsLoading(false);
      console.log('✅ Message sending completed');
    }
  };

  const handleQuickMessage = (message: string) => {
    setInput(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 120px)', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      p: 2,
    }}>
      {/* Header */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          mb: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              🤖 {t('chatbot.title')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('chatbot.subtitle')}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Messages */}
      {messages.length <= 1 && (
        <Fade in timeout={1000}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              💡 {t('chatbot.quickSuggestions')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {chatbotService.getQuickMessages().map((msg, index) => (
                <Chip
                  key={index}
                  label={msg}
                  onClick={() => handleQuickMessage(msg)}
                  variant="outlined"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Messages Area */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CardContent sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}>
          {messages.map((message, index) => {
            console.log(`📋 Rendering message ${index}:`, message.content?.substring(0, 50) + '...');
            return (
            <Slide
              key={message.id}
              direction={message.isUser ? 'left' : 'right'}
              in={true}
              timeout={300 + index * 100}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    maxWidth: '70%',
                    flexDirection: message.isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.isUser ? 'primary.main' : 'secondary.main',
                    }}
                  >
                    {message.isUser ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                      color: message.isUser ? 'white' : 'text.primary',
                      borderRadius: 2,
                      position: 'relative',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.isTyping ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          {t('chatbot.typing')}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 1,
                            opacity: 0.7,
                          }}
                        >
                          <TimeIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption">
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Slide>
          );
          })}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Error Display */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mx: 2, mb: 1 }}
          >
            {error}
          </Alert>
        )}

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="large"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              textAlign: 'center', 
              color: 'text.secondary' 
            }}
          >
            💡 {t('chatbot.helpText')}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default ChatbotPage;
