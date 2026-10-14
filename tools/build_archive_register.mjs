#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const manifestDir = process.argv[2] ?? path.resolve("archive-control/manifests");
const outputDir =
  process.argv[3] ?? path.resolve("outputs/see_my_world_archive_20260730");

const files = JSON.parse(
  await fs.readFile(path.join(manifestDir, "file_inventory.json"), "utf8"),
);
const packages = JSON.parse(
  await fs.readFile(path.join(manifestDir, "package_register.json"), "utf8"),
);
const summary = JSON.parse(
  await fs.readFile(path.join(manifestDir, "inventory_summary.json"), "utf8"),
);
let checksumMap = new Map();
for (const checksumFile of [
  "tier1_sha256.txt",
  "tier1_sha256_remaining.txt",
  "tier1_sha256_final_segment.txt",
  "tier1_sha256_completion.txt",
]) {
  try {
    const checksumText = await fs.readFile(
      path.join(manifestDir, checksumFile),
      "utf8",
    );
    for (const line of checksumText.split(/\r?\n/).filter(Boolean)) {
      const match = line.match(/^([a-f0-9]{64})\s{2}(.+)$/i);
      if (match) checksumMap.set(match[2], match[1].toLowerCase());
    }
  } catch {
    // A checksum segment may not exist until its rclone job has started.
  }
}

const workbook = Workbook.create();
const dashboard = workbook.worksheets.add("Dashboard");
const packageSheet = workbook.worksheets.add("Package Register");
const fileSheet = workbook.worksheets.add("File Inventory");
const settings = workbook.worksheets.add("Settings & Method");

for (const sheet of [dashboard, packageSheet, fileSheet, settings]) {
  sheet.showGridLines = false;
}

const navy = "#17324D";
const blue = "#2374AB";
const paleBlue = "#E9F2F8";
const paleGreen = "#E8F3EC";
const green = "#2D6A4F";
const amber = "#B26A00";
const paleAmber = "#FFF3D6";
const paleGray = "#F3F5F7";
const text = "#24313D";
const white = "#FFFFFF";

// Settings and method
settings.getRange("A1:F1").merge();
settings.getRange("A1").values = [["See My World Archive — Settings & Method"]];
settings.getRange("A1:F1").format = {
  fill: navy,
  font: { bold: true, color: white, size: 16 },
  rowHeight: 30,
  verticalAlignment: "center",
};
settings.getRange("A3:B7").values = [
  ["Setting", "Value"],
  ["Source root", summary.source_root],
  ["Bytes per decimal GB", 1_000_000_000],
  ["Cloud Tier 1 ceiling (bytes)", summary.cloud_limit_bytes],
  ["Inventory generated (UTC)", new Date(summary.generated_utc)],
];
settings.getRange("A3:B3").format = {
  fill: blue,
  font: { bold: true, color: white },
};
settings.getRange("B4").format.numberFormat = "@";
settings.getRange("B5:B6").format.numberFormat = "#,##0";
settings.getRange("B7").format.numberFormat = "yyyy-mm-dd hh:mm";
settings.getRange("A9:F15").values = [
  ["Canonical hierarchy", "", "", "", "", ""],
  ["00", "ADMIN_AND_GOVERNANCE", "Policies, rights, agreements, registers", "", "", ""],
  ["01", "SEE_MY_WORLD_PROGRAMMES", "Programme-year collections and series", "", "", ""],
  ["02", "PARTNER_AND_COMMUNITY_PROJECTS", "Partner and community collections", "", "", ""],
  ["03", "EVENTS_AND_FESTIVALS", "Event and festival documentation", "", "", ""],
  ["04", "ORAL_HISTORIES_AND_PROFILES", "Interviews, profiles, panels and performances", "", "", ""],
  ["90", "INCOMING_UNPROCESSED", "Material awaiting appraisal and arrangement", "", "", ""],
];
settings.getRange("A9:F9").merge();
settings.getRange("A9:F9").format = {
  fill: navy,
  font: { bold: true, color: white },
};
settings.getRange("A17:F22").values = [
  ["Method and controls", "", "", "", "", ""],
  ["1", "Inventory before movement", "Original T7 paths recorded before reorganization.", "", "", ""],
  ["2", "Package-level selection", "Tier 1 selects intact folders/series below a decimal 1 TB ceiling.", "", "", ""],
  ["3", "Context retained", "Internal package filenames and paths remain unchanged.", "", "", ""],
  ["4", "Non-destructive cloud copy", "rclone copy is used; remote-only objects are not deleted.", "", "", ""],
  ["5", "Change preservation", "Changed remote objects move to a timestamped versions path.", "", "", ""],
];
settings.getRange("A17:F17").merge();
settings.getRange("A17:F17").format = {
  fill: navy,
  font: { bold: true, color: white },
};
settings.getRange("A1:F22").format.font = { color: text, size: 10 };
settings.getRange("A1:F1").format.font = { bold: true, color: white, size: 16 };
settings.getRange("A9:F9").format.font = { bold: true, color: white, size: 11 };
settings.getRange("A17:F17").format.font = { bold: true, color: white, size: 11 };
settings.getRange("A:A").format.columnWidth = 28;
settings.getRange("B:B").format.columnWidth = 34;
settings.getRange("C:C").format.columnWidth = 62;
settings.getRange("D:F").format.columnWidth = 4;
settings.getRange("A10:C22").format.wrapText = true;

