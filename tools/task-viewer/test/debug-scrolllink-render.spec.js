import { test, expect } from '@playwright/test';

test.describe('Debug ScrollLink Render', () => {
  test('should debug how ScrollLink components render', async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Help');
    await page.waitForTimeout(3000);
    
    console.log('=== DEBUGGING SCROLLLINK RENDERING ===');
    
    // Check all elements in the TOC that look like scroll links
    const tocElements = await page.locator('.toc-list > div').evaluateAll(elements => {
      return elements.slice(0, 5).map((el, index) => {
        const allLinks = el.querySelectorAll('a, [role="button"], [data-scroll]');
        const styledElements = el.querySelectorAll('[style*="cursor: pointer"]');
        
        return {
          index,
          elementHTML: el.innerHTML.substring(0, 300) + '...',
          linkCount: allLinks.length,
          styledCount: styledElements.length,
          links: Array.from(allLinks).map(link => ({
            tagName: link.tagName,
            role: link.getAttribute('role'),
            to: link.getAttribute('to'),
            href: link.getAttribute('href'),
            'data-scroll': link.getAttribute('data-scroll'),
            textContent: link.textContent?.trim().substring(0, 30) || '',
            className: link.className || '',
            hasOnClick: !!link.onclick
          })),
          styledElements: Array.from(styledElements).map(styled => ({
            tagName: styled.tagName,
            textContent: styled.textContent?.trim().substring(0, 30) || '',
            role: styled.getAttribute('role'),
            to: styled.getAttribute('to')
          }))
        };
      });
    });
    
    tocElements.forEach(el => {
      console.log(`\\n--- TOC Element ${el.index} ---`);
      console.log(`Links: ${el.linkCount}, Styled: ${el.styledCount}`);
      
      el.links.forEach((link, i) => {
        console.log(`  Link ${i}: ${link.tagName} - "${link.textContent}"`);
        console.log(`    role: ${link.role}`);
        console.log(`    to: ${link.to}`);
        console.log(`    href: ${link.href}`);
        console.log(`    data-scroll: ${link['data-scroll']}`);
        console.log(`    onClick: ${link.hasOnClick}`);
      });
      
      el.styledElements.forEach((styled, i) => {
        console.log(`  Styled ${i}: ${styled.tagName} - "${styled.textContent}"`);
      });
    });
    
    // Test if ScrollLinks are working by checking if they have the correct attributes
    console.log('\\n--- REACT-SCROLL COMPONENT CHECK ---');
    const hasScrollLinks = await page.evaluate(() => {
      // Look for elements that might be ScrollLink components
      const elements = document.querySelectorAll('[data-scroll="true"], [data-to]');
      return {
        count: elements.length,
        elements: Array.from(elements).slice(0, 3).map(el => ({
          tagName: el.tagName,
          dataScroll: el.getAttribute('data-scroll'),
          dataTo: el.getAttribute('data-to'),
          to: el.getAttribute('to'),
          textContent: el.textContent?.trim().substring(0, 30) || ''
        }))
      };
    });
    
    console.log(`React-scroll elements found: ${hasScrollLinks.count}`);
    hasScrollLinks.elements.forEach((el, i) => {
      console.log(`  Element ${i}: ${el.tagName} - "${el.textContent}"`);
      console.log(`    data-scroll: ${el.dataScroll}`);
      console.log(`    data-to: ${el.dataTo}`);
      console.log(`    to: ${el.to}`);
    });
  });
});