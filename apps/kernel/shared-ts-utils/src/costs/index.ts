abstract class AbstractCostManager {
  abstract countBytes(inputDto: unknown): number | null;

  abstract calculateCostInUSD(inputDto: unknown): number;
}

const costStructurePerGbInUSD = {
  logging: {
    traffic: 0,
    monthlyStorage: 0.5
  },
} as const;

export class CostManager implements AbstractCostManager {
  constructor(private readonly costStructure: typeof costStructurePerGbInUSD) {}

  calculateCostInUSD(inputDto: unknown): number {
    const byteCount = this.countBytes(inputDto);
    const storageCosts = (this.costStructure.logging.monthlyStorage * byteCount) / 1e6;
    const trafficCosts = (this.costStructure.logging.traffic * byteCount) / 1e6;
    return storageCosts + trafficCosts;
  }

  countBytes(inputDto: unknown): number | null {
    if (inputDto === null) {
      return this.countBytesFromString(String(inputDto));
    }

    if (typeof inputDto === 'string') {
      return this.countBytesFromString(inputDto);
    }

    return null;
  }

  private countBytesFromString(inputDto: string): number {
    const byteArray = new TextEncoder().encode(inputDto);
    return byteArray.length;
  }
}