// File inventory
const fileHeaders = [
  "Cloud Tier",
  "Preservation Status",
  "Package",
  "Canonical Logical Path",
  "Filename",
  "Extension",
  "Size (bytes)",
  "Size (GB)",
  "Modified (UTC)",
  "Original Source Path",
  "SHA-256",
  "SHA-256 Status",
];
fileSheet.getRange("A1:L1").values = [fileHeaders];
const fileRows = files.map((record) => [
  record.cloud_tier,
  record.preservation_status,
  record.package_key,
  record.logical_path,
  record.filename,
  record.extension,
  record.size_bytes,
  null,
  new Date(record.modified_utc),
  record.source_path,
  checksumMap.get(record.source_path) ?? "",
  record.cloud_tier === "TIER_1_FIRST_TB"
    ? checksumMap.has(record.source_path)
      ? "RECORDED"
      : "PENDING"
    : "NOT_SCHEDULED",
]);
fileSheet.getRangeByIndexes(1, 0, fileRows.length, fileHeaders.length).values =
  fileRows;
fileSheet.getRange("H2").formulas = [["=G2/'Settings & Method'!$B$5"]];
fileSheet.getRange(`H2:H${fileRows.length + 1}`).fillDown();
fileSheet.getRange(`G2:G${fileRows.length + 1}`).format.numberFormat = "#,##0";
fileSheet.getRange(`H2:H${fileRows.length + 1}`).format.numberFormat = "0.000";
fileSheet.getRange(`I2:I${fileRows.length + 1}`).format.numberFormat =
  "yyyy-mm-dd hh:mm";
fileSheet.getRange("A1:L1").format = {
  fill: navy,
  font: { bold: true, color: white },
  rowHeight: 28,
  wrapText: true,
  verticalAlignment: "center",
};
fileSheet.freezePanes.freezeRows(1);
fileSheet.freezePanes.freezeColumns(3);
fileSheet.tables.add(
  `A1:L${fileRows.length + 1}`,
  true,
  "FileInventoryTable",
);
fileSheet.getRange(`A2:A${fileRows.length + 1}`).conditionalFormats.add(
  "containsText",
  { text: "TIER_1", format: { fill: paleGreen, font: { color: green } } },
);
fileSheet.getRange(`A2:A${fileRows.length + 1}`).conditionalFormats.add(
  "containsText",
  { text: "TIER_2", format: { fill: paleAmber, font: { color: amber } } },
);
const fileWidths = [18, 22, 42, 74, 50, 12, 16, 12, 20, 74, 68, 18];
fileWidths.forEach((width, index) => {
  fileSheet.getRangeByIndexes(0, index, fileRows.length + 1, 1).format.columnWidth =
    width;
});

// Package register
const packageHeaders = [
  "Cloud Tier",
  "Priority",
  "Source Package",
  "Canonical Package Path",
  "File Count",
  "Size (bytes)",
  "Size (GB)",
  "Share of Tier 1",
  "Disposition",
];
packageSheet.getRange("A1:I1").values = [packageHeaders];
const packageRows = packages.map((pkg) => [
  pkg.cloud_tier,
  pkg.priority,
  pkg.package_key,
  pkg.logical_package_path,
  pkg.file_count,
  pkg.size_bytes,
  null,
  null,
  pkg.cloud_tier === "TIER_1_FIRST_TB"
    ? "COPY + VERIFY"
    : "PENDING NEXT CLOUD TIER",
]);
packageSheet
  .getRangeByIndexes(1, 0, packageRows.length, packageHeaders.length)
  .values = packageRows;
