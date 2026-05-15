export type PnrProviderName = "mock" | "rapidapi";

function getPnrProvider(): PnrProviderName {
  const provider = process.env.PNR_PROVIDER?.toLowerCase();

  if (provider === "rapidapi") return "rapidapi";

  return "mock";
}

export const env = {
  pnrProvider: getPnrProvider(),

  rapidApi: {
    key: process.env.RAPIDAPI_KEY || "",
    host: process.env.RAPIDAPI_HOST || "",
    pnrEndpoint: process.env.RAPIDAPI_PNR_ENDPOINT || "",
  },
};