import { toast } from 'react-hot-toast';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
}

class VoiceService {
  private recognition: any;
  private synthesis: SpeechSynthesisUtterance;
  private isListening: boolean = false;
  private commands: VoiceCommand[] = [];
  private language: string = 'en-US';

  constructor() {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.setupRecognition();
    }

    this.synthesis = new SpeechSynthesisUtterance();
    this.setupDefaultCommands();
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice command received:', transcript);
      this.processCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable microphone permissions.');
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  private setupDefaultCommands() {
    // Navigation commands
    this.addCommand(/^(go to|navigate to|open) (.+)$/, (matches) => {
      const destination = matches[2];
      this.speak(`Navigating to ${destination}`);
      // Trigger navigation action
      window.dispatchEvent(new CustomEvent('voice-navigate', { detail: destination }));
    });

    // Bus search commands
    this.addCommand(/^(show|find|search) bus (.+)$/, (matches) => {
      const busNumber = matches[2];
      this.speak(`Searching for bus ${busNumber}`);
      window.dispatchEvent(new CustomEvent('voice-search-bus', { detail: busNumber }));
    });

    // Route search commands
    this.addCommand(/^(find route|route) from (.+) to (.+)$/, (matches) => {
      const from = matches[2];
      const to = matches[3];
      this.speak(`Finding route from ${from} to ${to}`);
      window.dispatchEvent(new CustomEvent('voice-search-route', { detail: { from, to } }));
    });

    // Help command
    this.addCommand(/^(help|what can you do|commands)$/, () => {
      this.speak('You can say: Show bus followed by bus number, Find route from location to location, or Navigate to a page like home or tracking');
    });

    // Language switching
    this.addCommand(/^(switch to|change language to) (.+)$/, (matches) => {
      const language = matches[2];
      this.speak(`Switching language to ${language}`);
      window.dispatchEvent(new CustomEvent('voice-change-language', { detail: language }));
    });

    // Refresh command
    this.addCommand(/^(refresh|reload|update)$/, () => {
      this.speak('Refreshing data');
      window.dispatchEvent(new CustomEvent('voice-refresh'));
    });
  }

  public setLanguage(langCode: string) {
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'kn': 'kn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN'
    };
    
    this.language = langMap[langCode] || 'en-US';
    if (this.recognition) {
      this.recognition.lang = this.language;
    }
    this.synthesis.lang = this.language;
  }

  public addCommand(pattern: RegExp, action: (matches: RegExpMatchArray) => void) {
    this.commands.push({ pattern, action });
  }

  private processCommand(transcript: string) {
    for (const command of this.commands) {
      const matches = transcript.match(command.pattern);
      if (matches) {
        command.action(matches);
        return;
      }
    }
    
    // No matching command found
    this.speak("Sorry, I didn't understand that command. Say 'help' for available commands.");
  }

  public startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        toast.error('Voice commands not supported in your browser');
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;
      this.recognition.start();
      toast.success('Listening... Speak now');
      resolve();
    });
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public speak(text: string) {
    if ('speechSynthesis' in window) {
      this.synthesis.text = text;
      window.speechSynthesis.speak(this.synthesis);
    }
  }

  public isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  public getListeningState(): boolean {
    return this.isListening;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
