import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { cacheService } from './cacheService';

interface CVAnalysisResult {
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillsMatch: {
    matched: string[];
    missing: string[];
    score: number;
  };
  experienceMatch: {
    relevant: string[];
    score: number;
  };
  summary: string;
}

interface JobMatchResult {
  matchScore: number; // 0-100
  reasons: string[];
  recommendedJobs: {
    jobId: string;
    title: string;
    matchScore: number;
    reason: string;
  }[];
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  needsHumanAgent?: boolean;
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // CV Analysis and Screening
  async analyzeCV(cvText: string, jobRequirements: string[]): Promise<CVAnalysisResult> {
    try {
      const cacheKey = `cv_analysis:${Buffer.from(cvText.substring(0, 100)).toString('base64')}`;
      const cached = await cacheService.get<CVAnalysisResult>(cacheKey);
      
      if (cached) {
        logger.info('CV analysis cache hit');
        return cached;
      }

      const prompt = `
        Analyze this CV/Resume against the job requirements and provide a detailed assessment:

        CV Content:
        ${cvText}

        Job Requirements:
        ${jobRequirements.join(', ')}

        Please analyze and return a JSON response with the following structure:
        {
          "score": <overall score 0-100>,
          "strengths": [<list of candidate strengths>],
          "weaknesses": [<list of areas for improvement>],
          "recommendations": [<specific recommendations for the candidate>],
          "skillsMatch": {
            "matched": [<skills that match requirements>],
            "missing": [<required skills not found>],
            "score": <skills match score 0-100>
          },
          "experienceMatch": {
            "relevant": [<relevant experience found>],
            "score": <experience relevance score 0-100>
          },
          "summary": "<brief summary of the analysis>"
        }

        Focus on:
        1. Technical skills alignment
        2. Experience relevance
        3. Education background
        4. Soft skills indicators
        5. Career progression
        6. Cultural fit indicators

        Be constructive and specific in your feedback.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const analysis = this.parseJSONResponse<CVAnalysisResult>(text);
      
      // Cache result for 1 hour
      await cacheService.set(cacheKey, analysis, 3600);
      
      logger.info('CV analysis completed', { score: analysis.score });
      return analysis;

    } catch (error) {
      logger.error('CV analysis failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to analyze CV');
    }
  }

  // Job Matching Algorithm
  async findMatchingJobs(candidateProfile: any, availableJobs: any[]): Promise<JobMatchResult> {
    try {
      const cacheKey = `job_matching:${candidateProfile.id}:${Date.now().toString().substring(0, 8)}`;
      const cached = await cacheService.get<JobMatchResult>(cacheKey);
      
      if (cached) {
        logger.info('Job matching cache hit');
        return cached;
      }

      const prompt = `
        Find the best job matches for this candidate:

        Candidate Profile:
        - Skills: ${candidateProfile.skills?.join(', ') || 'Not specified'}
        - Experience: ${candidateProfile.experience || 'Not specified'}
        - Education: ${candidateProfile.education || 'Not specified'}
        - Preferences: ${JSON.stringify(candidateProfile.preferences || {})}

        Available Jobs:
        ${availableJobs.map(job => `
          Job ID: ${job.id}
          Title: ${job.title}
          Requirements: ${job.requirements?.join(', ') || 'Not specified'}
          Location: ${job.location}
          Type: ${job.jobType}
          Experience Level: ${job.experienceLevel}
        `).join('\n')}

        Analyze compatibility and return JSON:
        {
          "matchScore": <overall matching score 0-100>,
          "reasons": [<why this candidate fits the job market>],
          "recommendedJobs": [
            {
              "jobId": "<job_id>",
              "title": "<job_title>",
              "matchScore": <match score 0-100>,
              "reason": "<specific reason for this match>"
            }
          ]
        }

        Consider:
        1. Skills alignment
        2. Experience level match
        3. Location preferences
        4. Career growth potential
        5. Company culture fit
        6. Salary expectations vs offer

        Limit to top 5 matches and be specific about matching reasons.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const matchResult = this.parseJSONResponse<JobMatchResult>(text);
      
      // Cache for 30 minutes
      await cacheService.set(cacheKey, matchResult, 1800);
      
      logger.info('Job matching completed', { 
        candidateId: candidateProfile.id, 
        matches: matchResult.recommendedJobs.length 
      });
      
      return matchResult;

    } catch (error) {
      logger.error('Job matching failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to find job matches');
    }
  }

