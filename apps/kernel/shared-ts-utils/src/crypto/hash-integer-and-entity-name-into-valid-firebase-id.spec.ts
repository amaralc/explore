import { hashIntegerAndEntityNameIntoValidFirebaseUID } from './hash-integer-and-entity-name-into-valid-firebase-id';
import { IMultiEntityName } from './types';

describe('hashIntegerAndEntityNameIntoValidFirebaseUID', () => {
  it('should generate a valid Firebase UID of 28 characters', () => {
    // Arrange
    const integer = 4294967295;

    // Act
    const uid = hashIntegerAndEntityNameIntoValidFirebaseUID(integer, 'MultiCentralV1');

    // Assert
    expect(uid).toMatch(/^[0-9a-f]{28}$/);
  });

  it('should always generate the same UID for the same integer', () => {
    // Arrange
    const randomIntegers = Array.from({ length: 50 }, () => Math.round(Math.random() * 4294967295));

    randomIntegers.forEach((randomInteger) => {
      // Act
      const uid1 = hashIntegerAndEntityNameIntoValidFirebaseUID(randomInteger, 'MultiCentralV1');
      const uid2 = hashIntegerAndEntityNameIntoValidFirebaseUID(randomInteger, 'MultiCentralV1');
      const uid3 = hashIntegerAndEntityNameIntoValidFirebaseUID(randomInteger, 'MultiCentralV1');

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
    const ids = randomIntegers.map((randomInteger) =>
      hashIntegerAndEntityNameIntoValidFirebaseUID(randomInteger, 'MultiCentralV1'),
    );

    // Assert
    const uniqueUIDs = new Set(ids);
    expect(uniqueUIDs.size).toBe(randomIntegers.length);
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
    const ids = entityNames.map((entityName) => hashIntegerAndEntityNameIntoValidFirebaseUID(4294967295, entityName));

    // Assert
    const uniqueUIDs = new Set(ids);
    expect(uniqueUIDs.size).toBe(entityNames.length);
  });
});
