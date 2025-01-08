import fs from "fs";
import path from "path";

const calculateTimestampDifferences = async () => {
  const results1Path = path.join(process.cwd(), "results", "r1.txt");
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

calculateTimestampDifferences().catch(console.error);
