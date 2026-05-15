import type { PnrLookupResult } from "./pnrTypes";

export interface PnrProvider {
  name: string;
  lookup(pnr: string): Promise<PnrLookupResult>;
}