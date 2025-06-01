import { describe, it, expect } from 'vitest';
import { UUID_V4_REGEX } from '../../src/utils/regex.js';
import { v4 as uuidv4 } from 'uuid';

describe('Regex Utils', () => {
  describe('UUID_V4_REGEX', () => {
    it('should match valid UUID v4 strings', () => {
      const validUUIDs = [
        uuidv4(),
        uuidv4(),
        uuidv4(),
        '550e8400-e29b-41d4-a716-446655440000', // Valid v4 UUID
        'f47ac10b-58cc-4372-a567-0e02b2c3d479', // Valid v4 UUID
      ];

      validUUIDs.forEach(uuid => {
        expect(UUID_V4_REGEX.test(uuid)).toBe(true);
      });
    });

    it('should not match invalid UUID formats', () => {
      const invalidUUIDs = [
        '',
        'not-a-uuid',
        '123',
        '550e8400-e29b-41d4-a716', // Too short
        '550e8400-e29b-41d4-a716-446655440000-extra', // Too long
        '550e8400-e29b-41d4-a716-44665544000g', // Invalid character
        '550e8400e29b41d4a716446655440000', // Missing hyphens
        '550e8400-e29b-41d4-a716-446655440000-', // Extra hyphen
        'gggggggg-gggg-gggg-gggg-gggggggggggg', // Invalid characters
        '550e8400-e29b-51d4-a716-446655440000', // Invalid version (5 instead of 4)
        '550e8400-e29b-31d4-a716-446655440000', // Invalid version (3 instead of 4)
      ];

      invalidUUIDs.forEach(uuid => {
        expect(UUID_V4_REGEX.test(uuid)).toBe(false);
      });
    });

    it('should match UUID v4 with correct version and variant bits', () => {
      // Generate multiple UUIDs and verify they all match
      for (let i = 0; i < 10; i++) {
        const uuid = uuidv4();
        expect(UUID_V4_REGEX.test(uuid)).toBe(true);
        
        // Verify version bit (4th character of 3rd group should be '4')
        const parts = uuid.split('-');
        expect(parts[2][0]).toBe('4');
        
        // Verify variant bits (1st character of 4th group should be 8, 9, a, or b)
        const variantChar = parts[3][0].toLowerCase();
        expect(['8', '9', 'a', 'b']).toContain(variantChar);
      }
    });

    it('should be case insensitive', () => {
      const uuid = uuidv4();
      const upperCaseUUID = uuid.toUpperCase();
      const lowerCaseUUID = uuid.toLowerCase();
      const mixedCaseUUID = uuid.split('').map((char, index) => 
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
      ).join('');

      expect(UUID_V4_REGEX.test(upperCaseUUID)).toBe(true);
      expect(UUID_V4_REGEX.test(lowerCaseUUID)).toBe(true);
      expect(UUID_V4_REGEX.test(mixedCaseUUID)).toBe(true);
    });

    it('should not match UUIDs with wrong version numbers', () => {
      const baseUUID = '550e8400-e29b-41d4-a716-446655440000';
      
      // Test different version numbers (should only accept version 4)
      const versions = ['1', '2', '3', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
      
      versions.forEach(version => {
        const modifiedUUID = baseUUID.replace('41d4', `${version}1d4`);
        expect(UUID_V4_REGEX.test(modifiedUUID)).toBe(false);
      });
    });

    it('should not match UUIDs with wrong variant bits', () => {
      const baseUUID = '550e8400-e29b-41d4-a716-446655440000';
      
      // Test different variant bits (should only accept 8, 9, a, b)
      const invalidVariants = ['0', '1', '2', '3', '4', '5', '6', '7', 'c', 'd', 'e', 'f'];
      
      invalidVariants.forEach(variant => {
        const modifiedUUID = baseUUID.replace('a716', `${variant}716`);
        expect(UUID_V4_REGEX.test(modifiedUUID)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      const edgeCases = [
        null,
        undefined,
        0,
        false,
        {},
        [],
        function() {},
      ];

      edgeCases.forEach(edgeCase => {
        expect(UUID_V4_REGEX.test(edgeCase as any)).toBe(false);
      });
    });

    it('should match UUIDs in strings with surrounding text', () => {
      const uuid = uuidv4();
      const textWithUUID = `Task ID: ${uuid} - This is a task`;

      // Create a regex without anchors for substring matching
      const uuidRegexNoAnchors = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/;
      const match = textWithUUID.match(uuidRegexNoAnchors);
      expect(match).not.toBeNull();
      expect(match![0]).toBe(uuid);
    });

    it('should match multiple UUIDs in a string', () => {
      const uuid1 = uuidv4();
      const uuid2 = uuidv4();
      const textWithUUIDs = `First task: ${uuid1}, Second task: ${uuid2}`;

      // Create a global regex without anchors for multiple matches
      const uuidRegexGlobal = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/g;
      const matches = textWithUUIDs.match(uuidRegexGlobal);
      expect(matches).toHaveLength(2);
      expect(matches).toContain(uuid1);
      expect(matches).toContain(uuid2);
    });
  });
});
