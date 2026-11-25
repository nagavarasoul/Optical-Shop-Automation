/* Terminal prompts for the scripts. Passwords are never echoed or saved. */
import { createInterface } from "node:readline/promises";

export async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

/* Reads a password without echoing it to the terminal. */
export function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    if (!stdin.isTTY) {
      // Piped input (not used normally): read one line
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (c) => { data += c; if (data.includes("\n")) { stdin.pause(); resolve(data.split(/\r?\n/)[0]); } });
      return;
    }
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch: string) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false); stdin.pause(); stdin.off("data", onData); stdout.write("\n");
          return resolve(value);
        }
        if (c === "\u0003") process.exit(130); // Ctrl+C
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}
