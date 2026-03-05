// OpenRouter AI Service for BMTC Bus Assistant
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const MODEL = 'openai/gpt-3.5-turbo';
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
        content: `You are BusGuru, a helpful BMTC (Bangalore Metropolitan Transport Corporation) bus assistant. You help users with:

BMTC Bus System:
- Major bus routes in Bangalore (500, 335E, 201R, 600, etc.)
- Bus stops and landmarks (MG Road, Koramangala, Electronic City, Whitefield, etc.)
- Peak hours, crowd patterns, and travel tips
- Fare calculation and route suggestions

Your Capabilities:
- Route planning and suggestions
- Crowd prediction and alternatives
- Local transit tips
- Help during service disruptions

Communication Style:
- Friendly and helpful
- Provide clear, actionable advice
- Ask clarifying questions when needed
- Give multiple route options when possible

Bangalore Context:
- Familiar with local landmarks and neighborhoods
- Know about traffic patterns and peak hours
- Aware of IT corridors, malls, and popular destinations
- Know about metro connections

Help users find the best bus routes in Bangalore!`
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
      return "I'm having trouble connecting right now, but here are popular routes:\n\n• Route 500: Whitefield to MG Road\n• Route 335E: Electronic City to Koramangala\n• Route 201R: Indiranagar to Majestic\n\nPlease try again in a moment!";
    }
    
    if (lowerMessage.includes('fare') || lowerMessage.includes('cost')) {
      return "BMTC fares typically range from Rs.8-35 depending on distance. Use the fare calculator for exact amounts. Having connectivity issues right now!";
    }
    
    if (lowerMessage.includes('crowd') || lowerMessage.includes('busy')) {
      return "Peak hours are usually 8-10 AM and 6-8 PM. Try traveling earlier or later to avoid crowds. Please try again!";
    }

    return "I'm experiencing some technical difficulties. Please try again in a moment, or use the route search and real-time tracking features!";
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
export default aiService;
