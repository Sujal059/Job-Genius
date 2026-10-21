/**
 * Executes arbitrary JavaScript in a Web Worker — a separate thread with
 * its own global scope, so an infinite loop in the candidate's code can
 * never freeze the page, and it has no access to the app's DOM, cookies,
 * or auth token. This is what makes "Run" work for JavaScript with zero
 * external dependency (no server round-trip, no third-party API).
 *
 * @param {string} code
 * @param {number} timeoutMs
 * @returns {Promise<{success: boolean, logs: string[], result?: string, error?: string}>}
 */
export function runJavaScriptInWorker(code, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const workerSource = `
      self.onmessage = function (e) {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(
            args
              .map((a) => {
                try {
                  return typeof a === "object" ? JSON.stringify(a) : String(a);
                } catch {
                  return String(a);
                }
              })
              .join(" ")
          );
        };
        try {
          const fn = new Function(e.data);
          const result = fn();
          self.postMessage({
            success: true,
            logs,
            result: result !== undefined ? String(result) : undefined,
          });
        } catch (err) {
          self.postMessage({ success: false, logs, error: err.message });
        } finally {
          console.log = originalLog;
        }
      };
    `;

    const blobUrl = URL.createObjectURL(new Blob([workerSource], { type: "application/javascript" }));
    const worker = new Worker(blobUrl);

    const cleanup = () => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        logs: [],
        error: `Execution timed out after ${timeoutMs / 1000}s — possible infinite loop.`,
      });
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      cleanup();
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      cleanup();
      resolve({ success: false, logs: [], error: e.message || "Unknown script error." });
    };

    worker.postMessage(code);
  });
}

export default runJavaScriptInWorker;
