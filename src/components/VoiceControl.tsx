import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

const VoiceControl: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
    
    // Update voice service language when i18n language changes
    voiceService.setLanguage(i18n.language);
  }, [i18n.language]);

  const toggleListening = async () => {
    if (!isSupported) {
      toast.error(t('voice.notSupported'));
      return;
    }

    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      try {
        await voiceService.startListening();
        setIsListening(true);
        
        // Auto-stop after 5 seconds
        setTimeout(() => {
          if (voiceService.getListeningState()) {
            voiceService.stopListening();
            setIsListening(false);
          }
        }, 5000);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleListening}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all transform hover:scale-110 z-50 ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-blue-600 hover:bg-blue-700'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start voice command'}
    >
      {isListening ? (
        <MicOff className="h-6 w-6 text-white" />
      ) : (
        <Mic className="h-6 w-6 text-white" />
      )}
    </button>
  );
};

export default VoiceControl;
