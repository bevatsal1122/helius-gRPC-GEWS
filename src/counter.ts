import fs from "fs";
import path from "path";

const calculateTimestampDifferences1And2 = async () => {
  const results1Path = path.join(process.cwd(), "results", "r3.txt");
  const results2Path = path.join(process.cwd(), "results", "r2.txt");
  const finalResultsPath = path.join(process.cwd(), "results", "diff.txt");

  const results1Data = fs.readFileSync(results1Path, "utf-8").split("\n");
  const results2Data = fs.readFileSync(results2Path, "utf-8").split("\n");

  const results1Map: { [key: string]: string } = {};
  results1Data.forEach((line) => {
    const [url, timestamp] = line.split(" - ");
    if (url && timestamp) {
      results1Map[url] = timestamp;
    }
  });

  const differences: string[] = [];

  results2Data.forEach((line) => {
    const [url, timestamp2] = line.split(" - ");
    if (url && timestamp2) {
      const timestamp1 = results1Map[url];
      if (timestamp1) {
        const diff =
          new Date(timestamp2).getTime() - new Date(timestamp1).getTime();
        console.log(timestamp1, " ", timestamp2, " ", diff);
        differences.push(`${diff}`);
      }
    }
  });

  fs.writeFileSync(finalResultsPath, differences.join("\n"), "utf-8");
};

const calculateTimestampDifferences3And2 = async () => {
  const results3Path = path.join(process.cwd(), "results", "r3.txt");
  const results2Path = path.join(process.cwd(), "results", "r2.txt");
  const finalResultsPath = path.join(process.cwd(), "results", "diff.txt");

  const results3Data = fs.readFileSync(results3Path, "utf-8").split("\n");
  const results2Data = fs.readFileSync(results2Path, "utf-8").split("\n");

  const results3Map: { [key: string]: string } = {};
  results3Data.forEach((line) => {
    const [url, timestamp] = line.split(" - ");
    if (url && timestamp) {
      results3Map[url] = timestamp;
    }
  });

  const differences: string[] = [];

  results2Data.forEach((line) => {
    const [url, timestamp2] = line.split(" - ");
    if (url && timestamp2) {
      const timestamp3 = results3Map[url];
      if (timestamp3) {
        const diff =
          new Date(timestamp2).getTime() - new Date(timestamp3).getTime();
        console.log(timestamp3, " ", timestamp2, " ", diff);
        differences.push(`${diff}`);
      }
    }
  });

  fs.writeFileSync(finalResultsPath, differences.join("\n"), "utf-8");
};

const calculateTimestampDifferences3And1 = async () => {
  const results3Path = path.join(process.cwd(), "results", "r3.txt");
  const results1Path = path.join(process.cwd(), "results", "r1.txt");
  const finalResultsPath = path.join(process.cwd(), "results", "diff.txt");

  const results3Data = fs.readFileSync(results3Path, "utf-8").split("\n");
  const results1Data = fs.readFileSync(results1Path, "utf-8").split("\n");

  const results3Map: { [key: string]: string } = {};
  results3Data.forEach((line) => {
    const [url, timestamp] = line.split(" - ");
    if (url && timestamp) {
      results3Map[url] = timestamp;
    }
  });

  const differences: string[] = [];

  results1Data.forEach((line) => {
    const [url, timestamp1] = line.split(" - ");
    if (url && timestamp1) {
      const timestamp3 = results3Map[url];
      if (timestamp3) {
        const diff =
          new Date(timestamp1).getTime() - new Date(timestamp3).getTime();
        console.log(timestamp3, " ", timestamp1, " ", diff);
        differences.push(`${diff}`);
      }
    }
  });

  fs.writeFileSync(finalResultsPath, differences.join("\n"), "utf-8");
};

// calculateTimestampDifferences1And2().catch(console.error);
// calculateTimestampDifferences3And2().catch(console.error);
calculateTimestampDifferences3And1().catch(console.error);