import { Schema } from 'ajv';
import { schemaValidator } from './index';

/**
 * References:
 * @see https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html
 * @see https://docs.confluent.io/platform/7.8/schema-registry/fundamentals/serdes-develop/serdes-json.html#json-schema-compatibility-rules
 * @see https://docs.confluent.io/platform/7.8/schema-registry/fundamentals/serdes-develop/index.html#compatibility-checks
 * @see https://yokota.blog/2021/03/29/understanding-json-schema-compatibility/
 * @see https://json-schema.org/tools?query=&sortBy=name&sortOrder=ascending&groupBy=toolingTypes&licenses=&languages=&drafts=&toolingTypes=&environments=&showObsolete=false
 */

describe('JSON Schema Backwards Compatibility', () => {
  describe('Primitive Types', () => {
    it('should allow integer to number promotion', () => {
      const writer: Schema = { type: 'integer' };
      const reader: Schema = { type: 'number' };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow number to integer demotion', () => {
      const writer: Schema = { type: 'number' };
      const reader: Schema = { type: 'integer' };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Type mismatch');
    });

    describe('String Constraints', () => {
      it('should allow writer with more restrictive minLength', () => {
        const writer: Schema = { type: 'string', minLength: 5 };
        const reader: Schema = { type: 'string', minLength: 3 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(0);
      });

      it('should not allow writer with less restrictive minLength', () => {
        const writer: Schema = { type: 'string', minLength: 2 };
        const reader: Schema = { type: 'string', minLength: 5 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('minLength');
      });

      it('should allow writer with more restrictive maxLength', () => {
        const writer: Schema = { type: 'string', maxLength: 10 };
        const reader: Schema = { type: 'string', maxLength: 15 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Number Constraints', () => {
      it('should allow writer with more restrictive minimum', () => {
        const writer: Schema = { type: 'number', minimum: 5 };
        const reader: Schema = { type: 'number', minimum: 0 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(0);
      });

      it('should not allow writer with less restrictive minimum', () => {
        const writer: Schema = { type: 'number', minimum: 0 };
        const reader: Schema = { type: 'number', minimum: 5 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('minimum');
      });

      it('should allow writer with more restrictive maximum', () => {
        const writer: Schema = { type: 'number', maximum: 5 };
        const reader: Schema = { type: 'number', maximum: 10 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(0);
      });

      it('should not allow writer with less restrictive maximum', () => {
        const writer: Schema = { type: 'number', maximum: 15 };
        const reader: Schema = { type: 'number', maximum: 5 };
        const result = schemaValidator.checkForwardCompatibility(reader, writer);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toContain('maximum');
      });
    });
  });

  describe('Object Types', () => {
    it('should allow writer with closed content model when reader has open model', () => {
      const writer: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false
      };
      const reader: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: true
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow writer with open content model when reader has closed model', () => {
      const writer: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: true
      };
      const reader: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('closed content model');
    });

    it('should allow writer with subset of reader required properties', () => {
      const writer: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name']
      };
      const reader: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name', 'age']
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1); // Reader requires more properties
    });
  });

  describe('Array Types', () => {
    it('should allow writer with more restrictive minItems', () => {
      const writer: Schema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 3
      };
      const reader: Schema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle tuple validation correctly', () => {
      const writer: Schema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' }
        ]
      };
      const reader: Schema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' }
        ]
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Enum Types', () => {
    it('should allow writer enum that is subset of reader enum', () => {
      const writer: Schema = {
        type: 'string',
        enum: ['red', 'blue']
      };
      const reader: Schema = {
        type: 'string',
        enum: ['red', 'blue', 'green']
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow writer enum that is not subset of reader enum', () => {
      const writer: Schema = {
        type: 'string',
        enum: ['red', 'blue', 'yellow']
      };
      const reader: Schema = {
        type: 'string',
        enum: ['red', 'blue', 'green']
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('enum');
    });
  });

  describe('Union Types (oneOf)', () => {
    it('should allow writer union that is subset of reader union', () => {
      const writer: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      };
      const reader: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'boolean' }
        ]
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow writer union that is not subset of reader union', () => {
      const writer: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' },
          { type: 'array' }
        ]
      };
      const reader: Schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('union');
    });
  });

  describe('Complex Schemas', () => {
    it('should validate nested object properties recursively', () => {
      const writer: Schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'integer' }
            },
            required: ['name']
          }
        }
      };
      const reader: Schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            },
            required: ['name', 'age']
          }
        }
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1); // Reader requires age property
    });

    it('should validate array of objects', () => {
      const writer: Schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' }
          },
          required: ['id']
        }
      };
      const reader: Schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' }
          },
          required: ['id']
        }
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(0); // Integer to number promotion is allowed
    });
  });

  describe('Error Cases', () => {
    it('should handle invalid JSON schemas', () => {
      const writer: Schema = {
        type: 'invalid'
      };
      const reader: Schema = {
        type: 'string'
      };
      expect(() => {
        schemaValidator.checkForwardCompatibility(reader, writer);
      }).toThrow('Invalid JSON Schema');
    });

    it('should provide clear error messages', () => {
      const writer: Schema = {
        type: 'object',
        properties: {
          age: { type: 'string' }
        }
      };
      const reader: Schema = {
        type: 'object',
        properties: {
          age: { type: 'number' }
        }
      };
      const result = schemaValidator.checkForwardCompatibility(reader, writer);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Type mismatch');
      expect(result.errorsText).toBeDefined();
      expect(result.errorsText).toContain('Type mismatch');
    });
  });
});