  // Intelligent Chatbot
  async handleChatQuery(message: string, context: any = {}): Promise<ChatResponse> {
    try {
      const cacheKey = `chat:${Buffer.from(message).toString('base64').substring(0, 32)}`;
      const cached = await cacheService.get<ChatResponse>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const prompt = `
        You are a helpful recruitment platform assistant. Respond to this user query:

        User Message: "${message}"
        
        Context:
        - User Type: ${context.userType || 'Unknown'}
        - Current Page: ${context.currentPage || 'Unknown'}
        - User History: ${JSON.stringify(context.userHistory || {})}

        Provide helpful, accurate information about:
        1. Job searching and application process
        2. CV/Resume optimization
        3. Interview preparation
        4. Company information
        5. Platform features and navigation
        6. Career advice

        Response format:
        {
          "message": "<your helpful response>",
          "suggestions": [<array of suggested follow-up questions>],
          "needsHumanAgent": <true if query requires human intervention>
        }

        Keep responses concise but helpful. If you can't help with something specific, suggest contacting support.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const chatResponse = this.parseJSONResponse<ChatResponse>(text);
      
      // Cache common queries for 1 hour
      if (message.length < 100) {
        await cacheService.set(cacheKey, chatResponse, 3600);
      }
      
      logger.info('Chat query processed', { messageLength: message.length });
      return chatResponse;

    } catch (error) {
      logger.error('Chat query failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      // Fallback response
      return {
        message: "I'm sorry, I'm having trouble understanding your request right now. Please try rephrasing your question or contact our support team for assistance.",
        suggestions: [
          "How do I apply for jobs?",
          "How can I improve my CV?",
          "What are the platform features?"
        ],
        needsHumanAgent: true
      };
    }
  }

  // Generate job descriptions
  async generateJobDescription(basicInfo: any): Promise<string> {
    try {
      const prompt = `
        Create a comprehensive job description based on this information:

        Position: ${basicInfo.title}
        Company: ${basicInfo.company}
        Location: ${basicInfo.location}
        Experience Level: ${basicInfo.experienceLevel}
        Job Type: ${basicInfo.jobType}
        Key Requirements: ${basicInfo.requirements?.join(', ') || 'Not specified'}
        Additional Info: ${basicInfo.additionalInfo || 'None'}

        Generate a professional job description including:
        1. Role summary
        2. Key responsibilities
        3. Required qualifications
        4. Preferred qualifications
        5. What we offer
        6. Application process

        Make it engaging and specific to attract the right candidates.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      logger.info('Job description generated', { title: basicInfo.title });
      return text;

    } catch (error) {
      logger.error('Job description generation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to generate job description');
    }
  }

  // Interview questions generation
  async generateInterviewQuestions(jobTitle: string, skills: string[], experienceLevel: string): Promise<string[]> {
    try {
      const prompt = `
        Generate 10 relevant interview questions for:
        
        Position: ${jobTitle}
        Required Skills: ${skills.join(', ')}
        Experience Level: ${experienceLevel}

        Include a mix of:
        1. Technical questions (40%)
        2. Behavioral questions (30%)
        3. Situational questions (20%)
        4. Company culture fit questions (10%)

        Return as a JSON array of strings.
        Example: ["Question 1", "Question 2", ...]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const questions = this.parseJSONResponse<string[]>(text);
      
      logger.info('Interview questions generated', { count: questions.length });
      return questions;

    } catch (error) {
      logger.error('Interview questions generation failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error('Failed to generate interview questions');
    }
  }

  // Helper method to parse JSON responses safely
  private parseJSONResponse<T>(text: string): T {
    try {
      // Clean the response text
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      logger.warn('Failed to parse JSON response, attempting to extract JSON', { text: text.substring(0, 200) });
      
      // Try to extract JSON from the text
      const jsonMatch = text.match(/\{.*\}/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          // If still fails, throw original error
        }
      }
      
      throw new Error('Invalid JSON response from AI service');
    }
  }
}

// Create singleton instance
export const geminiAI = new GeminiAIService();

export default GeminiAIService;
