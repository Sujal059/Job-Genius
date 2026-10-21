import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around the browser's native SpeechRecognition API (Chrome,
 * Edge, Safari — not Firefox, which doesn't implement it). Consumers should
 * check `isSupported` and fall back to a plain textarea when it's false.
 *
 * The real-world bug this fixes: Chrome silently ends a `continuous: true`
 * session after a pause in speech or roughly a minute, firing `onend` even
 * though the person never clicked stop. Without handling that, dictation
 * appears to "just stop working" partway through an answer — the button
 * still says "Stop recording" but nothing is being captured anymore. We
 * track whether the person *intends* to be listening in a ref, and if the
 * engine ends on its own while that's still true, we transparently restart
 * it so dictation keeps going until they actually click stop.
 */
export function useSpeechRecognition({ lang = "en-US" } = {}) {
  const [isSupported] = useState(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const shouldBeListeningRef = useRef(false);
  const restartTimerRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;

    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += `${chunk} `;
        } else {
          interim += chunk;
        }
      }
      setTranscript(`${finalTranscriptRef.current}${interim}`.trim());
    };

    recognition.onerror = (event) => {
      // "no-speech" fires constantly on silence in continuous mode — not a
      // real error, and onend (below) already handles resuming from it.
      if (event.error !== "no-speech") setError(event.error);
    };

    recognition.onend = () => {
      if (shouldBeListeningRef.current) {
        // Engine stopped on its own — the person is still trying to
        // dictate, so pick back up automatically instead of silently
        // dropping their answer.
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Already running or the tab lost focus — the next explicit
            // startListening() call will recover this cleanly.
          }
        }, 250);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      shouldBeListeningRef.current = false;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [isSupported, lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    shouldBeListeningRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      setError(err.message);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return { isSupported, isListening, transcript, error, startListening, stopListening, resetTranscript };
}

export default useSpeechRecognition;
