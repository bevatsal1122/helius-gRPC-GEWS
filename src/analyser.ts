import fs from "fs";

const diffAnalyser = async () => {
  const diff = fs.readFileSync("results/diff.txt", "utf8");
  const diffArray = diff.split("\n").map((line) => parseInt(line.trim()));
  const positiveDiff = diffArray.filter((diff) => diff > 0);
  const negativeDiff = diffArray.filter((diff) => diff < 0);
  console.log("positiveDiff", positiveDiff);
  console.log("negativeDiff", negativeDiff);
  const positiveAverage = positiveDiff.reduce((a, b) => a + b, 0) / positiveDiff.length;
  const negativeAverage = negativeDiff.reduce((a, b) => a + b, 0) / negativeDiff.length;
  console.log("positiveAverage", positiveAverage);
  console.log("negativeAverage", negativeAverage);
};

diffAnalyser().catch(console.error);
