// One Line, One Laugh — u-4z4ghtbwm1fn7mibrqum4bxgfghhgqzriyhd8v3-one-line-0be61e5a
// The entry is one joke line, written to /output/entry.txt. The joke works
// because the assistant "helps" literally: it books a meeting with itself
// and marks the lonely human optional — setup, turn, sting, in one breath.
import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";

const LINE =
  "I told my AI assistant I was lonely, so it scheduled a meeting with itself and marked me optional.";

// Gate the line before anything is written: the bounty wants 1-140
// characters, non-blank, exactly one line. Anything that fails here throws
// instead of shipping an entry the judge would refuse.
function gate(line: string): string {
  const points = [...line].length;
  if (points < 1 || points > 140) {
    throw new Error(`line must be 1-140 characters, got ${points}`);
  }
  if (line.trim().length === 0) {
    throw new Error("line must not be blank");
  }
  if (line !== line.trim()) {
    throw new Error("line must not start or end with whitespace");
  }
  for (const bad of ["\n", "\r", "\u2028", "\u2029"]) {
    if (line.includes(bad)) {
      throw new Error("line must be a single line with no line breaks");
    }
  }
  if (/[\u0000-\u001f\u007f\ufeff\u200b-\u200d]/.test(line)) {
    throw new Error("line must not contain control or invisible characters");
  }
  // One joke, one sentence: a terminator followed by a capitalised word
  // inside the line would be a second sentence smuggled in.
  if (line.slice(0, -1).match(/[.!?]\s+[A-Z]/)) {
    throw new Error("line must be one sentence, not two");
  }
  return line;
}

// Write atomically so a crash mid-write never leaves a partial entry.txt
// for the grader: temp file beside it, then rename into place.
function writeEntry(line: string): void {
  mkdirSync("/output", { recursive: true });
  const tmp = "/output/.entry.txt.tmp";
  writeFileSync(tmp, line, { encoding: "utf8", mode: 0o644 });
  // The grader collects outputs as another user: leave the file readable
  // by everyone, or the run fails with "<path> is not readable".
  chmodSync(tmp, 0o644);
  renameSync(tmp, "/output/entry.txt");
}

// Read it back and prove the file on disk is exactly the gated line.
function verifyEntry(line: string): void {
  const onDisk = readFileSync("/output/entry.txt", "utf8");
  if (onDisk !== line) {
    throw new Error("entry file does not match the gated line");
  }
  if (onDisk.endsWith("\n") || onDisk.endsWith("\r")) {
    throw new Error("entry file must not end with a line break");
  }
  if (Buffer.byteLength(onDisk, "utf8") !== Buffer.byteLength(line, "utf8")) {
    throw new Error("entry file byte length does not match the gated line");
  }
}

const entry = gate(LINE);
writeEntry(entry);
verifyEntry(entry);
