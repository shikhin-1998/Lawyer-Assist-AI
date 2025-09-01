import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Pause, Play, RotateCcw, Clock, Save } from 'lucide-react';

export type RecordingState = 'idle' | 'requesting-permission' | 'recording' | 'paused' | 'error';

export interface MicRecorderProps {
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onChunk?: (text: string) => void;
  onError?: (error: string) => void;
  onClear?: () => void;
  onInsertTimestamp?: () => void;
  onSaveDraft?: () => void;
}

const MicRecorder: React.FC<MicRecorderProps> = ({
  onStart,
  onStop,
  onPause,
  onResume,
  onChunk,
  onError,
  onClear,
  onInsertTimestamp,
  onSaveDraft,
}) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vuMeterRef = useRef<HTMLDivElement>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsWebSpeechSupported(!!SpeechRecognition);
  }, []);

  // Mock streaming function
  const startMockStreaming = useCallback(() => {
    // Mock legal text for demonstration
    const mockLegalText = [
      "This agreement is entered into on this date between the parties.",
      "The contractor shall provide services in accordance with the terms outlined herein.",
      "Payment shall be made within thirty days of receipt of invoice.",
      "Either party may terminate this agreement with written notice.",
      "Confidential information shall not be disclosed to third parties.",
      "The governing law for this agreement shall be the state of California.",
      "Any disputes arising from this agreement shall be resolved through arbitration.",
      "This agreement constitutes the entire understanding between the parties.",
      "Amendments to this agreement must be made in writing and signed by both parties.",
      "The parties acknowledge that they have read and understood all terms and conditions."
    ];

    let currentSentenceIndex = 0;
    let currentCharIndex = 0;
    let currentSentence = mockLegalText[currentSentenceIndex];

    mockIntervalRef.current = setInterval(() => {
      if (currentCharIndex < currentSentence.length) {
        const newChar = currentSentence[currentCharIndex];
        onChunk?.(newChar);
        currentCharIndex++;
      } else {
        // Move to next sentence
        onChunk?.(' ');
        currentSentenceIndex = (currentSentenceIndex + 1) % mockLegalText.length;
        currentSentence = mockLegalText[currentSentenceIndex];
        currentCharIndex = 0;
      }
    }, 150); // Simulate typing speed
  }, [onChunk]);

  const stopMockStreaming = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);

  // Timer function
  const startTimer = useCallback(() => {
    timeIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  }, []);

  // VU Meter animation
  useEffect(() => {
    if (state === 'recording' && vuMeterRef.current) {
      const animateVU = () => {
        if (vuMeterRef.current) {
          const intensity = Math.random() * 100;
          vuMeterRef.current.style.width = `${intensity}%`;
        }
      };
      
      const vuInterval = setInterval(animateVU, 100);
      return () => clearInterval(vuInterval);
    }
  }, [state]);

  // Web Speech API setup
  const setupWebSpeech = useCallback(() => {
    if (!isWebSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setState('recording');
      onStart?.();
      startTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onChunk?.(finalTranscript + ' ');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setState('error');
      stopTimer();
      onError?.(event.error);
    };

    recognition.onend = () => {
      if (state === 'recording') {
        setState('idle');
        stopTimer();
        onStop?.();
      }
    };
  }, [isWebSpeechSupported, onStart, onStop, onChunk, onError, state, startTimer, stopTimer]);

  useEffect(() => {
    setupWebSpeech();
  }, [setupWebSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMockStreaming();
      stopTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stopMockStreaming, stopTimer]);

  const handleStartRecording = async () => {
    try {
      setState('requesting-permission');
      
      if (isWebSpeechSupported && recognitionRef.current) {
        await recognitionRef.current.start();
      } else {
        // Use mock streaming
        setState('recording');
        onStart?.();
        startTimer();
        startMockStreaming();
      }
    } catch (error) {
      setState('error');
      onError?.('Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    if (isWebSpeechSupported && recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      stopMockStreaming();
    }
    
    setState('idle');
    stopTimer();
    onStop?.();
  };

  const handlePauseRecording = () => {
    if (isWebSpeechSupported && recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      stopMockStreaming();
    }
    
    setState('paused');
    stopTimer();
    onPause?.();
  };

  const handleResumeRecording = () => {
    if (isWebSpeechSupported && recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      startMockStreaming();
    }
    
    setState('recording');
    startTimer();
    onResume?.();
  };

  const handleClear = () => {
    setRecordingTime(0);
    onClear?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getButtonIcon = () => {
    switch (state) {
      case 'recording':
        return <Square className="h-5 w-5" />;
      case 'paused':
        return <Play className="h-5 w-5" />;
      default:
        return <Mic className="h-5 w-5" />;
    }
  };

  const getButtonText = () => {
    switch (state) {
      case 'recording':
        return 'Stop';
      case 'paused':
        return 'Resume';
      case 'requesting-permission':
        return 'Requesting...';
      default:
        return 'Start Recording';
    }
  };

  const getButtonColor = () => {
    switch (state) {
      case 'recording':
        return 'bg-red-600 hover:bg-red-700';
      case 'paused':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-gray-600 hover:bg-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Voice Recording
        </h3>
        {state === 'recording' && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {/* VU Meter */}
      {state === 'recording' && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Audio Level</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                ref={vuMeterRef}
                className="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-100"
                style={{ width: '0%' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={
            state === 'recording'
              ? handleStopRecording
              : state === 'paused'
              ? handleResumeRecording
              : handleStartRecording
          }
          disabled={state === 'requesting-permission'}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </button>
        
        {state === 'recording' && (
          <button
            onClick={handlePauseRecording}
            className="ml-3 p-3 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
          >
            <Pause className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Floating Toolbar */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <button
          onClick={handleClear}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Clear</span>
        </button>
        
        <button
          onClick={onInsertTimestamp}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Clock className="h-4 w-4" />
          <span className="text-sm">Timestamp</span>
        </button>
        
        <button
          onClick={onSaveDraft}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span className="text-sm">Save Draft</span>
        </button>
      </div>

      {/* Status */}
      <div className="text-center">
        {state === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Recording failed. Please try again.
          </p>
        )}
        {!isWebSpeechSupported && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Using mock transcription (Web Speech API not available)
          </p>
        )}
      </div>
    </div>
  );
};

export default MicRecorder;
