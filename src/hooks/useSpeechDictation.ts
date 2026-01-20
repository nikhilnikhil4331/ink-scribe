import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// The Web Speech API types are not always available in TS configs, so we keep them minimal.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognition = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionEvent = any;

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type DictationStatus = "idle" | "listening" | "error";

export interface UseSpeechDictationOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  /** Called when a final transcript segment is produced */
  onFinalTranscript?: (text: string) => void;
}

export interface UseSpeechDictationReturn {
  isSupported: boolean;
  status: DictationStatus;
  isListening: boolean;
  interimTranscript: string;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechDictation(options: UseSpeechDictationOptions = {}): UseSpeechDictationReturn {
  const {
    lang = "en-US",
    interimResults = true,
    continuous = true,
    onFinalTranscript,
  } = options;

  const recognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const isSupported = !!recognitionCtor;

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [status, setStatus] = useState<DictationStatus>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setInterimTranscript("");
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(async () => {
    if (!recognitionCtor) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      setStatus("error");
      return;
    }

    setErrorMessage(null);
    setInterimTranscript("");
    setStatus("listening");

    // Create a new instance every time for more predictable state
    const recognition = new recognitionCtor();
    recognitionRef.current = recognition;

    recognition.lang = lang;
    recognition.interimResults = interimResults;
    recognition.continuous = continuous;

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";

        if (result.isFinal) {
          const finalText = text.trim();
          if (finalText) onFinalTranscript?.(finalText);
          setInterimTranscript("");
        } else {
          interim += text;
        }
      }

      if (interimResults) {
        setInterimTranscript(interim.trim());
      }
    };

    recognition.onerror = (event) => {
      // Keep it user-friendly; don't leak raw event objects
      setErrorMessage(event.error === "not-allowed" ? "Microphone access is blocked." : "Dictation error. Please try again.");
      setStatus("error");
    };

    recognition.onend = () => {
      // If we ended without an explicit error, return to idle.
      setStatus((prev) => (prev === "error" ? "error" : "idle"));
    };

    recognition.start();
  }, [continuous, interimResults, lang, onFinalTranscript, recognitionCtor]);

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, []);

  return {
    isSupported,
    status,
    isListening: status === "listening",
    interimTranscript,
    errorMessage,
    start,
    stop,
    reset,
  };
}
