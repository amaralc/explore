import { hashIntegerIntoValidFirebaseUID } from './hash-integer-into-valid-firebase-id';

describe('hashIntegerIntoValidFirebaseUID', () => {
  it('should generate a valid Firebase UID of 28 characters', () => {
    // Arrange
    const integer = 4294967295;

    // Act
    const uid = hashIntegerIntoValidFirebaseUID(integer);

    // Assert
    expect(uid).toMatch(/^[0-9a-f]{28}$/);
  });

  it('should always generate the same UID for the same integer', () => {
    // Arrange
    const randomIntegers = Array.from({ length: 50 }, () => Math.round(Math.random() * 4294967295));

    randomIntegers.forEach((randomInteger) => {
      // Act
      const uid1 = hashIntegerIntoValidFirebaseUID(randomInteger);
      const uid2 = hashIntegerIntoValidFirebaseUID(randomInteger);
      const uid3 = hashIntegerIntoValidFirebaseUID(randomInteger);

      // Assert
      expect(uid1).toBe(uid2);
      expect(uid2).toBe(uid3);
      expect(uid1).toBe(uid3);
    });
  });

  it('should generate different UIDs for different integers', () => {
    // Arrange
    const randomIntegers = Array.from({ length: 50 }, () => Math.round(Math.random() * 4294967295));

    // Act
    const ids = randomIntegers.map((randomInteger) => hashIntegerIntoValidFirebaseUID(randomInteger));

    // Assert
    const uniqueUIDs = new Set(ids);
    expect(uniqueUIDs.size).toBe(randomIntegers.length);
  });
});
