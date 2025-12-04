// OpenRouter AI Service for BMTC Bus Assistant
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MODEL = 'meta-llama/llama-3.3-8b-instruct:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private conversationHistory: AIMessage[] = [];

  constructor() {
    // Initialize with system prompt for BMTC bus assistant
    this.conversationHistory = [
      {
        role: 'system',
        content: `You are BusGuru, a wise and knowledgeable BMTC (Bangalore Metropolitan Transport Corporation) bus expert. You have deep wisdom about Bangalore's public transport system. Your expertise includes:

🚌 BMTC Bus System Knowledge:
- All major bus routes in Bangalore (500, 335E, 201R, 600, etc.)
- Bus stops and landmarks (MG Road, Koramangala, Electronic City, Whitefield, etc.)
- Peak hours, crowd patterns, and travel tips
- Fare calculation and route optimization
- Real-time delays and alternative suggestions

🎯 Your Capabilities:
- Route planning and suggestions
- Real-time problem solving
- Crowd prediction and alternatives
- Local transit tips and tricks
- Emergency assistance during disruptions
- Natural language understanding of locations

💬 Communication Style:
- Wise, patient, and knowledgeable like a guru
- Friendly but authoritative - you're the expert
- Use emojis appropriately, especially 🚌 🙏 ✨
- Provide specific, actionable advice with confidence
- Ask clarifying questions when needed
- Give multiple options with expert recommendations
- Occasionally use terms like "As your BusGuru..." or "Let me guide you..."

🏙️ Bangalore Context:
- Understand local landmarks, areas, and neighborhoods
- Know about traffic patterns and peak hours
- Familiar with IT corridors, malls, and popular destinations
- Aware of metro connections and integration

Always be helpful, accurate, and focused on solving the user's transit needs in Bangalore! You are BusGuru - the ultimate BMTC wisdom keeper!`
      }
    ];
  }

  async sendMessage(userMessage: string, context?: any): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Add context if provided (current location, selected route, etc.)
      let contextualMessage = userMessage;
      if (context) {
        contextualMessage = `${userMessage}\n\nCurrent Context: ${JSON.stringify(context)}`;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BMTC Bus Tracker'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...this.conversationHistory.slice(0, -1), // All except the last user message
            {
              role: 'user',
              content: contextualMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 11) { // 1 system + 10 conversation messages
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-10) // Keep last 10 messages
        ];
      }

      return assistantMessage;

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple fallback responses for common queries
    if (lowerMessage.includes('route') || lowerMessage.includes('bus')) {
      return "🚌 I'm having trouble connecting to the AI service right now, but I can help with basic route information. Popular routes include:\n\n• Route 500: Whitefield ↔ MG Road\n• Route 335E: Electronic City ↔ Koramangala\n• Route 201R: Indiranagar ↔ Majestic\n\nPlease try again in a moment for more detailed assistance!";
    }
    
    if (lowerMessage.includes('fare') || lowerMessage.includes('cost')) {
      return "💰 BMTC fares typically range from ₹8-35 depending on distance. Use the fare calculator in the app for exact amounts. Sorry, I'm having connectivity issues with the AI service right now!";
    }
    
    if (lowerMessage.includes('crowd') || lowerMessage.includes('busy')) {
      return "👥 Peak hours are usually 8-10 AM and 6-8 PM. Try traveling slightly earlier or later to avoid crowds. I'm experiencing some technical difficulties - please try again!";
    }

    return "🤖 I'm experiencing some technical difficulties connecting to the AI service. Please try again in a moment, or use the other features in the app like route search and real-time tracking!";
  }

  clearHistory(): void {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // Keep only system message
  }

  // Get smart suggestions based on common BMTC queries
  getSuggestions(): string[] {
    const suggestions = [
      "Guide me from Whitefield to MG Road",
      "What's the wisest route to Electronic City?",
      "Guru, check crowd levels on Route 500",
      "Calculate fare from Koramangala to Majestic",
      "Show me nearby bus stops",
      "Which buses reach Brigade Road?",
      "Best alternatives during peak hours",
      "How to reach Airport by bus, Guru?"
    ];

    // Return 4 random suggestions
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
}

export const aiService = new AIService();
