import { NextApiHandler } from "next";

const cfg = {
  graphqlApiUrl: process.env.GRAPHQLAPI_URL,
};

export type ServerConfig = typeof cfg;

const handler: NextApiHandler = (_req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(cfg));
};

export default handler;
