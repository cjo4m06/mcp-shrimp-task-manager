import { test, expect } from '@playwright/test';

test.describe('Final Release Notes Navigation Test', () => {
  test('should test Release Notes navigation with updated react-scroll implementation', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== FINAL RELEASE NOTES NAVIGATION TEST ===');
    
    // Select first version to load content
    await page.locator('.version-list button').first().click();
    await page.waitForTimeout(3000);
    
    const contentContainer = page.locator('#release-content-container');
    
    // Test the specific section links we know exist
    const sectionNames = [
      'Major New Features',
      'Initial Request Display',
      'Enhanced Release Notes Experience', 
      'Archive Management System',
      'Enhanced Agent Management'
    ];
    
    let successCount = 0;
    let testCount = 0;
    
    console.log('\\n--- TESTING SECTION NAVIGATION ---');
    
    for (const sectionName of sectionNames) {
      const link = page.locator(`a:has-text("${sectionName}")`).first();
      const linkExists = await link.count();
      
      if (linkExists > 0) {
        testCount++;
        
        // Reset to top
        await contentContainer.evaluate(el => el.scrollTop = 0);
        await page.waitForTimeout(200);
        
        try {
          await link.click();
          await page.waitForTimeout(1000);
          
          const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
          if (scrollPos > 10) {
            successCount++;
            console.log(`  ✅ "${sectionName}" -> scrolled to ${scrollPos}px`);
          } else {
            console.log(`  ❌ "${sectionName}" -> no scroll (${scrollPos}px)`);
          }
        } catch (error) {
          console.log(`  ❌ "${sectionName}" -> Error: ${error.message}`);
        }
      } else {
        console.log(`  ⚠️ "${sectionName}" -> Link not found`);
      }
    }
    
    const clickSuccessRate = testCount > 0 ? Math.round((successCount / testCount) * 100) : 0;
    console.log(`\\nClick Navigation Results: ${clickSuccessRate}% (${successCount}/${testCount})`);
    
    // Test scroll spy
    console.log('\\n--- TESTING SCROLL SPY ---');
    
    const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
    console.log(`Max scroll: ${maxScroll}px`);
    
    let spyChanges = 0;
    let previousActive = null;
    
    if (maxScroll > 200) {
      const positions = [0, Math.floor(maxScroll * 0.25), Math.floor(maxScroll * 0.5), Math.floor(maxScroll * 0.75), maxScroll];
      
      for (const pos of positions) {
        await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
        await page.waitForTimeout(1000);
        
        const currentActive = await page.evaluate(() => {
          const active = document.querySelector('[style*="rgba(79, 189, 186, 0.6)"]');
          return active ? active.textContent?.trim().substring(0, 30) || '' : null;
        });
        
        const percentage = Math.round((pos / maxScroll) * 100);
        
        if (currentActive && currentActive !== previousActive && previousActive !== null) {
          spyChanges++;
        }
        
        console.log(`  ${percentage}%: ${currentActive ? `"${currentActive}..."` : 'No active'}`);
        previousActive = currentActive;
      }
    }
    
    const spyEffectiveness = positions ? Math.round((spyChanges / (positions.length - 1)) * 100) : 0;
    console.log(`\\nScroll Spy Results: ${spyEffectiveness}% (${spyChanges} changes)`);
    
    // Final assessment
    console.log('\\n=== FINAL RELEASE NOTES ASSESSMENT ===');
    
    if (clickSuccessRate >= 90 && spyEffectiveness >= 60) {
      console.log('🎉 RELEASE NOTES REACT-SCROLL: EXCELLENT SUCCESS! 🎉');
    } else if (clickSuccessRate >= 80 && spyEffectiveness >= 40) {
      console.log('✅ Release Notes react-scroll: Good performance');  
    } else if (clickSuccessRate >= 80) {
      console.log('✅ Click navigation excellent, scroll spy needs work');
    } else if (spyEffectiveness >= 60) {
      console.log('✅ Scroll spy good, click navigation needs work'); 
    } else {
      console.log('❌ Release Notes navigation needs improvement');
    }
    
    console.log(`Release Notes Final Scores: Click ${clickSuccessRate}% | Scroll Spy ${spyEffectiveness}%`);
  });
});