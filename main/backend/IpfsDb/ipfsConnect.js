import { create } from "ipfs-http-client";

const IPFS_NODE_HOST = "localhost";
const ipfs_port = 5001;

let ipfs;

// Function to initialize IPFS client
async function initIPFSClient() {
  try {
    console.log("Connecting to IPFS server...");
    ipfs = create({
      host: IPFS_NODE_HOST,
      port: ipfs_port,
      protocol: "http",
      apiPath: "/api/v0",
    });
    console.log("IPFS client initialized.");

    // Check IPFS connection
    const version = await ipfs.version();
    console.log("Connected to IPFS version:", version.version);
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("IPFS server is not running or accessible.");
    } else {
      console.error("Error connecting to IPFS server:", error);
    }
    throw error;
  }
}

export { ipfs, initIPFSClient };
