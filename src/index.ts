import dotenv from "dotenv";
import Client, {
  CommitmentLevel,
  SubscribeRequest,
} from "@triton-one/yellowstone-grpc";
import { convertBuffers } from "./helper";
import fs from "fs";
import path from "path";
import WebSocket from "ws";
dotenv.config();

const GRPC_URL = process.env.GRPC_URL;
const X_TOKEN = process.env.X_TOKEN;
const STAKED_GEYSER_ENHANCED_WEBSOCKET_URL =
  process.env.STAKED_GEYSER_ENHANCED_WEBSOCKET_URL;
const PUMPFUN_ACCOUNT = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

if (!GRPC_URL || !X_TOKEN || !STAKED_GEYSER_ENHANCED_WEBSOCKET_URL) {
  throw new Error("Missing configuration, don't trynna play haha");
}

const gRPCDedicatedNodeStream = async () => {
  const client = new Client(GRPC_URL, X_TOKEN, {
    "grpc.max_receive_message_length": 64 * 1024 * 1024, // 64MiB
  });

  const stream = await client.subscribe();
  const PING_INTERVAL_MS = 5_000;

  console.log("GRPC Dedicated Node Stream Started");

  const streamClosed = new Promise<void>((resolve, reject) => {
    stream.on("error", (error) => {
      reject(error);
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("close", () => {
      resolve();
    });
  });

  stream.on("data", (data) => {
    if (data && data.transaction) {
      const convertedTx = convertBuffers(data.transaction);
      const logs = convertedTx.transaction.meta.logMessages;

      if (
        logs &&
        logs.some((log: string | string[]) =>
          log.includes("Program log: Instruction: InitializeMint2")
        )
      ) {
        const signature = convertedTx.transaction.signature;
        const currentTimeStamp = new Date().toISOString();
        const message = `https://solscan.io/tx/${signature} - ${currentTimeStamp}\n`;
        fs.appendFileSync(path.join(process.cwd(), "results", "r1.txt"), message);
      }
    } else if (data.pong) {
      console.log(`Processed ping response!`);
    }
  });

  const request: SubscribeRequest = {
    commitment: CommitmentLevel.PROCESSED,
    accountsDataSlice: [],
    ping: undefined,
    transactions: {
      client: {
        vote: false,
        failed: false,
        accountInclude: [PUMPFUN_ACCOUNT],
        accountExclude: [],
        accountRequired: [],
      },
    },
    accounts: {},
    slots: {},
    transactionsStatus: {},
    entry: {},
    blocks: {},
    blocksMeta: {},
  };

  await new Promise<void>((resolve, reject) => {
    stream.write(request, (err: any) => {
      if (err === null || err === undefined) {
        resolve();
      } else {
        reject(err);
      }
    });
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });

  const pingRequest: SubscribeRequest = {
    ping: { id: 1 },
    accounts: {},
    accountsDataSlice: [],
    transactions: {},
    transactionsStatus: {},
    blocks: {},
    blocksMeta: {},
    entry: {},
    slots: {},
  };

  setInterval(async () => {
    await new Promise<void>((resolve, reject) => {
      stream.write(pingRequest, (err: any) => {
        if (err === null || err === undefined) {
          resolve();
        } else {
          reject(err);
        }
      });
    }).catch((reason) => {
      console.error(reason);
      throw reason;
    });
  }, PING_INTERVAL_MS);

  await streamClosed;
};

const geyserEnhancedWebsocketStream = async () => {
  const ws = new WebSocket(STAKED_GEYSER_ENHANCED_WEBSOCKET_URL);
  console.log("Geyser Enhanced Websocket Stream Started");
  ws.on("open", () => {
    const request = {
      jsonrpc: "2.0",
      id: 420,
      method: "transactionSubscribe",
      params: [
        {
          accountInclude: [PUMPFUN_ACCOUNT],
        },
        {
          commitment: "processed",
          encoding: "jsonParsed",
          transactionDetails: "full",
          showRewards: true,
          maxSupportedTransactionVersion: 0,
          failed: false,
        },
      ],
    };
    ws.send(JSON.stringify(request));
  });

  ws.on("message", async function incoming(data) {
    const messageStr = data.toString("utf8");
    try {
      const parsedData = JSON.parse(messageStr);
      if (parsedData && parsedData.params && parsedData.params.result) {
        const result = parsedData.params.result;
        const logs = result.transaction.meta.logMessages;
        const signature = result.signature;

        if (
          logs &&
          logs.some((log: string | string[]) =>
            log.includes("Program log: Instruction: InitializeMint2")
          )
        ) {
          const currentTimeStamp = new Date().toISOString();
          const message = `https://solscan.io/tx/${signature} - ${currentTimeStamp}\n`;
          fs.appendFileSync(path.join(process.cwd(), "results", "r2.txt"), message);
        }
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e);
    }
  });
};

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

// gRPCDedicatedNodeStream().catch(console.error);
// geyserEnhancedWebsocketStream().catch(console.error);

calculateTimestampDifferences().catch(console.error);