packageSheet.getRange("G2").formulas = [["=F2/'Settings & Method'!$B$5"]];
packageSheet.getRange(`G2:G${packageRows.length + 1}`).fillDown();
packageSheet.getRange("H2").formulas = [
  [`=IF(A2="TIER_1_FIRST_TB",F2/'Dashboard'!$E$8,0)`],
];
packageSheet.getRange(`H2:H${packageRows.length + 1}`).fillDown();
packageSheet.getRange(`E2:F${packageRows.length + 1}`).format.numberFormat =
  "#,##0";
packageSheet.getRange(`G2:G${packageRows.length + 1}`).format.numberFormat =
  "0.000";
packageSheet.getRange(`H2:H${packageRows.length + 1}`).format.numberFormat =
  "0.0%";
packageSheet.getRange("A1:I1").format = {
  fill: navy,
  font: { bold: true, color: white },
  rowHeight: 28,
  wrapText: true,
};
packageSheet.freezePanes.freezeRows(1);
packageSheet.freezePanes.freezeColumns(2);
packageSheet.tables.add(
  `A1:I${packageRows.length + 1}`,
  true,
  "PackageRegisterTable",
);
packageSheet.getRange(`A2:A${packageRows.length + 1}`).conditionalFormats.add(
  "containsText",
  { text: "TIER_1", format: { fill: paleGreen, font: { color: green } } },
);
packageSheet.getRange(`A2:A${packageRows.length + 1}`).conditionalFormats.add(
  "containsText",
  { text: "TIER_2", format: { fill: paleAmber, font: { color: amber } } },
);
const packageWidths = [18, 10, 70, 74, 13, 17, 12, 16, 28];
packageWidths.forEach((width, index) => {
  packageSheet
    .getRangeByIndexes(0, index, packageRows.length + 1, 1)
    .format.columnWidth = width;
});
packageSheet.getRange(`C2:D${packageRows.length + 1}`).format.wrapText = true;
packageSheet.getRange(`A2:I${packageRows.length + 1}`).format.rowHeight = 32;

