import { GoogleGenAI } from '@google/genai';
import logger from '../utils/logger.js';

// Initialize the Gemini Client as a singleton to ensure dotenv is loaded first
let genAIInstance = null;

const getGenAI = () => {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }
    // New SDK initialization
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
};

// Using the 2026 stable preview model
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Core function to call Gemini API using the 2026 unified SDK syntax
 */
const callGemini = async (systemPrompt, userMessage) => {
  const startTime = Date.now();
  const ai = getGenAI();

  try {
    // New SDK syntax: direct call to models.generateContent
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json", // Native JSON mode
        temperature: 0.2,
      },
    });

    const processingTime = Date.now() - startTime;

    return {
      content: response.text, // Result is a direct text property in the new SDK
      inputTokens: response.usageMetadata?.promptTokenCount || 0,
      outputTokens: response.usageMetadata?.candidatesTokenCount || 0,
      processingTime,
    };
  } catch (error) {
    logger.error('Gemini API Error:', error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
};

/**
 * Main meeting analysis function
 */
const analyzeMeeting = async (transcript, title, participants = []) => {
  const systemPrompt = `You are RecallIQ AI — an elite meeting intelligence engine. 
Detect explicit and HIDDEN decisions, assign risk scores, and track accountability.
Return ONLY valid JSON.`;

  const userMessage = `Analyze this meeting transcript:
TITLE: ${title}
PARTICIPANTS: ${participants.join(', ')}
TRANSCRIPT: ${transcript}

Required JSON structure: {
  "summary": "string",
  "keyTopics": ["string"],
  "sentiment": "positive|neutral|negative|mixed",
  "overallRiskScore": number,
  "actionItems": [{ "title": "string", "assignee": "string", "dueDate": "string", "riskScore": number }],
  "decisions": [{ "description": "string", "type": "explicit|implicit|hidden", "impact": "low|medium|high" }],
  "followUpEmail": { "subject": "string", "body": "string" }
}`;

  logger.info(`Gemini Analysis Starting: "${title}"`);

  const result = await callGemini(systemPrompt, userMessage);

  // result.content is already a string; parse it directly
  const parsed = JSON.parse(result.content);

  return {
    ...parsed,
    processingTime: result.processingTime,
    tokens: {
      input: result.inputTokens,
      output: result.outputTokens,
    },
  };
};

/**
 * Operational credit logic
 */
const calculateCredits = (transcriptLength) => {
  const wordCount = transcriptLength / 5;
  return wordCount < 500 ? 10 : 20;
};

/**
 * Generate follow-up email
 */
const generateEmail = async (meeting) => {
  const systemPrompt = `You are an expert executive assistant. Write a professional follow-up email based on the meeting details provided.`;
  const userMessage = `
    Meeting Title: ${meeting.title}
    Date: ${new Date(meeting.meetingDate).toLocaleDateString()}
    Participants: ${meeting.participants.join(', ')}
    Summary: ${meeting.summary}
    Action Items: ${JSON.stringify(meeting.actionItems)}
    Decisions: ${JSON.stringify(meeting.decisions)}
    
    Return ONLY valid JSON with this structure:
    {
      "subject": "string",
      "body": "string (HTML format preferred)"
    }
  `;

  const result = await callGemini(systemPrompt, userMessage);
  const parsed = JSON.parse(result.content);
  return parsed; // Return object { subject, body } or string depending on implementation
};

export default {
  analyzeMeeting,
  calculateCredits,
  generateEmail,
};