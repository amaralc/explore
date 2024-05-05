import { ObjectId } from 'mongodb';
import { hashIntegerIntoValidObjectId } from './hash-integer-into-valid-object-id';

describe('generateObjectIdFromNumber', () => {
  it('should generate mongodb ObjectId compatible hexadecimal string', () => {
    // Arrange
    const integer = 4294967295;

    // Act
    const id = hashIntegerIntoValidObjectId(integer);
    const mongoDbObjectId = new ObjectId(id);

    // Assert
    expect(() => new ObjectId(mongoDbObjectId)).not.toThrowError();
  });

  it('should always generate the same ObjectId for the same integer', () => {
    // Arrange
    const randomIntegers = Array.from({ length: 50 }, () => Math.round(Math.random() * 4294967295));

    randomIntegers.forEach((randomInteger) => {
      // Act
      const id1 = hashIntegerIntoValidObjectId(randomInteger);
      const id2 = hashIntegerIntoValidObjectId(randomInteger);
      const id3 = hashIntegerIntoValidObjectId(randomInteger);

      // Assert
      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
      expect(id1).toBe(id3);
    });
  });
});