// Dashboard
dashboard.getRange("A1:H2").merge();
dashboard.getRange("A1").values = [["See My World Digital Archive Register"]];
dashboard.getRange("A1:H2").format = {
  fill: navy,
  font: { bold: true, color: white, size: 18 },
  verticalAlignment: "center",
};
dashboard.getRange("A4:B4").merge();
dashboard.getRange("A4").values = [["INVENTORY"]];
dashboard.getRange("D4:E4").merge();
dashboard.getRange("D4").values = [["CLOUD TIER 1"]];
dashboard.getRange("G4:H4").merge();
dashboard.getRange("G4").values = [["CONTROL"]];
for (const range of ["A4:B4", "D4:E4", "G4:H4"]) {
  dashboard.getRange(range).format = {
    fill: blue,
    font: { bold: true, color: white },
  };
}
dashboard.getRange("A5:A8").values = [
  ["Inventoried files"],
  ["Candidate files"],
  ["Excluded sidecars"],
  ["Collection packages"],
];
dashboard.getRange("B5").formulas = [
  [`=COUNTA('File Inventory'!A2:A${fileRows.length + 1})`],
];
dashboard.getRange("B6").formulas = [
  [`=COUNTIF('File Inventory'!B2:B${fileRows.length + 1},"CANDIDATE")`],
];
dashboard.getRange("B7").formulas = [
  [`=COUNTIF('File Inventory'!B2:B${fileRows.length + 1},"EXCLUDE_SYSTEM_SIDECAR")`],
];
dashboard.getRange("B8").formulas = [
  [`=COUNTA('Package Register'!A2:A${packageRows.length + 1})`],
];
dashboard.getRange("D5:D8").values = [
  ["Selected packages"],
  ["Selected files"],
  ["Selected size (GB)"],
  ["Selected size (bytes)"],
];
dashboard.getRange("E5").formulas = [
  [`=COUNTIF('Package Register'!A2:A${packageRows.length + 1},"TIER_1_FIRST_TB")`],
];
dashboard.getRange("E6").formulas = [
  [`=COUNTIF('File Inventory'!A2:A${fileRows.length + 1},"TIER_1_FIRST_TB")`],
];
dashboard.getRange("E7").formulas = [
  [
    `=SUMIF('Package Register'!A2:A${packageRows.length + 1},"TIER_1_FIRST_TB",'Package Register'!F2:F${packageRows.length + 1})/'Settings & Method'!$B$5`,
  ],
];
dashboard.getRange("E8").formulas = [
  [
    `=SUMIF('Package Register'!A2:A${packageRows.length + 1},"TIER_1_FIRST_TB",'Package Register'!F2:F${packageRows.length + 1})`,
  ],
];
dashboard.getRange("G5:G8").values = [
  ["Tier 1 utilisation"],
  ["Tier 1 headroom (GB)"],
  ["rclone remote"],
  ["Upload status"],
];
dashboard.getRange("H5").formulas = [
  ["=E8/'Settings & Method'!$B$6"],
];
dashboard.getRange("H6").formulas = [
  ["=('Settings & Method'!$B$6-E8)/'Settings & Method'!$B$5"],
];
dashboard.getRange("H7:H8").values = [["NOT CONFIGURED"], ["BLOCKED — CREDENTIALS"]];
dashboard.getRange("G9").values = [["SHA-256 records"]];
dashboard.getRange("H9").formulas = [[
  `=COUNTIF('File Inventory'!L2:L${fileRows.length + 1},"RECORDED")`,
]];
dashboard.getRange("B5:B8").format.numberFormat = "#,##0";
dashboard.getRange("E5:E6").format.numberFormat = "#,##0";
dashboard.getRange("E7").format.numberFormat = "0.0";
dashboard.getRange("E8").format.numberFormat = "#,##0";
dashboard.getRange("H5").format.numberFormat = "0.0%";
dashboard.getRange("H6").format.numberFormat = "0.0";
dashboard.getRange("H9").format.numberFormat = "#,##0";
dashboard.getRange("A5:B8").format.fill = paleGray;
dashboard.getRange("D5:E8").format.fill = paleGreen;
dashboard.getRange("G5:H9").format.fill = paleAmber;
for (const range of ["A5:B8", "D5:E8", "G5:H9"]) {
  dashboard.getRange(range).format.borders = {
    preset: "outside",
    style: "thin",
    color: "#B8C4CC",
  };
}
dashboard.getRange("A11:H11").merge();
dashboard.getRange("A11").values = [["Tier 1 selection policy"]];
dashboard.getRange("A11:H11").format = {
  fill: navy,
  font: { bold: true, color: white },
};
dashboard.getRange("A12:H15").merge();
dashboard.getRange("A12").values = [[
  "The first cloud tier selects complete collection or series packages under a hard decimal 1 TB ceiling. Administrative records, programme documentation, oral histories and named project packages are prioritised. Original internal paths are retained; macOS metadata sidecars and drive-vendor installers are excluded. The remaining headroom is intentional for manifests, logs and future control records.",
]];
dashboard.getRange("A12:H15").format = {
  fill: paleBlue,
  wrapText: true,
  verticalAlignment: "top",
};
dashboard.getRange("A17:H17").merge();
dashboard.getRange("A17").values = [["Next operational action"]];
dashboard.getRange("A17:H17").format = {
  fill: navy,
  font: { bold: true, color: white },
};
dashboard.getRange("A18:H20").merge();
dashboard.getRange("A18").values = [[
  "Configure the private Cloudflare R2 remote and bucket, run the generated rclone dry run, then copy and verify Tier 1 before moving any preservation originals on the T7 Shield.",
]];
dashboard.getRange("A18:H20").format = {
  fill: paleAmber,
  wrapText: true,
  verticalAlignment: "top",
};
dashboard.getRange("A1:H20").format.columnWidth = 18;
dashboard.getRange("A:A").format.columnWidth = 24;
dashboard.getRange("D:D").format.columnWidth = 24;
dashboard.getRange("G:G").format.columnWidth = 24;
dashboard.getRange("H:H").format.columnWidth = 28;
dashboard.getRange("A5:H8").format.rowHeight = 24;
dashboard.freezePanes.freezeRows(2);

await fs.mkdir(outputDir, { recursive: true });

const inspections = [];
for (const [sheetName, range] of [
  ["Dashboard", "A1:H20"],
  ["Package Register", `A1:I${packageRows.length + 1}`],
  ["File Inventory", "A1:L25"],
  ["Settings & Method", "A1:F22"],
]) {
  const result = await workbook.inspect({
    kind: "table",
    range: `${sheetName}!${range}`,
    include: "values,formulas",
    tableMaxRows: sheetName === "Package Register" ? 70 : 25,
    tableMaxCols: 12,
    maxChars: 12000,
  });
  inspections.push(result.ndjson);
  const preview = await workbook.render({
    sheetName,
    range,
    scale: 1,
    format: "png",
  });
  const safeName = sheetName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  await fs.writeFile(
    path.join(outputDir, `${safeName}-preview.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(
  path.join(outputDir, "verification.txt"),
  `${inspections.join("\n")}\n${errors.ndjson}\n`,
);

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "See_My_World_Archive_Register.xlsx");
await output.save(outputPath);
console.log(outputPath);
