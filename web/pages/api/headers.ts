import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const headers = req.headers;
  res.status(200).json(headers);
}
