import { useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { Play, Terminal } from "lucide-react";
import { Button } from "./Button";
import { runJavaScriptInWorker } from "../../utils/runJavaScript";
import { runCode as runCodeApi } from "../../api/client";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", extension: javascript() },
  { id: "python", label: "Python", extension: python() },
  { id: "java", label: "Java", extension: java() },
  { id: "cpp", label: "C++", extension: cpp() },
];

/**
 * JavaScript runs entirely in-browser (sandboxed Web Worker, always
 * works). Other languages proxy through the backend to a configured
 * Piston-compatible service — if that's not set up, the run just fails
 * with a clear message; the answer can still be submitted and graded by
 * AI either way (see backend/services/codeExecutionService.js).
 */
export function CodeEditor({ value, onChange, language, onLanguageChange, onRunOutputChange, functionSignatureHint }) {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const activeLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    try {
      let result;
      if (language === "javascript") {
        const workerResult = await runJavaScriptInWorker(value);
        const stdout = [
          ...workerResult.logs,
          ...(workerResult.result !== undefined ? [`→ ${workerResult.result}`] : []),
        ].join("\n");
        result = { stdout, stderr: workerResult.success ? "" : workerResult.error || "" };
      } else {
        const apiResult = await runCodeApi({ language, code: value });
        result = { stdout: apiResult.stdout, stderr: apiResult.compileStderr || apiResult.stderr };
      }
      setOutput(result);
      onRunOutputChange?.(`${result.stdout}${result.stderr ? `\n[stderr] ${result.stderr}` : ""}`.trim());
    } catch (err) {
      const failure = { stdout: "", stderr: err.message };
      setOutput(failure);
      onRunOutputChange?.(`[stderr] ${err.message}`);
    } finally {
      setRunning(false);
    }
  }, [language, value, onRunOutputChange]);

  return (
    <div className="overflow-hidden rounded-md border border-line">
      <div className="flex items-center justify-between border-b border-line bg-sunken px-3 py-2">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded border border-line bg-surface px-2 py-1 text-xs text-main focus:border-accent focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="secondary" icon={Play} loading={running} onClick={handleRun}>
          Run
        </Button>
      </div>

      {functionSignatureHint && (
        <div className="border-b border-line bg-sunken px-3 py-1.5 font-mono text-xs text-faint">
          {functionSignatureHint}
        </div>
      )}

      <CodeMirror
        value={value}
        height="240px"
        theme={vscodeDark}
        extensions={[activeLang.extension]}
        onChange={(val) => onChange(val)}
        basicSetup={{ lineNumbers: true, foldGutter: false }}
      />

      {output && (
        <div className="border-t border-line bg-black/40 px-3 py-2 font-mono text-xs">
          <div className="mb-1 flex items-center gap-1.5 text-faint">
            <Terminal size={12} />
            Output
          </div>
          {output.stdout && <pre className="whitespace-pre-wrap text-main">{output.stdout}</pre>}
          {output.stderr && <pre className="whitespace-pre-wrap text-danger">{output.stderr}</pre>}
          {!output.stdout && !output.stderr && <p className="text-faint">(no output)</p>}
        </div>
      )}
    </div>
  );
}

export default CodeEditor;
