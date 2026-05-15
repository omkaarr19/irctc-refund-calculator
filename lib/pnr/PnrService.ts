import type { PnrProvider } from "./PnrProvider";
import type { PnrLookupResult } from "./pnrTypes";
import { MockPnrProvider } from "./MockPnrProvider";

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
  return new PnrService([
    // Later we will add real providers here.
    new MockPnrProvider(),
  ]);
}