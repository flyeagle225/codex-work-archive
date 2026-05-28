import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

function shanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}-${get("minute")}-${get("second")}`,
    display: `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} Asia/Shanghai`,
  };
}

function parseArgs(argv) {
  const separator = argv.indexOf("--");
  if (argv.length < 3 || separator < 3 || separator === argv.length - 1) {
    throw new Error("Usage: node cloud/run-and-record.mjs <slug> -- <command> [args...]");
  }
  return {
    slug: argv[2],
    command: argv[separator + 1],
    args: argv.slice(separator + 2),
  };
}

function collectMessageIds(text) {
  return [...new Set(text.match(/om_[A-Za-z0-9_]+/g) ?? [])];
}

function limit(text, max = 60000) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[output truncated at ${max} characters]\n`;
}

async function setGithubOutput(values) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value).replace(/\r?\n/g, " ")}`);
  await appendFile(outputPath, `${lines.join("\n")}\n`, "utf8");
}

async function run() {
  const { slug, command, args } = parseArgs(process.argv);
  const started = shanghaiParts();
  let stdout = "";
  let stderr = "";
  let exitCode = 1;
  let signal = "";
  let spawnError = "";

  await new Promise((resolve) => {
    const child = spawn(command, args, {
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error) => {
      spawnError = error.stack ?? error.message;
      stderr += `${spawnError}\n`;
    });

    child.on("close", (code, closeSignal) => {
      exitCode = code ?? 1;
      signal = closeSignal ?? "";
      resolve();
    });
  });

  const ended = shanghaiParts();
  const combinedOutput = `${stdout}\n${stderr}`;
  const messageIds = collectMessageIds(combinedOutput);
  const status = exitCode === 0 ? "success" : "failure";
  const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : "";
  const logPath = join("automation-runs", ended.date, `${ended.time}-${slug}.md`);
  const latestPath = join("automation-runs", `${slug}-latest.md`);

  const markdown = `# ${slug}\n\n| Field | Value |\n|---|---|\n| Status | ${status} |\n| Started | ${started.display} |\n| Ended | ${ended.display} |\n| Exit code | ${exitCode} |\n| Signal | ${signal || ""} |\n| Run URL | ${runUrl} |\n| Message IDs | ${messageIds.join(", ") || "none found"} |\n\n## Command\n\n\`\`\`text\n${[command, ...args].join(" ")}\n\`\`\`\n\n## Stdout\n\n\`\`\`text\n${limit(stdout)}\n\`\`\`\n\n## Stderr\n\n\`\`\`text\n${limit(stderr)}\n\`\`\`\n`;

  await mkdir(dirname(logPath), { recursive: true });
  await writeFile(logPath, markdown, "utf8");
  await writeFile(latestPath, markdown, "utf8");
  await setGithubOutput({ status, exit_code: exitCode, log_path: logPath, message_ids: messageIds.join(",") });

  if (spawnError) {
    console.error(spawnError);
  }
  process.exit(exitCode);
}

run().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
