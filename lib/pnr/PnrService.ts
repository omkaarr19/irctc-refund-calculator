import { env } from "@/lib/config/env";
import { MockPnrProvider } from "./MockPnrProvider";
import type { PnrProvider } from "./PnrProvider";
import type { PnrLookupResult } from "./pnrTypes";
import { RapidApiPnrProvider } from "./RapidApiPnrProvider";

export class PnrService {
  constructor(private readonly providers: PnrProvider[]) {}

  async lookup(pnr: string): Promise<PnrLookupResult> {
    if (!/^\d{10}$/.test(pnr)) {
      throw new Error("PNR must be exactly 10 digits.");
    }

    const errors: string[] = [];

    for (const provider of this.providers) {
      try {
        return await provider.lookup(pnr);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown provider error";

        errors.push(`${provider.name}: ${message}`);
      }
    }

    throw new Error(
      errors.length > 0
        ? `All PNR providers failed. ${errors.join(" | ")}`
        : "No PNR provider configured."
    );
  }
}

export function createPnrService() {
  if (env.pnrProvider === "rapidapi") {
    return new PnrService([
      new RapidApiPnrProvider({
        apiKey: env.rapidApi.key,
        apiHost: env.rapidApi.host,
        endpoint: env.rapidApi.pnrEndpoint,
      }),

      // fallback provider
      new MockPnrProvider(),
    ]);
  }

  return new PnrService([new MockPnrProvider()]);
}