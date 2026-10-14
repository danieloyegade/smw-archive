#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const mode = process.argv[2] ?? "dry-run";
const remoteBase = process.argv[3];
const sourceRoot = process.argv[4] ?? "/Volumes/T7 Shield";
const manifestPath =
  process.argv[5] ?? path.resolve("archive-control/manifests/package_register.json");

if (!remoteBase || !remoteBase.includes(":")) {
  console.error(
    "Usage: node tools/rclone_archive.mjs <dry-run|copy|check> <remote:bucket/prefix> [source-root] [package-register.json]",
  );
  process.exit(2);
}
if (!["dry-run", "copy", "check"].includes(mode)) {
  console.error(`Unsupported mode: ${mode}`);
  process.exit(2);
}

const packages = JSON.parse(await fs.readFile(manifestPath, "utf8")).filter(
  (pkg) => pkg.cloud_tier === "TIER_1_FIRST_TB",
);
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logDir = path.resolve("archive-control/logs");
const reportDir = path.resolve("archive-control/reports");
await fs.mkdir(logDir, { recursive: true });
await fs.mkdir(reportDir, { recursive: true });

const commonFilters = [
  "--exclude",
  ".DS_Store",
  "--exclude",
  "._*",
  "--exclude",
  "Thumbs.db",
  "--exclude",
  "desktop.ini",
  "--exclude",
  "Start_Here_Mac.app/**",
  "--exclude",
  "Start_Here_Win.exe",
  "--exclude",
  "Warranty.pdf",
];

function sourceFor(pkg) {
  const parts = pkg.package_key.split("/");
  if (parts.at(-1) === "_ROOT_FILES") parts.pop();
  return path.join(sourceRoot, ...parts);
}

async function runRclone(args, label) {
  console.log(`\n[${label}] rclone ${args.map(JSON.stringify).join(" ")}`);
  await new Promise((resolve, reject) => {
    const child = spawn("rclone", args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`rclone exited with code ${code}`)),
    );
  });
}

for (const pkg of packages) {
  const source = sourceFor(pkg);
  const destination = `${remoteBase.replace(/\/$/, "")}/${pkg.logical_package_path}`;
  const label = pkg.package_key;
  const rootFilesOnly = pkg.package_key.endsWith("/_ROOT_FILES")
    ? ["--max-depth", "1"]
    : [];
  const logFile = path.join(logDir, `${timestamp}-${pkg.logical_package_path.replaceAll("/", "__")}.log`);

  if (mode === "check") {
    const combined = path.join(
      reportDir,
      `${timestamp}-${pkg.logical_package_path.replaceAll("/", "__")}-check.txt`,
    );
    await runRclone(
      [
        "check",
        source,
        destination,
        "--one-way",
        "--combined",
        combined,
        "--log-file",
        logFile,
        "--log-level",
        "INFO",
        ...rootFilesOnly,
        ...commonFilters,
      ],
      label,
    );
    continue;
  }

  const args = [
    "copy",
    source,
    destination,
    "--fast-list",
    "--transfers",
    "4",
    "--checkers",
    "8",
    "--metadata",
    "--create-empty-src-dirs",
    "--log-file",
    logFile,
    "--log-level",
    "INFO",
    "--stats",
    "30s",
    "--stats-one-line",
    ...rootFilesOnly,
    ...commonFilters,
  ];
  if (mode === "dry-run") args.push("--dry-run");
  if (mode === "copy") {
    args.push(
      "--backup-dir",
      `${remoteBase.replace(/\/$/, "")}/99_ARCHIVE_CONTROL/versions/${timestamp}/${pkg.logical_package_path}`,
    );
  }
  await runRclone(args, label);
}

console.log(
  `Completed ${mode} for ${packages.length} Tier 1 packages. Logs: ${logDir}`,
);
