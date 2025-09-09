import { test, expect } from '@playwright/test';

test.describe('Extensive Scroll Testing', () => {
  test('should test Help page scroll spy throughout entire document', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    console.log('=== EXTENSIVE HELP PAGE SCROLL TEST ===');
    
    const contentContainer = page.locator('.release-details');
    
    // Get document height for testing
    const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
    console.log(`Document max scroll: ${maxScroll}px`);
    
    const getActiveItem = async () => {
      return await page.locator('.toc-list a').evaluateAll(links => {
        const activeLink = links.find(link => {
          const style = window.getComputedStyle(link);
          return style.backgroundColor === 'rgba(79, 189, 186, 0.6)';
        });
        return activeLink ? activeLink.textContent?.trim() : null;
      });
    };
    
    // Test scroll positions throughout the entire document
    const testPositions = [
      0,
      Math.floor(maxScroll * 0.1),   // 10%
      Math.floor(maxScroll * 0.25),  // 25%
      Math.floor(maxScroll * 0.5),   // 50%
      Math.floor(maxScroll * 0.75),  // 75%
      Math.floor(maxScroll * 0.9),   // 90%
      maxScroll                      // 100%
    ];
    
    console.log('\n--- SCROLL SPY TEST THROUGHOUT DOCUMENT ---');
    let previousActive = null;
    let scrollSpyWorkingCount = 0;
    
    for (const pos of testPositions) {
      await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
      await page.waitForTimeout(800); // Longer wait for scroll spy to update
      
      const currentActive = await getActiveItem();
      const changed = currentActive !== previousActive;
      const percentage = Math.round((pos / maxScroll) * 100);
      
      console.log(`  ${percentage}% (${pos}px) -> Active: "${currentActive}" (Changed: ${changed ? 'YES' : 'NO'})`);
      
      if (changed && previousActive !== null) {
        scrollSpyWorkingCount++;
      }
      
      previousActive = currentActive;
    }
    
    console.log(`\nScroll spy changes detected: ${scrollSpyWorkingCount} out of ${testPositions.length - 1} possible`);
    console.log(`Scroll spy effectiveness: ${Math.round((scrollSpyWorkingCount / (testPositions.length - 1)) * 100)}%`);
    
    if (scrollSpyWorkingCount < testPositions.length - 2) {
      console.log('❌ SCROLL SPY FAILS IN DEEPER SECTIONS');
    } else {
      console.log('✅ SCROLL SPY WORKS THROUGHOUT DOCUMENT');
    }
  });
  
  test('should test Release Notes page navigation and scroll spy', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('\n=== RELEASE NOTES PAGE TEST ===');
    
    // Find content container for Release Notes
    const contentContainer = page.locator('.release-details');
    const containerExists = await contentContainer.count();
    console.log(`Release Notes content container found: ${containerExists}`);
    
    if (containerExists === 0) {
      console.log('❌ Release Notes content container not found');
      return;
    }
    
    // Test TOC links
    const tocLinks = await page.locator('.toc-list a[href^="#"]').count();
    console.log(`Found ${tocLinks} TOC links in Release Notes`);
    
    if (tocLinks === 0) {
      console.log('❌ No TOC links found in Release Notes');
      return;
    }
    
    // Test clicking first few links
    console.log('\n--- TESTING RELEASE NOTES CLICK NAVIGATION ---');
    const testLinks = await page.locator('.toc-list a[href^="#"]').evaluateAll(links =>
      links.slice(0, 3).map(link => ({
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href')
      }))
    );
    
    for (const link of testLinks) {
      // Reset to top
      await contentContainer.evaluate(el => el.scrollTop = 0);
      await page.waitForTimeout(300);
      
      // Click link
      try {
        await page.locator(`a[href="${link.href}"]`).first().click();
        await page.waitForTimeout(500);
        
        const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
        console.log(`  ✅ "${link.text}" -> scrolled to ${scrollPos}px`);
      } catch (error) {
        console.log(`  ❌ "${link.text}" -> failed to click: ${error.message}`);
      }
    }
    
    // Test scroll spy
    console.log('\n--- TESTING RELEASE NOTES SCROLL SPY ---');
    const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
    
    const getActiveItem = async () => {
      return await page.locator('.toc-list a').evaluateAll(links => {
        const activeLink = links.find(link => {
          const style = window.getComputedStyle(link);
          return style.backgroundColor && style.backgroundColor !== 'transparent' && 
                 style.backgroundColor !== 'rgba(0, 0, 0, 0)';
        });
        return activeLink ? activeLink.textContent?.trim() : null;
      });
    };
    
    const testPositions = [0, Math.floor(maxScroll * 0.3), Math.floor(maxScroll * 0.7), maxScroll];
    let previousActive = null;
    
    for (const pos of testPositions) {
      await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
      await page.waitForTimeout(800);
      
      const currentActive = await getActiveItem();
      const changed = currentActive !== previousActive;
      const percentage = Math.round((pos / maxScroll) * 100);
      
      console.log(`  ${percentage}% -> Active: "${currentActive}" (Changed: ${changed ? 'YES' : 'NO'})`);
      previousActive = currentActive;
    }
  });
});