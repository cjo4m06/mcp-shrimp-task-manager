import { test, expect } from '@playwright/test';

test.describe('Release Notes Scrollbar Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:9998');
    await page.waitForLoadState('networkidle');
  });

  test('scrollbars should be visible in Release Notes', async ({ page }) => {
    // Navigate to Release Notes tab
    await page.click('text=Release Notes');
    await page.waitForTimeout(1000);

    // Select a version to load content - try different versions
    await page.click('text=v3.0.0');
    await page.waitForTimeout(2000);
    
    // Also check v3.1.0 which should have more content
    await page.click('text=v3.1.0');
    await page.waitForTimeout(2000);

    // Check if release-details element exists
    const releaseDetails = await page.locator('.release-details');
    await expect(releaseDetails).toBeVisible();

    // Get computed styles of the release-details element
    const overflowY = await releaseDetails.evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });
    console.log('Overflow-Y computed style:', overflowY);

    // Check scrollbar visibility by comparing scrollHeight with clientHeight
    const scrollbarInfo = await releaseDetails.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        overflowY: computed.overflowY,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        offsetHeight: el.offsetHeight,
        hasVerticalScrollbar: el.scrollHeight > el.clientHeight,
        scrollbarWidth: el.offsetWidth - el.clientWidth,
        position: computed.position,
        height: computed.height,
        maxHeight: computed.maxHeight,
        display: computed.display,
        flexDirection: computed.flexDirection
      };
    });
    
    console.log('Scrollbar info:', scrollbarInfo);

    // Check WebKit scrollbar styles and actual measurements
    const scrollbarStyles = await page.evaluate(() => {
      const details = document.querySelector('.release-details');
      
      // Create a test element with forced scrollbars
      const testDiv = document.createElement('div');
      testDiv.className = 'release-notes-tab-content';
      const innerDiv = document.createElement('div');
      innerDiv.className = 'release-details';
      innerDiv.style.width = '200px';
      innerDiv.style.height = '100px';
      innerDiv.style.overflowY = 'scroll';
      innerDiv.innerHTML = '<div style="height: 300px;">Test content</div>';
      testDiv.appendChild(innerDiv);
      document.body.appendChild(testDiv);
      
      // Measure actual scrollbar width
      const scrollbarWidth = innerDiv.offsetWidth - innerDiv.clientWidth;
      
      // Get computed styles
      const computed = window.getComputedStyle(innerDiv, '::-webkit-scrollbar');
      const thumbComputed = window.getComputedStyle(innerDiv, '::-webkit-scrollbar-thumb');
      const trackComputed = window.getComputedStyle(innerDiv, '::-webkit-scrollbar-track');
      
      const result = {
        measuredScrollbarWidth: scrollbarWidth,
        computedScrollbarWidth: computed.width,
        scrollbarDisplay: computed.display,
        thumbBackground: thumbComputed.backgroundColor || thumbComputed.background,
        trackBackground: trackComputed.backgroundColor || trackComputed.background,
        actualElement: {
          overflowY: window.getComputedStyle(details).overflowY,
          overflowX: window.getComputedStyle(details).overflowX,
          scrollbarGutter: window.getComputedStyle(details).scrollbarGutter
        }
      };
      
      document.body.removeChild(testDiv);
      return result;
    });
    
    console.log('WebKit scrollbar styles:', scrollbarStyles);

    // Check parent container styles and content
    const parentInfo = await page.evaluate(() => {
      const details = document.querySelector('.release-details');
      const parent = details.parentElement;
      const grandParent = parent.parentElement;
      const content = details.querySelector('.release-markdown-content');
      
      return {
        parent: {
          className: parent.className,
          display: window.getComputedStyle(parent).display,
          height: window.getComputedStyle(parent).height,
          overflow: window.getComputedStyle(parent).overflow,
          flex: window.getComputedStyle(parent).flex
        },
        grandParent: {
          className: grandParent.className,
          display: window.getComputedStyle(grandParent).display,
          height: window.getComputedStyle(grandParent).height,
          overflow: window.getComputedStyle(grandParent).overflow
        },
        content: {
          exists: !!content,
          height: content ? window.getComputedStyle(content).height : null,
          scrollHeight: content ? content.scrollHeight : null,
          childCount: content ? content.children.length : 0
        }
      };
    });
    
    console.log('Parent container info:', parentInfo);

    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'release-notes-scrollbar.png',
      fullPage: false
    });
    
    // Verify scrollbar is truly visible and functional
    const finalCheck = await releaseDetails.evaluate((el) => {
      // Try to scroll the element
      el.scrollTop = 100;
      return {
        scrolledTo: el.scrollTop,
        canScroll: el.scrollTop > 0,
        scrollbarVisible: el.offsetWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
        hasCustomStyling: window.getComputedStyle(el, '::-webkit-scrollbar').width !== 'auto'
      };
    });
    
    console.log('Final scrollbar check:', finalCheck);
    
    // Assert that scrollbar is functional
    expect(finalCheck.canScroll).toBe(true);
    expect(finalCheck.scrollbarVisible).toBe(true);

    // Check if scrollbar is actually rendered
    const scrollbarVisible = await page.evaluate(() => {
      const details = document.querySelector('.release-details');
      // Force a reflow
      details.style.display = 'none';
      details.offsetHeight; // Force reflow
      details.style.display = '';
      
      // Check if scrollbar takes up space
      const hasScrollbar = details.offsetWidth > details.clientWidth || 
                          details.scrollHeight > details.clientHeight;
      
      return {
        hasScrollbar,
        offsetWidth: details.offsetWidth,
        clientWidth: details.clientWidth,
        scrollbarActualWidth: details.offsetWidth - details.clientWidth
      };
    });
    
    console.log('Scrollbar visibility check:', scrollbarVisible);
  });
});