/**
 * AI-Enhanced Bus Buddy Service
 * Uses GPT-OSS-20B for intelligent commute suggestions
 */

const axios = require('axios');

class AIEnhancedBusBuddy {
  constructor() {
    this.API_KEY = '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';
    this.MODEL = 'openai/gpt-oss-20b:free';
    this.API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  }

  /**
   * Generate AI-powered commute suggestion
   */
  async generateAISuggestion(context) {
    try {
      const {
        userPatterns = [],
        currentWeather = null,
        crowdPrediction = null,
        userPreferences = {},
        currentTime = new Date(),
        userQuestion = null
      } = context;

      // Build context for AI
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(context);

      const response = await axios.post(
        this.API_URL,
        {
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'Bus Buddy AI - Where Is My Bus'
          }
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content || '';
      
      return {
        success: true,
        aiSuggestion: aiResponse,
        source: 'ai',
        model: this.MODEL,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('AI Enhanced Bus Buddy Error:', error.message);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Build system prompt for AI
   */
  buildSystemPrompt() {
    return `You are an intelligent AI assistant for "Bus Buddy" - a smart commute planning system for bus travelers in India.

Your role is to analyze commute patterns, weather conditions, crowd predictions, and user preferences to provide intelligent, personalized suggestions.

CAPABILITIES:
- Analyze user's historical commute patterns
- Consider real-time weather conditions
- Factor in crowd predictions using ML models
- Respect user preferences (AC buses, less crowded, faster routes)
- Provide multi-factor intelligent recommendations
- Explain reasoning clearly and concisely

RESPONSE FORMAT:
1. Start with a clear recommendation
2. Provide reasoning based on data
3. Mention alternatives if applicable
4. Show confidence level based on data quality
5. Keep it friendly but professional
6. Be concise and helpful

TONE:
- Helpful and intelligent
- Data-driven but human
- Clear and actionable
- Confident but not overconfident

Remember: Your goal is to make the user's commute smoother, safer, and more predictable!`;
  }

  /**
   * Build user prompt with context
   */
  buildUserPrompt(context) {
    const {
      userPatterns = [],
      currentWeather = null,
      crowdPrediction = null,
      userPreferences = {},
      currentTime = new Date(),
      userQuestion = null
    } = context;

    let prompt = '';

    // User question (if any)
    if (userQuestion) {
      prompt += `USER QUESTION: "${userQuestion}"\n\n`;
    }

    // Current context
    prompt += `CURRENT TIME: ${currentTime.toLocaleString('en-US', { 
      weekday: 'long', 
      hour: 'numeric', 
      minute: '2-digit' 
    })}\n\n`;

    // User patterns
    if (userPatterns.length > 0) {
      prompt += `USER'S COMMUTE PATTERNS:\n`;
      userPatterns.forEach((pattern, idx) => {
        prompt += `${idx + 1}. Route ${pattern.route_number || pattern.routeNumber} (${pattern.route_name || pattern.routeName})\n`;
        prompt += `   - Typical time: ${pattern.typical_departure_time || pattern.typicalDepartureTime}\n`;
        prompt += `   - Frequency: ${pattern.frequency} trips\n`;
        prompt += `   - Days: ${(pattern.typical_days || pattern.typicalDays || []).join(', ')}\n`;
        prompt += `   - Avg duration: ${pattern.average_duration || pattern.averageDuration} mins\n`;
      });
      prompt += '\n';
    }

    // Weather info
    if (currentWeather) {
      prompt += `CURRENT WEATHER:\n`;
      prompt += `- Condition: ${currentWeather.condition}\n`;
      prompt += `- Temperature: ${Math.round(currentWeather.temperature)}°C\n`;
      prompt += `- Humidity: ${currentWeather.humidity}%\n`;
      if (currentWeather.rain1h > 0) {
        prompt += `- Rain: ${currentWeather.rain1h}mm in last hour ⚠️\n`;
      }
      prompt += '\n';
    }

    // Crowd prediction
    if (crowdPrediction) {
      prompt += `CROWD PREDICTION:\n`;
      prompt += `- Level: ${crowdPrediction.crowdLevel}\n`;
      prompt += `- Percentage: ${crowdPrediction.predictedCrowdPercentage}%\n`;
      prompt += `- Confidence: ${(crowdPrediction.confidence * 100).toFixed(0)}%\n`;
      if (crowdPrediction.factors) {
        prompt += `- Rush hour: ${crowdPrediction.factors.isRushHour ? 'Yes ⚠️' : 'No'}\n`;
        prompt += `- Events nearby: ${crowdPrediction.factors.hasEvents ? 'Yes' : 'No'}\n`;
        prompt += `- Weather impact: ${crowdPrediction.factors.weatherImpact ? 'Yes' : 'No'}\n`;
      }
      prompt += '\n';
    }

    // User preferences
    if (Object.keys(userPreferences).length > 0) {
      prompt += `USER PREFERENCES:\n`;
      if (userPreferences.preferAC !== undefined) prompt += `- Prefers AC buses: ${userPreferences.preferAC ? 'Yes' : 'No'}\n`;
      if (userPreferences.preferLessCrowded !== undefined) prompt += `- Prefers less crowded: ${userPreferences.preferLessCrowded ? 'Yes' : 'No'}\n`;
      if (userPreferences.preferFasterRoute !== undefined) prompt += `- Prefers faster route: ${userPreferences.preferFasterRoute ? 'Yes' : 'No'}\n`;
      if (userPreferences.maxWalkingDistance) prompt += `- Max walking distance: ${userPreferences.maxWalkingDistance}m\n`;
      prompt += '\n';
    }

    // Task
    if (userQuestion) {
      prompt += `Please answer the user's question based on the data above. Be specific and actionable.`;
    } else {
      prompt += `Based on the above data, provide an intelligent commute suggestion for the user right now. Should they leave? Wait? Take an alternative route? Explain your reasoning clearly.`;
    }

    return prompt;
  }

  /**
   * Chat with AI about commute
   */
  async chatWithAI(userMessage, context) {
    context.userQuestion = userMessage;
    return await this.generateAISuggestion(context);
  }

  /**
   * Get smart explanation for a suggestion
   */
  async explainSuggestion(suggestion, context) {
    const explainContext = {
      ...context,
      userQuestion: `Why are you suggesting: "${suggestion}"? Explain the reasoning behind this recommendation.`
    };
    return await this.generateAISuggestion(explainContext);
  }
}

module.exports = new AIEnhancedBusBuddy();

