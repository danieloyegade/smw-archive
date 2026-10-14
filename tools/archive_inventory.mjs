#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const sourceRoot = process.argv[2] ?? "/Volumes/T7 Shield";
const outputDir = process.argv[3] ?? path.resolve("archive-control/manifests");
const cloudLimit = 1_000_000_000_000;

const excludedTopLevel = new Set([
  ".Spotlight-V100",
  ".Trashes",
  ".fseventsd",
  "System Volume Information",
  "Magician Launcher.app",
  "Magician Launcher.exe",
  "RootCA.crt",
  "_ARCHIVE_CONTROL",
  "._ARCHIVE_CONTROL",
  ".__ARCHIVE_CONTROL",
  "SEE_MY_WORLD_ARCHIVE",
  "._SEE_MY_WORLD_ARCHIVE",
]);

const preservationNoise = (name) =>
  name === ".DS_Store" ||
  name.startsWith("._") ||
  name === "Thumbs.db" ||
  name === "desktop.ini" ||
  name === "Start_Here_Win.exe" ||
  name === "Warranty.pdf";

const slug = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

function packageInfo(parts) {
  const top = parts[0];
  if (top !== "SEE MY WORLD ARCHIVE") {
    const category =
      top === "PAC 70"
        ? "02_PARTNER_AND_COMMUNITY_PROJECTS"
        : top.startsWith("Parklife")
          ? "03_EVENTS_AND_FESTIVALS"
          : top.trim() === "BPM"
            ? "02_PARTNER_AND_COMMUNITY_PROJECTS"
            : "90_INCOMING_UNPROCESSED";
    return {
      packageKey: top,
      logicalPackagePath: `${category}/${slug(top)}`,
      sourcePartsConsumed: 1,
    };
  }

  const isRootFile = parts.length === 2;
  const collection = isRootFile ? "_ROOT_FILES" : (parts[1] ?? "_ROOT_FILES");
  const normalized = collection.trim().toLowerCase();
  let category = "02_PARTNER_AND_COMMUNITY_PROJECTS";
  let logicalName = slug(collection);

  const yearMatch = normalized.match(/^see my world\s*(20\d{2}|2\d)$/);
  if (yearMatch) {
    const rawYear = yearMatch[1];
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    category = "01_SEE_MY_WORLD_PROGRAMMES";
    logicalName = year;
    if (["2023", "2025"].includes(year)) {
      const isYearRootFile = parts.length === 3;
      const series = isYearRootFile ? "_ROOT_FILES" : (parts[2] ?? "_ROOT_FILES");
      return {
        packageKey: `SEE MY WORLD ARCHIVE/${collection}/${series}`,
        logicalPackagePath: `${category}/${year}/${slug(series)}`,
        sourcePartsConsumed: isYearRootFile ? 2 : 3,
      };
    }
  } else if (normalized === "see my world") {
    category = "01_SEE_MY_WORLD_PROGRAMMES";
    logicalName = "UNDATED_LEGACY";
  } else if (
    normalized.includes("archive document") ||
    normalized === "_root_files"
  ) {
    category = "00_ADMIN_AND_GOVERNANCE";
  } else if (
    normalized.includes("festival") ||
    normalized.includes("parklife") ||
    normalized.includes("we out here") ||
    normalized.includes("archive launch")
  ) {
    category = "03_EVENTS_AND_FESTIVALS";
  } else if (
    normalized.includes("archive") ||
    normalized.includes("in conversation") ||
    normalized.includes("panel") ||
    normalized.includes("performance") ||
    normalized.includes("shirley") ||
    normalized.includes("geoff") ||
    normalized.includes("hakim") ||
    normalized.includes("sideman") ||
    normalized.includes("gloria") ||
    normalized.includes("glen") ||
    normalized.includes("junior") ||
    normalized.includes("courtney") ||
    normalized.includes("chad")
  ) {
    category = "04_ORAL_HISTORIES_AND_PROFILES";
  } else if (
    normalized.includes("future") ||
    normalized.startsWith("wetransfer")
  ) {
    category = "90_INCOMING_UNPROCESSED";
  }

  return {
    packageKey: `SEE MY WORLD ARCHIVE/${collection}`,
    logicalPackagePath: `${category}/${logicalName}`,
    sourcePartsConsumed: isRootFile ? 1 : 2,
  };
}

function priorityFor(packageKey, logicalPath) {
  if (logicalPath.startsWith("00_ADMIN")) return 1;
  if (
    packageKey === "PAC 70" ||
    packageKey.trim() === "BPM" ||
    /^01_SEE_MY_WORLD_PROGRAMMES\/(2021|2024|2026)(\/|$)/.test(logicalPath)
  )
    return 2;
  if (
    logicalPath.startsWith("04_ORAL") ||
    logicalPath.startsWith("03_EVENTS")
  )
    return 3;
  if (logicalPath.startsWith("02_PARTNER")) return 4;
  if (logicalPath.includes("2025")) return 5;
  if (logicalPath.includes("2023")) return 6;
  return 7;
}

const records = [];
const errors = [];

