import { test, expect } from '@playwright/test';

test.describe('Release Notes Debug', () => {
  test('should examine Release Notes structure and functionality', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Release Notes');
    await page.waitForTimeout(2000);
    
    console.log('=== RELEASE NOTES STRUCTURE DEBUG ===');
    
    // Check for content container
    const contentContainer = page.locator('.release-details');
    const containerExists = await contentContainer.count();
    console.log(`Content container (.release-details) found: ${containerExists}`);
    
    // Look for version list
    const versionList = await page.locator('.release-sidebar ul li').count();
    console.log(`Version items found: ${versionList}`);
    
    // Check if any versions are expanded
    const expandedVersions = await page.locator('.release-sidebar ul li').evaluateAll(items =>
      items.map((item, index) => {
        const versionName = item.querySelector('h3')?.textContent?.trim() || `Version ${index}`;
        const hasExpandedContent = item.querySelector('div') && 
                                 item.querySelector('div').style.display !== 'none';
        return { versionName, expanded: hasExpandedContent };
      })
    );
    
    console.log('\n--- VERSION EXPANSION STATUS ---');
    expandedVersions.forEach((version, index) => {
      console.log(`${index}: ${version.versionName} - ${version.expanded ? 'EXPANDED' : 'COLLAPSED'}`);
    });
    
    // Find first expanded version with TOC
    const firstExpandedIndex = expandedVersions.findIndex(v => v.expanded);
    if (firstExpandedIndex === -1) {
      console.log('\n❌ No expanded versions found! Trying to expand first version...');
      
      // Click first version to expand it
      await page.locator('.release-sidebar ul li h3').first().click();
      await page.waitForTimeout(1000);
      
      console.log('Clicked first version header to expand');
    }
    
    // Now look for TOC links after potential expansion
    const tocLinks = await page.locator('.release-sidebar a[href^="#"]').count();
    console.log(`\nTOC links found after expansion: ${tocLinks}`);
    
    if (tocLinks > 0) {
      // Get first few TOC links
      const tocData = await page.locator('.release-sidebar a[href^="#"]').evaluateAll(links =>
        links.slice(0, 5).map(link => ({
          text: link.textContent?.trim() || '',
          href: link.getAttribute('href'),
          visible: link.offsetParent !== null
        }))
      );
      
      console.log('\n--- TOC LINKS ---');
      tocData.forEach((link, index) => {
        console.log(`${index}: "${link.text}" -> ${link.href} (visible: ${link.visible})`);
      });
      
      // Test clicking first TOC link
      if (tocData.length > 0) {
        console.log('\n--- TESTING CLICK NAVIGATION ---');
        
        const initialScroll = await contentContainer.evaluate(el => el.scrollTop);
        console.log(`Initial scroll: ${initialScroll}`);
        
        try {
          await page.locator('.release-sidebar a[href^="#"]').first().click();
          await page.waitForTimeout(1000);
          
          const newScroll = await contentContainer.evaluate(el => el.scrollTop);
          console.log(`New scroll: ${newScroll}`);
          console.log(`Scroll changed: ${newScroll !== initialScroll ? 'YES' : 'NO'}`);
          
          // Check if target element exists
          const firstLink = tocData[0];
          if (firstLink.href) {
            const targetId = firstLink.href.replace('#', '');
            const targetExists = await page.locator(`#${targetId}`).count();
            console.log(`Target #${targetId} exists: ${targetExists > 0}`);
          }
        } catch (error) {
          console.log(`❌ Click failed: ${error.message}`);
        }
      }
      
      // Test scroll spy
      console.log('\n--- TESTING SCROLL SPY ---');
      
      const getActiveItem = async () => {
        return await page.locator('.release-sidebar a').evaluateAll(links => {
          const activeLink = links.find(link => {
            const style = window.getComputedStyle(link);
            return style.backgroundColor && style.backgroundColor !== 'transparent' && 
                   style.backgroundColor !== 'rgba(0, 0, 0, 0)';
          });
          return activeLink ? {
            text: activeLink.textContent?.trim() || '',
            href: activeLink.getAttribute('href'),
            backgroundColor: window.getComputedStyle(activeLink).backgroundColor
          } : null;
        });
      };
      
      const initialActive = await getActiveItem();
      console.log(`Initial active: ${initialActive?.text || 'none'}`);
      
      // Scroll and check for changes
      const maxScroll = await contentContainer.evaluate(el => el.scrollHeight - el.clientHeight);
      await contentContainer.evaluate((el, pos) => el.scrollTop = pos, Math.floor(maxScroll * 0.3));
      await page.waitForTimeout(800);
      
      const afterScrollActive = await getActiveItem();
      console.log(`After scroll active: ${afterScrollActive?.text || 'none'}`);
      console.log(`Scroll spy working: ${initialActive?.text !== afterScrollActive?.text ? 'YES' : 'NO'}`);
    } else {
      console.log('\n❌ No TOC links found even after expansion attempts');
    }
  });
});