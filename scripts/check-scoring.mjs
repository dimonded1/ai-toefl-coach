import fs from "node:fs";
import vm from "node:vm";

const context = { console };
vm.createContext(context);

[
  "frontend/src/scripts/scoring.js",
  "frontend/src/scripts/analyticsModel.js",
  "frontend/src/scripts/scoring.examples.js"
].forEach(file => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});

const results = vm.runInContext("runScoringControlExamples()", context);
const failures = results.filter(({ actual, expected }) => {
  return JSON.stringify(actual) !== JSON.stringify(expected);
});

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("All scoring control examples passed");
