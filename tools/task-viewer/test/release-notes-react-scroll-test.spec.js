import { test, expect } from '@playwright/test';

test.describe('Release Notes React-Scroll Test', () => {
  test('should test Release Notes page with react-scroll implementation', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(3000);
    
    console.log('=== RELEASE NOTES REACT-SCROLL TEST ===');
    
    // Check content container
    const contentContainer = page.locator('#release-content-container');
    const containerExists = await contentContainer.count();
    console.log(`Release content container found: ${containerExists}`);
    
    if (containerExists === 0) {
      console.log('❌ Release content container not found');
      return;
    }
    
    // Check for scroll elements with data-scroll-element attribute
    const scrollElementsCount = await contentContainer.locator('[data-scroll-element]').count();
    console.log(`Scroll elements found: ${scrollElementsCount}`);
    
    // Test TOC clickable divs (should now be div elements with onClick)
    const tocClickables = await page.locator('.toc-list div[style*="cursor: pointer"]').count();
    console.log(`TOC clickable divs: ${tocClickables}`);
    
    // Test clicking functionality
    let clickTests = 0;
    let clickSuccesses = 0;
    let clickSuccessRate = 0;
    
    if (tocClickables > 0) {
      console.log('\\n--- TESTING RELEASE NOTES CLICK NAVIGATION ---');
      
      // Get initial scroll position
      const initialScroll = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`Initial scroll: ${initialScroll}`);
      
      // Test first few clicks
      const testCount = Math.min(5, tocClickables);
      
      for (let i = 0; i < testCount; i++) {
        const clickable = page.locator('.toc-list div[style*="cursor: pointer"]').nth(i);
        const linkText = await clickable.textContent();
        
        // Reset scroll to top
        await contentContainer.evaluate(el => el.scrollTop = 0);
        await page.waitForTimeout(300);
        
        try {
          await clickable.click();
          await page.waitForTimeout(800);
          
          const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
          clickTests++;
          
          if (scrollPos > 10) {
            clickSuccesses++;
            console.log(`  ✅ Click ${i}: "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px`);
          } else {
            console.log(`  ❌ Click ${i}: "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px (failed)`);
          }
        } catch (error) {
          console.log(`  ❌ Click ${i}: "${linkText?.trim().substring(0, 30)}..." -> Error: ${error.message}`);
        }
      }
      
      clickSuccessRate = Math.round((clickSuccesses / clickTests) * 100);
      console.log(`Release Notes Click Navigation Success Rate: ${clickSuccessRate}% (${clickSuccesses}/${clickTests})`);
    }
    
    // Test scroll spy
    console.log('\\n--- TESTING RELEASE NOTES SCROLL SPY ---');
    
    const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
    console.log(`Document max scroll: ${maxScroll}px`);
    
    if (maxScroll > 100) {
      // Helper to get currently active element
      const getActiveElement = async () => {
        return await page.evaluate(() => {
          const activeElement = document.querySelector('.toc-list [style*="rgba(79, 189, 186, 0.6)"]');
          return activeElement ? activeElement.textContent?.trim() || '' : null;
        });
      };
      
      // Test scroll positions throughout document
      const testPositions = [
        0,
        Math.floor(maxScroll * 0.2),
        Math.floor(maxScroll * 0.5),
        Math.floor(maxScroll * 0.8),
        maxScroll
      ];
      
      let scrollSpyChanges = 0;
      let previousActive = null;
      
      for (const pos of testPositions) {
        await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
        await page.waitForTimeout(1000);
        
        const currentActive = await getActiveElement();
        const percentage = Math.round((pos / maxScroll) * 100);
        
        const changed = currentActive && currentActive !== previousActive;
        if (changed && previousActive) scrollSpyChanges++;
        
        if (currentActive) {
          console.log(`  ${percentage}% (${pos}px) -> Active: "${currentActive.substring(0, 40)}..." - Changed: ${changed ? 'YES' : 'NO'}`);
        } else {
          console.log(`  ${percentage}% (${pos}px) -> No active element`);
        }
        
        previousActive = currentActive;
      }
      
      const scrollSpyEffectiveness = Math.round((scrollSpyChanges / (testPositions.length - 1)) * 100);
      console.log(`\\nRelease Notes Scroll Spy Effectiveness: ${scrollSpyEffectiveness}% (${scrollSpyChanges}/${testPositions.length - 1} transitions)`);
      
      // Overall assessment for Release Notes
      console.log('\\n=== RELEASE NOTES ASSESSMENT ===');
      
      if (clickSuccessRate >= 90 && scrollSpyEffectiveness >= 60) {
        console.log('🎉 RELEASE NOTES REACT-SCROLL: EXCELLENT! 🎉');
      } else if (clickSuccessRate >= 70 && scrollSpyEffectiveness >= 40) {
        console.log('✅ Release Notes react-scroll: Good');
      } else {
        console.log('❌ Release Notes react-scroll: Needs improvement');
      }
      
      console.log(`Release Notes Scores: Click ${clickSuccessRate}% | Scroll Spy ${scrollSpyEffectiveness}%`);
    } else {
      console.log('⚠️  Document too short for meaningful scroll spy test');
    }
  });
});