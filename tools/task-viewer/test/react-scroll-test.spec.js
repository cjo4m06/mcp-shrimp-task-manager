import { test, expect } from '@playwright/test';

test.describe('React-Scroll Implementation Test', () => {
  test('should test Help page with react-scroll implementation', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Help');
    await page.waitForTimeout(3000);
    
    console.log('=== REACT-SCROLL HELP PAGE TEST ===');
    
    // Check content container
    const contentContainer = page.locator('#help-content-container');
    const containerExists = await contentContainer.count();
    console.log(`Help content container found: ${containerExists}`);
    
    if (containerExists === 0) {
      console.log('❌ Help content container not found');
      return;
    }
    
    // Test TOC links (should now be react-scroll Link components)
    const scrollLinks = await page.locator('.toc-list [role="button"]').count();
    const regularLinks = await page.locator('.toc-list a').count();
    console.log(`ScrollLinks found: ${scrollLinks}, Regular links: ${regularLinks}`);
    
    // Get all clickable elements in TOC
    const tocClickables = await page.locator('.toc-list [style*="cursor: pointer"]').count();
    console.log(`TOC clickable elements: ${tocClickables}`);
    
    // Test clicking functionality
    if (tocClickables > 0) {
      console.log('\n--- TESTING REACT-SCROLL CLICK NAVIGATION ---');
      
      // Get initial scroll position
      const initialScroll = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`Initial scroll: ${initialScroll}`);
      
      // Click first clickable TOC item
      try {
        await page.locator('.toc-list [style*="cursor: pointer"]').first().click();
        await page.waitForTimeout(1000);
        
        const newScroll = await contentContainer.evaluate(el => el.scrollTop);
        console.log(`New scroll: ${newScroll}`);
        console.log(`Scroll changed: ${newScroll !== initialScroll ? 'YES ✅' : 'NO ❌'}`);
      } catch (error) {
        console.log(`❌ Click failed: ${error.message}`);
      }
      
      // Test more clicks
      const testClicks = Math.min(3, tocClickables);
      for (let i = 1; i < testClicks; i++) {
        await contentContainer.evaluate(el => el.scrollTop = 0);
        await page.waitForTimeout(300);
        
        await page.locator('.toc-list [style*="cursor: pointer"]').nth(i).click();
        await page.waitForTimeout(800);
        
        const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
        console.log(`  Click ${i}: scrolled to ${scrollPos}px`);
      }
    }
    
    // Test scroll spy with extensive scrolling
    console.log('\n--- TESTING REACT-SCROLL SPY (EXTENSIVE) ---');
    
    const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
    console.log(`Document max scroll: ${maxScroll}px`);
    
    // Get currently active element helper
    const getActiveElement = async () => {
      return await page.evaluate(() => {
        // Look for elements with scroll-active class
        const activeScrollLink = document.querySelector('.toc-list .scroll-active');
        if (activeScrollLink) {
          return { 
            type: 'scroll-active', 
            text: activeScrollLink.textContent?.trim() || '',
            element: activeScrollLink.tagName 
          };
        }
        
        // Fallback to custom styling
        const styledActive = document.querySelector('.toc-list [style*="rgba(79, 189, 186, 0.6)"]');
        if (styledActive) {
          return { 
            type: 'styled-active', 
            text: styledActive.textContent?.trim() || '',
            element: styledActive.tagName 
          };
        }
        
        return null;
      });
    };
    
    // Test scroll positions throughout document
    const testPositions = [
      0,
      Math.floor(maxScroll * 0.1),   // 10%
      Math.floor(maxScroll * 0.3),   // 30%
      Math.floor(maxScroll * 0.5),   // 50%
      Math.floor(maxScroll * 0.7),   // 70%
      Math.floor(maxScroll * 0.9),   // 90%
      maxScroll                      // 100%
    ];
    
    let previousActive = null;
    let scrollSpyChanges = 0;
    
    for (const pos of testPositions) {
      await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
      await page.waitForTimeout(1000); // Wait for scroll spy to update
      
      const currentActive = await getActiveElement();
      const percentage = Math.round((pos / maxScroll) * 100);
      
      if (currentActive) {
        const changed = !previousActive || currentActive.text !== previousActive.text;
        if (changed && previousActive) scrollSpyChanges++;
        
        console.log(`  ${percentage}% (${pos}px) -> Active: "${currentActive.text}" (${currentActive.type}) - Changed: ${changed ? 'YES' : 'NO'}`);
        previousActive = currentActive;
      } else {
        console.log(`  ${percentage}% (${pos}px) -> No active element found`);
      }
    }
    
    console.log(`\nScroll spy changes: ${scrollSpyChanges} out of ${testPositions.length - 1} possible`);
    const effectiveness = Math.round((scrollSpyChanges / (testPositions.length - 1)) * 100);
    console.log(`React-scroll effectiveness: ${effectiveness}%`);
    
    if (effectiveness >= 80) {
      console.log('🎉 REACT-SCROLL IS WORKING EXCELLENTLY! 🎉');
    } else if (effectiveness >= 60) {
      console.log('✅ React-scroll is working well');
    } else {
      console.log('❌ React-scroll needs improvement');
    }
  });
});