async function walk(absDir, relativeParts = []) {
  let entries;
  try {
    entries = await fs.readdir(absDir, { withFileTypes: true });
  } catch (error) {
    errors.push({ path: absDir, error: error.message });
    return;
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, "en"));
  for (const entry of entries) {
    if (relativeParts.length === 0 && excludedTopLevel.has(entry.name)) continue;
    const parts = [...relativeParts, entry.name];
    const absolutePath = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      await walk(absolutePath, parts);
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    try {
      const stat = await fs.stat(absolutePath);
      const pkg = packageInfo(parts);
      const extension = path.extname(entry.name).slice(1).toLowerCase() || "(none)";
      const noise =
        preservationNoise(entry.name) ||
        parts.includes("Start_Here_Mac.app");
      const relativePath = parts.join("/");
      records.push({
        source_path: relativePath,
        source_absolute_path: absolutePath,
        package_key: pkg.packageKey,
        logical_path: `${pkg.logicalPackagePath}/${parts
          .slice(pkg.sourcePartsConsumed)
          .join("/")}`,
        filename: entry.name,
        extension,
        size_bytes: stat.size,
        modified_utc: stat.mtime.toISOString(),
        preservation_status: noise ? "EXCLUDE_SYSTEM_SIDECAR" : "CANDIDATE",
      });
    } catch (error) {
      errors.push({ path: absolutePath, error: error.message });
    }
  }
}

await walk(sourceRoot);

const packages = new Map();
for (const record of records) {
  if (record.preservation_status !== "CANDIDATE") continue;
  const current = packages.get(record.package_key) ?? {
    package_key: record.package_key,
    logical_package_path: record.logical_path.slice(
      0,
      record.logical_path.length -
        (record.logical_path.endsWith("/") ? 0 : record.logical_path.split("/").at(-1).length + 1),
    ),
    file_count: 0,
    size_bytes: 0,
  };
  current.file_count += 1;
  current.size_bytes += record.size_bytes;
  packages.set(record.package_key, current);
}

for (const pkg of packages.values()) {
  const sample = records.find((record) => record.package_key === pkg.package_key);
  const packageDepth = pkg.package_key.split("/").length;
  pkg.logical_package_path = sample
    ? sample.logical_path
        .split("/")
        .slice(0, packageDepth === 3 ? 3 : 2)
        .join("/")
    : pkg.logical_package_path;
  pkg.priority = priorityFor(pkg.package_key, pkg.logical_package_path);
}

const ranked = [...packages.values()].sort(
  (a, b) =>
    a.priority - b.priority ||
    a.size_bytes - b.size_bytes ||
    a.package_key.localeCompare(b.package_key, "en"),
);

let selectedBytes = 0;
const selectedPackages = new Set();
for (const pkg of ranked) {
  if (selectedBytes + pkg.size_bytes <= cloudLimit) {
    pkg.cloud_tier = "TIER_1_FIRST_TB";
    selectedPackages.add(pkg.package_key);
    selectedBytes += pkg.size_bytes;
  } else {
    pkg.cloud_tier = "TIER_2_PENDING";
  }
}

for (const record of records) {
  record.cloud_tier =
    record.preservation_status === "EXCLUDE_SYSTEM_SIDECAR"
      ? "EXCLUDED"
      : selectedPackages.has(record.package_key)
        ? "TIER_1_FIRST_TB"
        : "TIER_2_PENDING";
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "file_inventory.csv"), `${toCsv(records)}\n`);
await fs.writeFile(
  path.join(outputDir, "file_inventory.json"),
  `${JSON.stringify(records)}\n`,
);
await fs.writeFile(path.join(outputDir, "package_register.csv"), `${toCsv(ranked)}\n`);
await fs.writeFile(
  path.join(outputDir, "package_register.json"),
  `${JSON.stringify(ranked, null, 2)}\n`,
);
await fs.writeFile(
  path.join(outputDir, "tier1_files_from_source.txt"),
  `${records
    .filter((record) => record.cloud_tier === "TIER_1_FIRST_TB")
    .map((record) => record.source_path)
    .join("\n")}\n`,
);
let existingChecksumPaths = new Set();
for (const checksumFile of [
  "tier1_sha256.txt",
  "tier1_sha256_remaining.txt",
  "tier1_sha256_final_segment.txt",
  "tier1_sha256_completion.txt",
]) {
  try {
    const checksumText = await fs.readFile(
      path.join(outputDir, checksumFile),
      "utf8",
    );
    for (const line of checksumText.split(/\r?\n/).filter(Boolean)) {
      const match = line.match(/^[a-f0-9]{64}\s{2}(.+)$/i);
      if (match) existingChecksumPaths.add(match[1]);
    }
  } catch {
    // A segment does not exist until its rclone hashing run has started.
  }
}
await fs.writeFile(
  path.join(outputDir, "tier1_files_remaining_checksums.txt"),
  `${records
    .filter(
      (record) =>
        record.cloud_tier === "TIER_1_FIRST_TB" &&
        !existingChecksumPaths.has(record.source_path),
    )
    .map((record) => record.source_path)
    .join("\n")}\n`,
);
await fs.writeFile(
  path.join(outputDir, "inventory_summary.json"),
  `${JSON.stringify(
    {
      generated_utc: new Date().toISOString(),
      source_root: sourceRoot,
      cloud_limit_bytes: cloudLimit,
      selected_bytes: selectedBytes,
      selected_file_count: records.filter(
        (record) => record.cloud_tier === "TIER_1_FIRST_TB",
      ).length,
      candidate_file_count: records.filter(
        (record) => record.preservation_status === "CANDIDATE",
      ).length,
      excluded_sidecar_count: records.filter(
        (record) => record.preservation_status === "EXCLUDE_SYSTEM_SIDECAR",
      ).length,
      package_count: ranked.length,
      selected_packages: ranked
        .filter((pkg) => pkg.cloud_tier === "TIER_1_FIRST_TB")
        .map((pkg) => pkg.package_key),
      errors,
    },
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify({
    files: records.length,
    packages: ranked.length,
    selectedBytes,
    selectedTB: selectedBytes / 1e12,
    selectedPackages: selectedPackages.size,
    errors: errors.length,
  }),
);
