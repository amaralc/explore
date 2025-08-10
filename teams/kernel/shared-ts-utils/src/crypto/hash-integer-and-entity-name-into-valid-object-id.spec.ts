import { ObjectId } from 'mongodb';
import { hashIntegerAndEntityNameIntoValidObjectId } from './hash-integer-and-entity-name-into-valid-object-id';
import { IMultiEntityName } from './types';

describe('generateObjectIdFromNumber', () => {
  it('should generate mongodb ObjectId compatible hexadecimal string', () => {
    // Arrange
    const integer = 4294967295;

    // Act
    const id = hashIntegerAndEntityNameIntoValidObjectId(integer, 'MultiCentralV1');
    const mongoDbObjectId = new ObjectId(id);

    // Assert
    expect(() => new ObjectId(mongoDbObjectId)).not.toThrowError();
  });

  it('should always generate the same ObjectId for the same integer', () => {
    // Arrange
    const randomIntegers = Array.from({ length: 50 }, () => Math.round(Math.random() * 4294967295));

    randomIntegers.forEach((randomInteger) => {
      // Act
      const id1 = hashIntegerAndEntityNameIntoValidObjectId(randomInteger, 'MultiCentralV1');
      const id2 = hashIntegerAndEntityNameIntoValidObjectId(randomInteger, 'MultiCentralV1');
      const id3 = hashIntegerAndEntityNameIntoValidObjectId(randomInteger, 'MultiCentralV1');

      // Assert
      expect(id1).toBe(id2);
      expect(id2).toBe(id3);
      expect(id1).toBe(id3);
    });
  });

  it('should generate different UIDs for different entity names', () => {
    // Arrange
    const entityNames: Array<IMultiEntityName> = [
      'MultiCentralV1',
      'MultiDepartmentV1',
      'MultiInstitutionV1',
      'MultiUnitV1',
    ];

    // Act
    const ids = entityNames.map((entityName) => hashIntegerAndEntityNameIntoValidObjectId(4294967295, entityName));

    // Assert
    const uniqueUIDs = new Set(ids);
    expect(uniqueUIDs.size).toBe(entityNames.length);
  });
});
