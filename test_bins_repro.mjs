// Repro + verifikasi bug "total bins 1" (downside_pct terlalu kecil).
// Jalan manual: node test_bins_repro.mjs  (dari /home/ubuntu/meridian)
// Hanya jalan aman karena DRY_RUN=true → deployPosition balik simulasi.
import { readFileSync } from "fs";

for (const line of readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
}
process.env.DRY_RUN = "true";

const { deployPosition } = await import("./tools/dlmm.js");

const POOL = process.argv[2] || "3fCT5evpwmTSMWwpocRWG7jaMKnrKcbt6QdZxkWJ9gpf";

console.log("=== KASUS 1: downside_pct 0.01 (bug asli: konversi → 1 bin) ===");
try {
  const r = await deployPosition({
    pool_address: POOL,
    amount_y: 0.2,
    strategy: "spot",
    downside_pct: 0.01,
    bins_above: 0,
    pool_name: "TEST-REPRO-TINY",
  });
  const b = r?.would_deploy ?? {};
  console.log("NO THROW →", JSON.stringify({ bins_below: b.bins_below, bins_above: b.bins_above, downside_pct: b.downside_pct, wide: b.wide_range }));
} catch (e) {
  console.log("THREW →", String(e.message).slice(0, 160));
}

console.log("=== KASUS 2: downside_pct 30 (wajar, harus tetap normal) ===");
try {
  const r = await deployPosition({
    pool_address: POOL,
    amount_y: 0.2,
    strategy: "spot",
    downside_pct: 30,
    bins_above: 0,
    pool_name: "TEST-REPRO-NORMAL",
  });
  const b = r?.would_deploy ?? {};
  console.log("NO THROW →", JSON.stringify({ bins_below: b.bins_below, bins_above: b.bins_above, downside_pct: b.downside_pct, wide: b.wide_range }));
} catch (e) {
  console.log("THREW →", String(e.message).slice(0, 160));
}

console.log("=== KASUS 3: bins_below eksplisit 40 (jalur lama, harus tetap jalan) ===");
try {
  const r = await deployPosition({
    pool_address: POOL,
    amount_y: 0.2,
    strategy: "spot",
    bins_below: 40,
    bins_above: 0,
    pool_name: "TEST-REPRO-EXPLICIT",
  });
  const b = r?.would_deploy ?? {};
  console.log("NO THROW →", JSON.stringify({ bins_below: b.bins_below, bins_above: b.bins_above, downside_pct: b.downside_pct, wide: b.wide_range }));
} catch (e) {
  console.log("THREW →", String(e.message).slice(0, 160));
}
