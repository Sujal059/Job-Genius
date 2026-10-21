import { useCallback, useEffect, useRef, useState } from "react";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-converter";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";
import * as faceDetection from "@tensorflow-models/face-detection";

const NO_FACE_TIMEOUT_MS = 5000;
const DETECTION_INTERVAL_MS = 1000;

// Cached at module scope — the detector is stateless and expensive to
// load (downloads a model), so every page that proctors a test shares one
// instance instead of reloading it per mount.
let sharedDetectorPromise = null;
function getDetector() {
  if (!sharedDetectorPromise) {
    sharedDetectorPromise = (async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      return faceDetection.createDetector(model, { runtime: "tfjs" });
    })();
  }
  return sharedDetectorPromise;
}

/**
 * useFaceMonitor
 * ---------------
 * This is face *detection* (is a face present in frame?), not face
 * *recognition* (who is it?) — that's the right tool for "did they leave
 * the camera", and it's lighter/faster/more reliable than full identity
 * verification would be. Everything runs locally in the browser via
 * TensorFlow.js — no video frame is ever sent to the server.
 *
 * Calls onViolation("face-not-detected") once, the first time no face has
 * been visible for NO_FACE_TIMEOUT_MS continuously. After that it stops
 * evaluating (the caller is expected to end the test).
 *
 * @param {{enabled: boolean, onViolation: (reason: string) => void}} params
 */
export function useFaceMonitor({ enabled, onViolation }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const noFaceSinceRef = useRef(null);
  const violationFiredRef = useRef(false);

  // Always call the LATEST onViolation, not the one captured when the
  // detection loop started — without this, a violation fired minutes into
  // a session would report the answer text as it was at start time, not
  // what the candidate has actually typed since.
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  // "idle" | "requesting" | "loading-model" | "face-detected" | "no-face" | "error"
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [secondsWithoutFace, setSecondsWithoutFace] = useState(0);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return undefined;
    }

    let cancelled = false;

    async function start() {
      setStatus("requesting");
      setError(null);
      noFaceSinceRef.current = null;
      violationFiredRef.current = false;

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(
          err.name === "NotAllowedError"
            ? "Camera access was denied. This test requires your camera to stay on for proctoring."
            : err.name === "NotFoundError"
              ? "No camera was found on this device."
              : "Couldn't access the camera."
        );
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setStatus("loading-model");
      let detector;
      try {
        detector = await getDetector();
      } catch {
        if (cancelled) return;
        setStatus("error");
        setError("Couldn't load the face-detection model. Check your connection and reload.");
        return;
      }
      if (cancelled) return;

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || violationFiredRef.current || videoRef.current.readyState < 2) return;
        let faces = [];
        try {
          faces = await detector.estimateFaces(videoRef.current);
        } catch {
          return; // transient frame error — try again next tick
        }

        if (faces.length > 0) {
          noFaceSinceRef.current = null;
          setSecondsWithoutFace(0);
          setStatus("face-detected");
          return;
        }

        if (!noFaceSinceRef.current) noFaceSinceRef.current = Date.now();
        const elapsedMs = Date.now() - noFaceSinceRef.current;
        setSecondsWithoutFace(Math.ceil(elapsedMs / 1000));
        setStatus("no-face");

        if (elapsedMs >= NO_FACE_TIMEOUT_MS && !violationFiredRef.current) {
          violationFiredRef.current = true;
          onViolationRef.current("face-not-detected");
        }
      }, DETECTION_INTERVAL_MS);
    }

    start();

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { videoRef, status, error, secondsWithoutFace, warningThresholdMs: NO_FACE_TIMEOUT_MS };
}

export default useFaceMonitor;
