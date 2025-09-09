import { test, expect } from '@playwright/test';

test.describe('Release Notes with Version Selection Test', () => {
  test('should test Release Notes after selecting a version', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== RELEASE NOTES WITH VERSION SELECTION TEST ===');
    
    // First, try to select a version
    console.log('\\n--- SELECTING A VERSION ---');
    
    const versionButtons = await page.locator('.version-list button, .version-list li button').count();
    console.log(`Version buttons found: ${versionButtons}`);
    
    if (versionButtons > 0) {
      // Click the first version
      const firstVersion = page.locator('.version-list button, .version-list li button').first();
      const versionText = await firstVersion.textContent();
      console.log(`Selecting version: ${versionText?.trim().substring(0, 30)}...`);
      
      await firstVersion.click();
      await page.waitForTimeout(3000); // Wait for content to load
      
      // Check if TOC appeared after version selection
      const tocAfterSelection = await page.locator('.toc-list').count();
      console.log(`TOC lists after version selection: ${tocAfterSelection}`);
      
      if (tocAfterSelection > 0) {
        // Check for clickable elements now
        const tocClickables = await page.locator('.toc-list div[style*="cursor: pointer"]').count();
        console.log(`TOC clickable elements: ${tocClickables}`);
        
        // Test click navigation
        if (tocClickables > 0) {
          console.log('\\n--- TESTING CLICK NAVIGATION ---');
          
          const contentContainer = page.locator('#release-content-container');
          
          // Test first few clicks
          const testCount = Math.min(3, tocClickables);
          let successfulClicks = 0;
          
          for (let i = 0; i < testCount; i++) {
            const clickable = page.locator('.toc-list div[style*="cursor: pointer"]').nth(i);
            const linkText = await clickable.textContent();
            
            // Reset to top
            await contentContainer.evaluate(el => el.scrollTop = 0);
            await page.waitForTimeout(300);
            
            try {
              await clickable.click();
              await page.waitForTimeout(1000);
              
              const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
              if (scrollPos > 10) {
                successfulClicks++;
                console.log(`  ✅ Click ${i}: "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px`);
              } else {
                console.log(`  ❌ Click ${i}: "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px (no scroll)`);
              }
            } catch (error) {
              console.log(`  ❌ Click ${i}: Error - ${error.message}`);
            }
          }
          
          const clickSuccessRate = Math.round((successfulClicks / testCount) * 100);
          console.log(`\\nClick success rate: ${clickSuccessRate}% (${successfulClicks}/${testCount})`);
          
          // Test scroll spy
          console.log('\\n--- TESTING SCROLL SPY ---');
          
          const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
          console.log(`Max scroll: ${maxScroll}px`);
          
          if (maxScroll > 200) {
            const getActiveElement = async () => {
              return await page.evaluate(() => {
                const active = document.querySelector('.toc-list [style*="rgba(79, 189, 186, 0.6)"]');
                return active ? active.textContent?.trim() || '' : null;
              });
            };
            
            // Test at different positions
            const positions = [0, Math.floor(maxScroll * 0.3), Math.floor(maxScroll * 0.7), maxScroll];
            let spyChanges = 0;
            let prevActive = null;
            
            for (const pos of positions) {
              await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
              await page.waitForTimeout(800);
              
              const currentActive = await getActiveElement();
              const pct = Math.round((pos / maxScroll) * 100);
              
              if (currentActive && currentActive !== prevActive && prevActive !== null) {
                spyChanges++;
              }
              
              console.log(`  ${pct}%: ${currentActive ? `"${currentActive.substring(0, 30)}..."` : 'No active'}`);
              prevActive = currentActive;
            }
            
            const spyEffectiveness = Math.round((spyChanges / (positions.length - 1)) * 100);
            console.log(`\\nScroll spy effectiveness: ${spyEffectiveness}% (${spyChanges}/${positions.length - 1})`);
            
            // Final assessment
            console.log('\\n=== FINAL ASSESSMENT ===');
            if (clickSuccessRate >= 80 && spyEffectiveness >= 50) {
              console.log('🎉 Release Notes React-Scroll: SUCCESS! 🎉');
            } else if (clickSuccessRate >= 60 || spyEffectiveness >= 30) {
              console.log('✅ Release Notes React-Scroll: Partial Success');
            } else {
              console.log('❌ Release Notes React-Scroll: Needs Work');
            }
            console.log(`Final: Click ${clickSuccessRate}% | Spy ${spyEffectiveness}%`);
          }
        } else {
          console.log('❌ No clickable TOC elements found after version selection');
        }
      } else {
        console.log('❌ No TOC appeared after version selection');
      }
    } else {
      console.log('❌ No version buttons found to select');
    }
  });
});