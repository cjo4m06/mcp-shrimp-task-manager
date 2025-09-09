import { test, expect } from '@playwright/test';

test.describe('Scroller Implementation Test', () => {
  test('should test Help page with react-scroll scroller implementation', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Help');
    await page.waitForTimeout(3000);
    
    console.log('=== REACT-SCROLL SCROLLER TEST ===');
    
    // Check content container
    const contentContainer = page.locator('#help-content-container');
    const containerExists = await contentContainer.count();
    console.log(`Help content container found: ${containerExists}`);
    
    if (containerExists === 0) {
      console.log('❌ Help content container not found');
      return;
    }
    
    // Test TOC clickable divs (should now be div elements with onClick)
    const tocClickables = await page.locator('.toc-list div[style*="cursor: pointer"]').count();
    console.log(`TOC clickable divs: ${tocClickables}`);
    
    // Test clicking functionality
    if (tocClickables > 0) {
      console.log('\\n--- TESTING SCROLLER CLICK NAVIGATION ---');
      
      // Get initial scroll position
      const initialScroll = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`Initial scroll: ${initialScroll}`);
      
      // Click first clickable TOC item (div not button)
      try {
        const firstClickable = page.locator('.toc-list div[style*="cursor: pointer"]').first();
        const linkText = await firstClickable.textContent();
        console.log(`Clicking on: "${linkText?.trim()}"`);
        
        await firstClickable.click();
        await page.waitForTimeout(1000);
        
        const newScroll = await contentContainer.evaluate(el => el.scrollTop);
        console.log(`New scroll: ${newScroll}`);
        console.log(`Scroll changed: ${newScroll !== initialScroll ? 'YES ✅' : 'NO ❌'}`);
        console.log(`Scroll difference: ${newScroll - initialScroll}px`);
      } catch (error) {
        console.log(`❌ Click failed: ${error.message}`);
      }
      
      // Test more clicks to different sections
      const testClicks = Math.min(3, tocClickables);
      for (let i = 1; i < testClicks; i++) {
        console.log(`\\n--- Test Click ${i} ---`);
        
        // Reset scroll to top
        await contentContainer.evaluate(el => el.scrollTop = 0);
        await page.waitForTimeout(300);
        
        const clickable = page.locator('.toc-list div[style*="cursor: pointer"]').nth(i);
        const linkText = await clickable.textContent();
        console.log(`Clicking on: "${linkText?.trim()}"`);
        
        try {
          await clickable.click();
          await page.waitForTimeout(1000);
          
          const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
          console.log(`  Scrolled to: ${scrollPos}px`);
          
          if (scrollPos > 50) {
            console.log(`  ✅ Scroll successful`);
          } else {
            console.log(`  ❌ Scroll failed or minimal`);
          }
        } catch (error) {
          console.log(`  ❌ Click failed: ${error.message}`);
        }
      }
    }
    
    console.log('\\n=== SCROLLER TEST COMPLETE ===');
  });
});