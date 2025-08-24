#!/usr/bin/env node

/**
 * Translation Verification Test
 * 
 * This script verifies that all required translation keys exist in all language files.
 * It checks both nested and root-level keys to ensure the UI displays properly.
 */

const fs = require('fs');
const path = require('path');

// Define the path to locale files
const LOCALES_DIR = path.join(__dirname, 'src', 'i18n', 'locales');

// Define all supported languages
const LANGUAGES = [
  'en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru',
  'ar', 'hi', 'it', 'nl', 'pl', 'th', 'tr', 'vi'
];

// Define required root-level keys for table headers
const REQUIRED_ROOT_KEYS = [
  'task',
  'agent', 
  'description',
  'version',
  'created',
  'updated',
  'task.name',
  'task.status',
  'task.dependencies',
  'actions',
  'completed',
  'pending'
];

// Define required nested keys (actual nested structure, not root keys with dots)
const REQUIRED_NESTED_KEYS = [
  'status.pending',
  'status.inProgress',
  'status.completed'
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function checkNestedKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return true;
}

function verifyTranslations() {
  console.log(`${colors.blue}=== Translation Verification Test ===${colors.reset}\n`);
  
  let hasErrors = false;
  const results = {};
  
  // Check each language file
  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    results[lang] = { missing: [], errors: [] };
    
    console.log(`${colors.magenta}Checking ${lang}.json...${colors.reset}`);
    
    try {
      // Read and parse the JSON file
      const content = fs.readFileSync(filePath, 'utf-8');
      const translations = JSON.parse(content);
      
      // Check required root-level keys
      console.log(`  Checking root-level keys...`);
      for (const key of REQUIRED_ROOT_KEYS) {
        if (!(key in translations)) {
          results[lang].missing.push(`Root key: "${key}"`);
          console.log(`    ${colors.red}✗ Missing: "${key}"${colors.reset}`);
          hasErrors = true;
        }
      }
      
      // Check required nested keys
      console.log(`  Checking nested keys...`);
      for (const key of REQUIRED_NESTED_KEYS) {
        if (!checkNestedKey(translations, key)) {
          results[lang].missing.push(`Nested key: "${key}"`);
          console.log(`    ${colors.red}✗ Missing: "${key}"${colors.reset}`);
          hasErrors = true;
        }
      }
      
      // Check for untranslated values (still in English in non-English files)
      if (lang !== 'en') {
        const enPath = path.join(LOCALES_DIR, 'en.json');
        const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
        
        // Check specific critical keys that should be translated
        const criticalKeys = ['task', 'agent', 'description', 'created', 'updated', 'actions'];
        for (const key of criticalKeys) {
          if (translations[key] && enTranslations[key] && 
              translations[key] === enTranslations[key]) {
            results[lang].errors.push(`Key "${key}" appears untranslated (same as English)`);
            console.log(`    ${colors.yellow}⚠ Warning: "${key}" might be untranslated${colors.reset}`);
          }
        }
      }
      
      if (results[lang].missing.length === 0 && results[lang].errors.length === 0) {
        console.log(`    ${colors.green}✓ All required keys present${colors.reset}`);
      }
      
    } catch (error) {
      console.log(`    ${colors.red}✗ Error: ${error.message}${colors.reset}`);
      results[lang].errors.push(`File error: ${error.message}`);
      hasErrors = true;
    }
    
    console.log('');
  }
  
  // Print summary
  console.log(`${colors.blue}=== Summary ===${colors.reset}\n`);
  
  if (!hasErrors) {
    console.log(`${colors.green}✓ All translation files passed verification!${colors.reset}`);
    console.log(`${colors.green}✓ All required keys are present in all ${LANGUAGES.length} languages${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Translation verification failed!${colors.reset}\n`);
    
    // Print detailed errors
    for (const [lang, result] of Object.entries(results)) {
      if (result.missing.length > 0 || result.errors.length > 0) {
        console.log(`${colors.yellow}${lang}.json issues:${colors.reset}`);
        
        if (result.missing.length > 0) {
          console.log(`  Missing keys:`);
          result.missing.forEach(key => console.log(`    - ${key}`));
        }
        
        if (result.errors.length > 0) {
          console.log(`  Errors/Warnings:`);
          result.errors.forEach(error => console.log(`    - ${error}`));
        }
        
        console.log('');
      }
    }
    
    console.log(`${colors.red}Please fix the missing translations and run this test again.${colors.reset}`);
    process.exit(1);
  }
}

// Run the verification
verifyTranslations();