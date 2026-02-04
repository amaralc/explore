import { CostManager } from './index';
import { costStructurePerGbInUSD } from './config';
describe('CostManager', () => {
  let costManager: CostManager;
  beforeEach(() => {
    costManager = new CostManager(costStructurePerGbInUSD);
  });
  describe('countBytes', () => {
    it('should correctly count bytes for ASCII string', () => {
      const input = 'Hello, World!';
      expect(costManager.countBytes(input)).toBe(13);
    });
    it('should correctly count bytes for UTF-8 characters', () => {
      const input = '你好，世界！'; // Chinese characters
      expect(costManager.countBytes(input)).toBe(18); // Each Chinese character is 3 bytes in UTF-8
    });
    it('should handle empty string', () => {
      expect(costManager.countBytes('')).toBe(0);
    });
    it('should handle null input', () => {
      expect(costManager.countBytes(null)).toBe(4); // "null" string length
    });
    it('should return null for non-string/non-null input', () => {
      expect(costManager.countBytes(123)).toBeNull();
      expect(costManager.countBytes({})).toBeNull();
      expect(costManager.countBytes([])).toBeNull();
      expect(costManager.countBytes(undefined)).toBeNull();
    });
  });
  describe('calculateCostInUSD', () => {
    it('should calculate correct cost for ASCII string', () => {
      const input = 'Hello, World!'; // 13 bytes
      // Cost = (storage + traffic) * bytes / 1e6
      // Cost = (0.5 + 0) * 13 / 1e6 = 6.5e-6
      expect(costManager.calculateCostInUSD(input)).toBeCloseTo(6.5e-6, 10);
    });
    it('should calculate correct cost for UTF-8 string', () => {
      const input = '你好，世界！'; // 18 bytes
      // Cost = (0.5 + 0) * 18 / 1e6 = 9e-6
      expect(costManager.calculateCostInUSD(input)).toBeCloseTo(9e-6, 10);
    });
    it('should handle empty string', () => {
      expect(costManager.calculateCostInUSD('')).toBe(0);
    });
    it('should calculate cost for null input', () => {
      // "null" is 4 bytes
      // Cost = (0.5 + 0) * 4 / 1e6 = 2e-6
      expect(costManager.calculateCostInUSD(null)).toBeCloseTo(2e-6, 10);
    });
    it('should return 0 for non-string/non-null input', () => {
      expect(costManager.calculateCostInUSD(123)).toBe(0);
      expect(costManager.calculateCostInUSD({})).toBe(0);
      expect(costManager.calculateCostInUSD([])).toBe(0);
      expect(costManager.calculateCostInUSD(undefined)).toBe(0);
    });
  });
});
