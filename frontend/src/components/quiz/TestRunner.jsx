import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Mic, Square, ShieldCheck, Camera } from "lucide-react";
import clsx from "clsx";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge, difficultyTone, frequencyTone } from "../ui/Badge";
import { QuestionTimer } from "../ui/QuestionTimer";
import { CodeEditor } from "../ui/CodeEditor";
import { ProctorPanel } from "../layout/ProctorPanel";
import { useCountdown } from "../../hooks/useCountdown";
import { useFaceMonitor } from "../../hooks/useFaceMonitor";
import { useTabVisibility } from "../../hooks/useTabVisibility";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

const NO_ANSWER_TEXT = "(time expired — no answer)";

/**
 * Shared by MockInterviewer and SkillAssessment — once both features
 * needed the same thing (typed questions, a timer per question, camera +
 * tab proctoring, auto-advance on timeout), duplicating this across two
 * pages would just be two copies to keep in sync. The parent page owns
 * the generate/grade API calls and results screen; this owns everything
 * about actually *taking* the test.
 *
 * @param {{questions: object[], onFinish: (answers: object[]) => void, onViolation: (reason: string, answers: object[]) => void}} props
 */
export function TestRunner({ questions, onFinish, onViolation }) {
  const [consented, setConsented] = useState(false);
  const [index, setIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [runOutput, setRunOutput] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [finished, setFinished] = useState(false);
  const [collected, setCollected] = useState([]);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const commitAndAdvance = useCallback(
    (overrideText) => {
      if (finished) return;
      const text = (overrideText ?? answerText).trim();
      const entry = {
        index,
        answer: text || NO_ANSWER_TEXT,
        codeLanguage: question.type === "coding" ? codeLanguage : undefined,
        runOutput: question.type === "coding" ? runOutput : undefined,
      };
      const next = [...collected, entry];
      setCollected(next);

      if (isLast) {
        setFinished(true);
        onFinish(next);
      } else {
        setIndex((i) => i + 1);
        setAnswerText("");
        setRunOutput("");
        setSelectedOption(null);
      }
    },
    [finished, answerText, question?.type, codeLanguage, runOutput, collected, index, isLast, onFinish]
  );

  const handleTimeout = useCallback(() => commitAndAdvance(), [commitAndAdvance]);

  const { remaining } = useCountdown({
    seconds: question?.timeLimitSeconds || 60,
    onExpire: handleTimeout,
    isActive: consented && !finished,
  });

  const handleViolation = useCallback(
    (reason) => {
      if (finished) return;
      setFinished(true);
      const current = { index, answer: (answerText || "").trim() || NO_ANSWER_TEXT };
      onViolation(reason, [...collected, current]);
    },
    [finished, index, answerText, collected, onViolation]
  );

  const faceMonitor = useFaceMonitor({ enabled: consented && !finished, onViolation: handleViolation });
  useTabVisibility({ enabled: consented && !finished, onViolation: handleViolation });

  const handleMcqSelect = (option) => {
    setSelectedOption(option);
    setTimeout(() => commitAndAdvance(option), 350);
  };

  if (!consented) {
    return <ConsentScreen questionCount={questions.length} onStart={() => setConsented(true)} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <ProctorPanel {...faceMonitor} />

      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-faint">
          Question {index + 1} / {questions.length}
        </p>
        <QuestionTimer remaining={remaining} total={question.timeLimitSeconds} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard>
            <div className="mb-4 flex flex-wrap gap-1.5">
              <Badge tone="neutral">{question.topic}</Badge>
              <Badge tone={difficultyTone(question.difficulty)}>{question.difficulty}</Badge>
              {question.frequency && <Badge tone={frequencyTone(question.frequency)}>{question.frequency}</Badge>}
              <Badge tone="accent">
                {question.type === "mcq" ? "Multiple choice" : question.type === "coding" ? "Coding" : "Written answer"}
              </Badge>
            </div>

            <h2 className="mb-5 whitespace-pre-line font-display text-lg font-semibold leading-snug text-main">
              {question.questionText}
            </h2>

            {question.type === "mcq" && (
              <div className="flex flex-col gap-2">
                {(question.options || []).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleMcqSelect(option)}
                    disabled={selectedOption !== null}
                    className={clsx(
                      "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                      selectedOption === option
                        ? "border-accent bg-accent-soft text-main"
                        : "border-line bg-sunken text-muted hover:border-line-glow hover:text-main disabled:opacity-60"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === "text" && (
              <TextAnswerInput value={answerText} onChange={setAnswerText} />
            )}

            {question.type === "coding" && (
              <CodeEditor
                value={answerText}
                onChange={setAnswerText}
                language={codeLanguage}
                onLanguageChange={setCodeLanguage}
                onRunOutputChange={setRunOutput}
                functionSignatureHint={question.functionSignatureHint}
              />
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {question.type !== "mcq" && (
        <Button icon={ChevronRight} onClick={() => commitAndAdvance()} className="self-end">
          {isLast ? "Finish" : "Next question"}
        </Button>
      )}
    </div>
  );
}

function ConsentScreen({ questionCount, onStart }) {
  return (
    <GlassCard>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-main">This test is proctored</h2>
          <p className="text-sm text-muted">{questionCount} questions, each on its own timer.</p>
        </div>
      </div>
      <ul className="mb-6 flex flex-col gap-2 text-sm text-muted">
        <li className="flex items-start gap-2">
          <Camera size={15} className="mt-0.5 shrink-0 text-faint" />
          Your camera stays on to confirm you&rsquo;re present. Detection runs entirely in your browser —
          no video is ever recorded or sent anywhere.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-faint">•</span>
          If your face isn&rsquo;t visible for 5 continuous seconds, or you switch to another tab or
          window, the test ends immediately with a score of 0.
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-faint">•</span>
          Each question auto-advances when its timer runs out — whatever you&rsquo;ve written is saved
          automatically.
        </li>
      </ul>
      <Button onClick={onStart} className="w-full justify-center sm:w-auto">
        Enable camera &amp; start
      </Button>
    </GlassCard>
  );
}

function TextAnswerInput({ value, onChange }) {
  const { isSupported, isListening, transcript, startListening, stopListening, resetTranscript, error } =
    useSpeechRecognition();
  const [baseText, setBaseText] = useState("");

  const liveValue = isListening ? `${baseText} ${transcript}`.trim() : value;

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      onChange(liveValue);
      return;
    }
    setBaseText(value);
    resetTranscript();
    startListening();
  };

  return (
    <div>
      <textarea
        value={liveValue}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Type your answer, or use the mic below..."
        className="w-full resize-none rounded-md border border-line bg-sunken px-3 py-2.5 text-sm text-main placeholder:text-faint focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        {isSupported ? (
          <button
            type="button"
            onClick={handleMicToggle}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isListening
                ? "border-danger/40 bg-danger-soft text-danger"
                : "border-line text-muted hover:border-line-glow hover:text-main"
            )}
          >
            {isListening ? <Square size={13} /> : <Mic size={13} />}
            {isListening ? "Stop recording" : "Speak your answer"}
          </button>
        ) : (
          <p className="text-xs text-faint">Voice input isn&rsquo;t supported in this browser — typing works great too.</p>
        )}
        {error && <p className="text-xs text-danger">Mic error: {error}</p>}
      </div>
    </div>
  );
}

export default TestRunner;
