import { test, expect } from '@playwright/test';

test.describe('Help Navigation Fix', () => {
  test('should debug and fix navigation issues', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    // Click Help link
    await page.click('text=Help');
    await page.waitForTimeout(2000);
    
    console.log('=== HELP PAGE LOADED ===');
    
    // Find the correct content container (should be .release-details)
    const contentContainer = page.locator('.release-details');
    const containerExists = await contentContainer.count();
    console.log(`Content container (.release-details) found: ${containerExists}`);
    
    if (containerExists === 0) {
      console.log('Content container not found!');
      return;
    }
    
    // Find TOC links (should be anchor tags in .toc-list)
    const tocLinks = await page.locator('.toc-list a[href^="#"]').count();
    console.log(`Found ${tocLinks} TOC links in .toc-list`);
    
    // Get first few TOC links for debugging
    const tocData = await page.locator('.toc-list a[href^="#"]').evaluateAll(links => 
      links.slice(0, 5).map((link, index) => ({
        index,
        text: link.textContent?.trim() || '',
        href: link.getAttribute('href'),
        visible: link.offsetParent !== null
      }))
    );
    
    console.log('\n=== TOC LINKS ===');
    tocData.forEach(item => {
      console.log(`${item.index}: "${item.text}" -> ${item.href} (visible: ${item.visible})`);
    });
    
    // Check for corresponding content elements
    console.log('\n=== CONTENT ELEMENTS WITH IDs ===');
    const contentIds = await page.locator('.release-details [id]').evaluateAll(elements =>
      elements.slice(0, 10).map((el, index) => ({
        index,
        id: el.id,
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 50) || ''
      }))
    );
    
    contentIds.forEach(el => {
      console.log(`${el.index}: #${el.id} (${el.tagName}) -> "${el.text}..."`);
    });
    
    // Test clicking first TOC link
    if (tocData.length > 0) {
      console.log('\n=== TESTING CLICK NAVIGATION ===');
      const firstLink = tocData[0];
      console.log(`Testing click on: "${firstLink.text}" -> ${firstLink.href}`);
      
      // Get initial scroll position
      const initialScroll = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`Initial scroll: ${initialScroll}`);
      
      // Click the first TOC link
      await page.locator('.toc-list a[href^="#"]').first().click();
      await page.waitForTimeout(1000);
      
      // Check new scroll position
      const newScroll = await contentContainer.evaluate(el => el.scrollTop);
      console.log(`New scroll: ${newScroll}`);
      console.log(`Scroll changed: ${newScroll !== initialScroll ? 'YES' : 'NO'}`);
      
      // Check if target element exists and is positioned correctly
      if (firstLink.href) {
        const targetId = firstLink.href.replace('#', '');
        const targetElement = page.locator(`#${targetId}`);
        const targetExists = await targetElement.count();
        console.log(`Target #${targetId} exists: ${targetExists > 0}`);
        
        if (targetExists > 0) {
          const targetBounds = await targetElement.boundingBox();
          const containerBounds = await contentContainer.boundingBox();
          
          if (targetBounds && containerBounds) {
            const relativeTop = targetBounds.y - containerBounds.y;
            console.log(`Target position relative to container: ${relativeTop}px`);
            console.log(`Target is ${relativeTop >= 0 && relativeTop <= containerBounds.height ? 'VISIBLE' : 'NOT VISIBLE'} in viewport`);
          }
        } else {
          console.log(`❌ Target element #${targetId} does not exist!`);
        }
      }
    }
    
    // Test scroll spy functionality
    console.log('\n=== TESTING SCROLL SPY ===');
    
    // Get current active TOC item
    const getActiveTocItem = async () => {
      return await page.locator('.toc-list a').evaluateAll(links => {
        const activeItem = links.find(link => {
          const style = window.getComputedStyle(link);
          return style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
        });
        return activeItem ? {
          text: activeItem.textContent?.trim() || '',
          href: activeItem.getAttribute('href'),
          backgroundColor: window.getComputedStyle(activeItem).backgroundColor
        } : null;
      });
    };
    
    const initialActive = await getActiveTocItem();
    console.log('Initial active item:', initialActive);
    
    // Scroll down in content
    await contentContainer.evaluate(el => {
      el.scrollTop = 300;
    });
    await page.waitForTimeout(500);
    
    const afterScrollActive = await getActiveTocItem();
    console.log('Active item after scroll:', afterScrollActive);
    console.log(`Scroll spy working: ${initialActive?.text !== afterScrollActive?.text ? 'YES' : 'NO'}`);
  });
});