import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Sparkles, X, Loader2, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { aiService } from '../../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteSelect?: (routeId: string) => void;
  onStopSelect?: (stopId: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isOpen, 
  onClose,
  onRouteSelect,
  onStopSelect
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🙏 Namaste! I'm **BusGuru**, your wise BMTC companion! With years of virtual experience navigating Bangalore's bus system, I'm here to guide you:\n\n🗺️ **Route Mastery** - I know every BMTC route like the back of my hand\n⏰ **Real-time Wisdom** - Live updates on delays, crowds, and alternatives\n💰 **Fare Expertise** - Exact costs and money-saving tips\n🎯 **Local Insights** - Insider knowledge of Bangalore's transit\n📍 **Guru Guidance** - The best routes, timings, and travel hacks\n\nAsk your BusGuru anything - I'm here to enlighten your journey! 🚌✨",
      sender: 'assistant',
      timestamp: new Date(),
      suggestions: aiService.getSuggestions()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Process user input with AI
  const processUserInput = async (text: string) => {
    const lowerText = text.toLowerCase();
    let response = '';
    let suggestions: string[] = [];

    // Simulate AI processing with pattern matching
    if (lowerText.includes('route') || lowerText.includes('bus to') || lowerText.includes('how to reach')) {
      const destination = extractDestination(text);
      response = `I found several bus routes to ${destination}:\n\n` +
        `🚌 Route 500: Direct bus, arrives in 5 mins\n` +
        `🚌 Route 335E: Via Silk Board, arrives in 8 mins\n` +
        `🚌 Route 201R: Express service, arrives in 12 mins\n\n` +
        `Would you like to track any of these buses?`;
      suggestions = ['Track Route 500', 'Show on map', 'Check timings', 'Find alternatives'];
    } else if (lowerText.includes('nearby') || lowerText.includes('near me')) {
      response = `Here are the nearest bus stops:\n\n` +
        `📍 Indiranagar Metro (150m away)\n` +
        `📍 100 Feet Road (300m away)\n` +
        `📍 Domlur Bus Stop (500m away)\n\n` +
        `Tap on any stop to see buses arriving there.`;
      suggestions = ['Show on map', 'Walking directions', 'Bus timings', 'Save favorites'];
    } else if (lowerText.includes('fare') || lowerText.includes('cost') || lowerText.includes('price')) {
      response = `Fare calculation:\n\n` +
        `🎫 Ordinary Bus: ₹15 - ₹35\n` +
        `🎫 Volvo AC Bus: ₹35 - ₹85\n` +
        `🎫 Express Service: ₹25 - ₹55\n\n` +
        `The exact fare depends on the distance. Would you like to calculate fare for a specific route?`;
      suggestions = ['Calculate exact fare', 'Show pass options', 'Payment methods', 'Student discount'];
    } else if (lowerText.includes('schedule') || lowerText.includes('timing') || lowerText.includes('when')) {
      response = `Bus Schedule Information:\n\n` +
        `🕐 First bus: 5:00 AM\n` +
        `🕑 Last bus: 11:30 PM\n` +
        `🕓 Peak hours: Every 10-15 mins\n` +
        `🕕 Off-peak: Every 20-30 mins\n\n` +
        `Which route's schedule would you like to check?`;
      suggestions = ['Morning buses', 'Evening buses', 'Weekend schedule', 'Holiday timings'];
    } else if (lowerText.includes('crowd') || lowerText.includes('seat') || lowerText.includes('full')) {
      response = `Current crowd levels:\n\n` +
        `🟢 Route 500: Low crowd (seats available)\n` +
        `🟡 Route 335E: Moderate (few seats)\n` +
        `🔴 Route 201R: High (standing room only)\n\n` +
        `Our AI predicts crowd levels based on historical data and real-time sensors.`;
      suggestions = ['Less crowded buses', 'Best travel time', 'Crowd predictions', 'Alert me'];
    } else if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      response = `I can help you with:\n\n` +
        `🚌 Finding the best bus routes\n` +
        `📍 Locating nearby bus stops\n` +
        `⏰ Checking bus schedules\n` +
        `💰 Calculating fares\n` +
        `👥 Crowd level predictions\n` +
        `🗺️ Real-time bus tracking\n` +
        `🎫 Pass and ticket information\n\n` +
        `Just ask me anything about bus travel!`;
      suggestions = ['Find a bus', 'Track my bus', 'Plan a trip', 'Show examples'];
    } else {
      // Default intelligent response
      response = `I understand you're asking about "${text}". Let me help you with that.\n\n` +
        `Based on your query, you might be interested in:\n` +
        `• Finding specific bus routes\n` +
        `• Checking real-time locations\n` +
        `• Planning your journey\n\n` +
        `Could you please be more specific about what you need?`;
      suggestions = ['Show all routes', 'Nearby stops', 'Popular destinations', 'Help'];
    }

    return { response, suggestions };
  };

  // Extract destination from user input
  const extractDestination = (text: string): string => {
    const commonPlaces = ['MG Road', 'Whitefield', 'Electronic City', 'Airport', 'Majestic'];
    for (const place of commonPlaces) {
      if (text.toLowerCase().includes(place.toLowerCase())) {
        return place;
      }
    }
    // Extract text after "to" or "reach"
    const match = text.match(/(?:to|reach)\s+([A-Za-z\s]+)/i);
    return match ? match[1].trim() : 'your destination';
  };

  // Handle sending message with real AI
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get current context for better AI responses
      const context = {
        timestamp: new Date().toISOString(),
        userLocation: 'Bangalore',
        currentTime: new Date().toLocaleTimeString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      };

      // Send message to real AI service (Llama 3.3 8B)
      const aiResponse = await aiService.sendMessage(currentInput, context);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
        suggestions: aiService.getSuggestions()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🚌 I'm having trouble connecting to the AI service right now, but I'm here to help! Try asking about:\n\n• Bus routes to specific locations\n• Real-time delays and alternatives\n• Fare calculations\n• Crowd information\n\nPlease try again in a moment! 😊",
        sender: 'assistant',
        timestamp: new Date(),
        suggestions: aiService.getSuggestions()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 right-0 md:bottom-4 md:right-4 w-full md:w-96 h-[600px] z-50"
      >
        <GlassCard className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center">
                    <span className="text-lg mr-2">🧘‍♂️</span>
                    BusGuru
                  </h3>
                  <p className="text-xs opacity-90">Your BMTC Expert</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-full ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className={`p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}>
                      <p className="whitespace-pre-line text-sm">{message.text}</p>
                    </div>
                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-gray-500"
              >
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;
