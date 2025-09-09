import { test, expect } from '@playwright/test';

test.describe('Release Notes Anchor Links Test', () => {
  test('should test Release Notes anchor links navigation', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== RELEASE NOTES ANCHOR LINKS TEST ===');
    
    // Select first version to load content
    const versionButton = page.locator('.version-list button, .version-list li button').first();
    await versionButton.click();
    await page.waitForTimeout(3000);
    
    // Look for the actual anchor links we found in debug
    const anchorLinks = await page.locator('a[href*="#"]').count();
    console.log(`Anchor links with hash found: ${anchorLinks}`);
    
    const contentContainer = page.locator('#release-content-container');
    const containerExists = await contentContainer.count();
    console.log(`Content container found: ${containerExists}`);
    
    if (anchorLinks > 0 && containerExists > 0) {
      console.log('\\n--- TESTING ANCHOR LINK NAVIGATION ---');
      
      // Get the anchor links that point to sections (not external)
      const sectionLinks = page.locator('a[href*="#"]:not([href*="http"]):not([href="#"])');
      const sectionLinkCount = await sectionLinks.count();
      console.log(`Section anchor links: ${sectionLinkCount}`);
      
      if (sectionLinkCount === 0) {
        // Try finding anchor links that have localhost in href but also hash
        const localHashLinks = page.locator('a[href*="localhost"][href*="#"]');
        const localCount = await localHashLinks.count();
        console.log(`Local hash links: ${localCount}`);
        
        if (localCount > 0) {
          // Test first few local hash links
          const testCount = Math.min(5, localCount);
          let successfulClicks = 0;
          
          for (let i = 0; i < testCount; i++) {
            const link = localHashLinks.nth(i);
            const linkText = await link.textContent();
            const linkHref = await link.getAttribute('href');
            
            // Reset scroll to top
            await contentContainer.evaluate(el => el.scrollTop = 0);
            await page.waitForTimeout(300);
            
            try {
              await link.click();
              await page.waitForTimeout(1000);
              
              const scrollPos = await contentContainer.evaluate(el => el.scrollTop);
              if (scrollPos > 10) {
                successfulClicks++;
                console.log(`  ✅ "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px`);
                console.log(`     href: ${linkHref}`);
              } else {
                console.log(`  ❌ "${linkText?.trim().substring(0, 30)}..." -> ${scrollPos}px (no scroll)`);
                console.log(`     href: ${linkHref}`);
              }
            } catch (error) {
              console.log(`  ❌ "${linkText?.trim().substring(0, 30)}..." -> Error: ${error.message}`);
            }
          }
          
          const successRate = Math.round((successfulClicks / testCount) * 100);
          console.log(`\\nAnchor link navigation success: ${successRate}% (${successfulClicks}/${testCount})`);
          
          // Test scroll spy
          console.log('\\n--- TESTING SCROLL SPY ---');
          
          const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
          console.log(`Max scroll available: ${maxScroll}px`);
          
          if (maxScroll > 200) {
            // Test scroll spy by scrolling to different positions
            const positions = [0, Math.floor(maxScroll * 0.3), Math.floor(maxScroll * 0.7), maxScroll];
            let activeChanges = 0;
            let previousActive = null;
            
            for (const pos of positions) {
              await contentContainer.evaluate((el, scrollPos) => el.scrollTop = scrollPos, pos);
              await page.waitForTimeout(1000);
              
              // Look for active elements (highlighted TOC items)
              const activeElements = await page.evaluate(() => {
                const elements = [];
                
                // Look for elements with active highlighting
                const highlighted = document.querySelectorAll('[style*="rgba(79, 189, 186, 0.6)"]');
                for (const el of highlighted) {
                  elements.push({
                    type: 'highlighted',
                    text: el.textContent?.trim().substring(0, 30) || ''
                  });
                }
                
                return elements;
              });
              
              const currentActive = activeElements.length > 0 ? activeElements[0].text : null;
              const percentage = Math.round((pos / maxScroll) * 100);
              
              if (currentActive && currentActive !== previousActive && previousActive !== null) {
                activeChanges++;
              }
              
              console.log(`  ${percentage}%: ${currentActive ? `"${currentActive}..."` : 'No active element'}`);
              previousActive = currentActive;
            }
            
            const spyEffectiveness = activeChanges > 0 ? Math.round((activeChanges / (positions.length - 1)) * 100) : 0;
            console.log(`\\nScroll spy effectiveness: ${spyEffectiveness}% (${activeChanges} changes)`);
            
            // Final assessment
            console.log('\\n=== RELEASE NOTES FINAL ASSESSMENT ===');
            if (successRate >= 80 && spyEffectiveness >= 50) {
              console.log('🎉 RELEASE NOTES NAVIGATION: EXCELLENT! 🎉');
            } else if (successRate >= 60 && spyEffectiveness >= 30) {
              console.log('✅ Release Notes navigation: Good');
            } else if (successRate >= 80) {
              console.log('✅ Click navigation excellent, scroll spy needs work');
            } else {
              console.log('❌ Release Notes navigation needs improvement');
            }
            
            console.log(`Scores: Click ${successRate}% | Scroll Spy ${spyEffectiveness}%`);
          }
        }
      }
    } else {
      console.log('❌ No anchor links or content container found');
    }
  });
});