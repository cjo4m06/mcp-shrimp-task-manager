import { test, expect } from '@playwright/test';

test.describe('Visual Check', () => {
  test('should check if changes are visible', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click Help link
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    // Take screenshot to see if red borders are visible
    await page.screenshot({ path: 'visual-check.png' });
    
    // Check if H2 elements have red border
    const h2WithBorder = await page.locator('h2[style*="border"]').count();
    console.log(`H2 elements with border: ${h2WithBorder}`);
    
    if (h2WithBorder > 0) {
      console.log('✅ Changes are live - red borders visible');
    } else {
      console.log('❌ Changes not live - no red borders found');
    }
  });
});