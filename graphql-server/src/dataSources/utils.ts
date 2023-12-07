export async function handleRefNotFound(q: () => Promise<any>): Promise<any> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (err.message.includes("invalid ref spec")) {
      throw new Error("no such ref in database");
    }
    throw err;
  }
}
