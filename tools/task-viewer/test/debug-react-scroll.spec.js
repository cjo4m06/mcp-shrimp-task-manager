import { test, expect } from '@playwright/test';

test.describe('Debug React-Scroll', () => {
  test('should debug react-scroll issues', async ({ page }) => {
    // Listen for console messages
    page.on('console', (msg) => {
      console.log(`BROWSER: ${msg.type()}: ${msg.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`PAGE ERROR: ${error.message}`);
    });
    
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Help');
    await page.waitForTimeout(3000);
    
    console.log('=== DEBUGGING REACT-SCROLL ISSUES ===');
    
    // Check what TOC elements actually exist
    const tocElements = await page.locator('.toc-list > div').evaluateAll(elements =>
      elements.slice(0, 3).map((el, index) => {
        const button = el.querySelector('button');
        const link = el.querySelector('a') || el.querySelector('[role="button"]') || el.querySelector('[style*="cursor: pointer"]');
        
        return {
          index,
          hasButton: !!button,
          buttonText: button?.textContent?.trim() || '',
          linkTag: link?.tagName || 'none',
          linkText: link?.textContent?.trim() || '',
          linkHref: link?.getAttribute('href') || '',
          linkTo: link?.getAttribute('to') || '',
          linkRole: link?.getAttribute('role') || '',
          hasPointerCursor: link?.style?.cursor === 'pointer',
          innerHTML: el.innerHTML.substring(0, 200) + '...'
        };
      })
    );
    
    console.log('\n--- TOC ELEMENT STRUCTURE ---');
    tocElements.forEach(el => {
      console.log(`Element ${el.index}:`);
      console.log(`  Button: ${el.hasButton} - "${el.buttonText}"`);
      console.log(`  Link: ${el.linkTag} - "${el.linkText}"`);
      console.log(`  Href: ${el.linkHref}`);
      console.log(`  To: ${el.linkTo}`);
      console.log(`  Role: ${el.linkRole}`);
      console.log(`  Pointer cursor: ${el.hasPointerCursor}`);
      console.log(`  HTML: ${el.innerHTML}`);
      console.log('');
    });
    
    // Try clicking the first TOC element and see what happens
    console.log('--- TESTING CLICK ---');
    const firstTocLink = page.locator('.toc-list > div').first().locator('[style*="cursor: pointer"]');
    const linkExists = await firstTocLink.count();
    console.log(`First clickable link exists: ${linkExists > 0}`);
    
    if (linkExists > 0) {
      const linkInfo = await firstTocLink.evaluate(el => ({
        tagName: el.tagName,
        href: el.getAttribute('href'),
        to: el.getAttribute('to'),
        className: el.className,
        onClick: !!el.onclick,
        style: el.getAttribute('style')
      }));
      
      console.log('Link info:', linkInfo);
      
      // Try clicking
      try {
        await firstTocLink.click();
        await page.waitForTimeout(1000);
        console.log('✅ Click successful');
      } catch (error) {
        console.log(`❌ Click failed: ${error.message}`);
      }
    }
    
    // Check for ScrollElement wrappers
    console.log('\n--- SCROLL ELEMENTS ---');
    const scrollElements = await page.locator('[id] h1, [id] h2, [id] h3').evaluateAll(elements =>
      elements.slice(0, 5).map(el => ({
        tag: el.tagName,
        id: el.id,
        text: el.textContent?.trim().substring(0, 50) || '',
        parentTag: el.parentElement?.tagName || '',
        parentName: el.parentElement?.getAttribute('name') || ''
      }))
    );
    
    scrollElements.forEach(el => {
      console.log(`${el.tag}#${el.id} -> "${el.text}" (parent: ${el.parentTag}, name: ${el.parentName})`);
    });
  });
});