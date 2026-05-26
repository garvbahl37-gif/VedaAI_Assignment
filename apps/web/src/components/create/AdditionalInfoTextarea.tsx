'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface AdditionalInfoTextareaProps {
  value: string;
  onChange: (v: string) => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string; isFinal?: boolean }> & { isFinal: boolean }> }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function AdditionalInfoTextarea({
  value,
  onChange,
}: AdditionalInfoTextareaProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef<string>('');

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setSupported(false);
      setErrorMsg('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setErrorMsg(null);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    baseTextRef.current = value.trim().length > 0 ? value.replace(/\s+$/, '') + ' ' : '';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) {
        baseTextRef.current += finalText;
        onChange(baseTextRef.current.trimStart());
      } else {
        onChange((baseTextRef.current + interimText).trimStart());
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setErrorMsg('Microphone permission denied. Allow it in your browser address bar.');
      } else if (event.error === 'no-speech') {
        setErrorMsg("Didn't catch that. Try speaking again.");
      } else if (event.error === 'network') {
        setErrorMsg('Network error. Voice input needs an internet connection.');
      } else if (event.error !== 'aborted') {
        setErrorMsg(`Voice input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setErrorMsg('Could not start voice input.');
    }
  }, [value, onChange]);

  const handleClick = () => {
    if (listening) stopListening();
    else startListening();
  };

  return (
    <div className="space-y-2">
      <label className="text-[14px] text-ink">
        <span className="font-bold">Additional Information</span>{' '}
        <span className="text-ink-muted font-normal">(For better output)</span>
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="e.g Generate a question paper for 3 hour exam duration..."
          className="w-full rounded-2xl bg-white border-[1.5px] border-dashed border-line px-5 py-4 pr-14 text-[13.5px] text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand resize-none"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={!supported}
          className={cn(
            'absolute bottom-3.5 right-3.5 h-8 w-8 rounded-full flex items-center justify-center transition-colors',
            listening
              ? 'bg-red-500 text-white animate-pulse'
              : 'hover:bg-surface-subtle text-ink-muted',
            !supported && 'opacity-40 cursor-not-allowed',
          )}
          aria-label={
            !supported
              ? 'Voice input not supported'
              : listening
                ? 'Stop voice input'
                : 'Start voice input'
          }
          title={
            !supported
              ? 'Voice input not supported in this browser'
              : listening
                ? 'Click to stop'
                : 'Click to dictate'
          }
        >
          {supported ? <Mic size={16} strokeWidth={1.7} /> : <MicOff size={16} strokeWidth={1.7} />}
        </button>
      </div>
      {listening && (
        <p className="text-[12px] text-red-500 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          Listening… click the mic again to stop.
        </p>
      )}
      {errorMsg && !listening && (
        <p className="text-[12px] text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
