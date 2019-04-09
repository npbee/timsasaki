/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const prettyBytes = require("pretty-bytes");
const globby = require("globby");
const gzipSize = require("gzip-size");
const Table = require("cli-table");

const dist = path.join(__dirname, "..", "dist");

function sumType(rows, types) {
  const rowsByType = rows.filter(row => types.includes(row.type));
  const totals = {
    raw: 0,
    gzip: 0,
  };
  const total = rowsByType.reduce((sums, row) => {
    sums.raw += row.rawSize;
    sums.gzip += gzipSize.fileSync(row.filePath);

    return totals;
  }, totals);

  return total;
}

function formatSize(bytes) {
  const formatted = prettyBytes(bytes);

  return bytes >= 100 * 1024 ? chalk.red(formatted) : chalk.green(formatted);
}

async function report() {
  const paths = await globby(dist);
  const rows = paths.map(filePath => {
    const stats = fs.statSync(filePath);
    return {
      filePath,
      name: path.basename(filePath),
      type: path.extname(filePath),
      rawSize: stats.size,
    };
  });

  const js = sumType(rows, [".js"]);
  const img = sumType(rows, [".png", ".svg", ".jpg"]);
  const css = sumType(rows, [".css"]);

  const table = new Table({
    head: [
      chalk.white("Type"),
      chalk.white("Size"),
      chalk.white("Size (gzip)"),
    ],
  });

  table.push(["JS", formatSize(js.raw), formatSize(js.gzip)]);
  table.push(["Images", formatSize(img.raw), formatSize(img.gzip)]);
  table.push(["CSS", formatSize(css.raw), formatSize(css.gzip)]);

  console.log(table.toString());
  console.log();
}

console.log();
console.log(chalk.bold("Size Report"));
console.log();
report();
