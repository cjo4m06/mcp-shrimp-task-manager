import { test, expect } from '@playwright/test';

test.describe('Simple Release Notes Test', () => {
  test('should test Release Notes navigation with local hash links', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== SIMPLE RELEASE NOTES TEST ===');
    
    // Select first version
    await page.locator('.version-list button').first().click();
    await page.waitForTimeout(3000);
    
    const contentContainer = page.locator('#release-content-container');
    
    // Look for anchor links with localhost and hash (the ones we found in debug)
    const hashLinks = page.locator('a[href*="localhost"][href*="#"]');
    const linkCount = await hashLinks.count();
    console.log(`Hash links found: ${linkCount}`);
    
    if (linkCount > 0) {
      console.log('\\n--- TESTING HASH LINK CLICKS ---');
      
      // Test first 3 links
      let successCount = 0;
      const testCount = Math.min(3, linkCount);
      
      for (let i = 0; i < testCount; i++) {
        const link = hashLinks.nth(i);
        const linkText = await link.textContent();
        
        // Reset to top
        await contentContainer.evaluate(el => el.scrollTop = 0);
        await page.waitForTimeout(200);
        
        try {
          await link.click();
          await page.waitForTimeout(800);
          
          const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
          if (scrollPos > 5) {
            successCount++;
            console.log(`  ✅ Link ${i}: "${linkText?.trim().substring(0, 35)}..." scrolled to ${scrollPos}px`);
          } else {
            console.log(`  ❌ Link ${i}: "${linkText?.trim().substring(0, 35)}..." no scroll (${scrollPos}px)`);
          }
        } catch (error) {
          console.log(`  ❌ Link ${i}: Error clicking - ${error.message}`);
        }
      }
      
      const clickSuccessRate = Math.round((successCount / testCount) * 100);
      console.log(`\\nRelease Notes click success: ${clickSuccessRate}% (${successCount}/${testCount})`);
      
      if (clickSuccessRate >= 100) {
        console.log('🎉 RELEASE NOTES CLICK NAVIGATION: PERFECT! 🎉');
      } else if (clickSuccessRate >= 70) {
        console.log('✅ Release Notes click navigation: Good');
      } else {
        console.log('❌ Release Notes click navigation: Needs improvement');
      }
    } else {
      console.log('❌ No hash links found');
    }
  });
});