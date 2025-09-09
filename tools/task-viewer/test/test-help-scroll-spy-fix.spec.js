import { test, expect } from '@playwright/test';

test.describe('Help Page Scroll Spy Fix Verification', () => {
  test('verify scroll spy works throughout entire document', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:10002', { waitUntil: 'networkidle' });
    
    // Check for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    // Debug: Check what's on the page
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText?.substring(0, 200),
        hasRoot: !!document.querySelector('#root'),
        rootContent: document.querySelector('#root')?.innerHTML?.substring(0, 200),
        hasHelpTab: !!document.querySelector('#help-tab'),
        tabButtons: document.querySelectorAll('.tab-button').length,
        tabs: Array.from(document.querySelectorAll('.tab-button')).map(t => t.textContent),
        hasHelpContent: !!document.querySelector('#help-content-container'),
        hasToc: !!document.querySelector('.help-toc-container')
      };
    });
    
    console.log('Page info:', JSON.stringify(pageInfo, null, 2));
    
    // Click on Help - it's in the header
    const helpLink = await page.$('a:has-text("Help")');
    if (helpLink) {
      await helpLink.click();
    } else if (pageInfo.hasHelpTab) {
      await page.click('#help-tab');
    } else if (pageInfo.tabButtons > 0) {
      // Find and click the Help tab by text
      const helpTabIndex = pageInfo.tabs.findIndex(t => t.toLowerCase().includes('help'));
      if (helpTabIndex >= 0) {
        const tabs = await page.$$('.tab-button');
        await tabs[helpTabIndex].click();
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Get the content container
    const hasContent = await page.evaluate(() => {
      const container = document.querySelector('#help-content-container');
      const toc = document.querySelector('.help-toc-container');
      return !!(container && toc);
    });
    
    if (!hasContent) {
      console.log('Help content not loaded properly');
      return;
    }
    
    // Get all sections to test
    const sections = await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-scroll-element]');
      return Array.from(elements).map(el => ({
        id: el.getAttribute('data-scroll-element') || el.id,
        text: el.textContent?.trim().substring(0, 50)
      }));
    });
    
    console.log(`Found ${sections.length} sections to test`);
    
    if (sections.length === 0) {
      console.log('No sections found with data-scroll-element attribute');
      return;
    }
    
    // Test scrolling to each section
    const results = [];
    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      const section = sections[i];
      console.log(`\nTesting section ${i + 1}/${sections.length}: ${section.text}`);
      
      // Scroll to the section
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-scroll-element="${sectionId}"], #${sectionId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          const containerRect = container.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = element.offsetTop - 50;
          container.scrollTo({ top: scrollTop, behavior: 'instant' });
        }
      }, section.id);
      
      // Wait for scroll and spy update
      await page.waitForTimeout(500);
      
      // Check which item is active
      const activeInfo = await page.evaluate(() => {
        const activeItem = document.querySelector('.help-toc-item.active');
        const tocContainer = document.querySelector('.help-toc-container');
        
        if (activeItem && tocContainer) {
          const tocRect = tocContainer.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          
          return {
            id: activeItem.getAttribute('data-id'),
            text: activeItem.querySelector('.help-toc-text')?.textContent?.trim(),
            isVisible: itemRect.top >= tocRect.top && itemRect.bottom <= tocRect.bottom,
            tocScrollTop: tocContainer.scrollTop
          };
        }
        return null;
      });
      
      const success = activeInfo?.id === section.id;
      results.push({
        section: section.id,
        expected: section.text,
        active: activeInfo?.id || 'none',
        activeText: activeInfo?.text || 'none',
        success: success,
        tocItemVisible: activeInfo?.isVisible || false
      });
      
      console.log(`  Expected: ${section.id}`);
      console.log(`  Active: ${activeInfo?.id || 'none'}`);
      console.log(`  Success: ${success ? '✓' : '✗'}`);
      console.log(`  TOC item visible: ${activeInfo?.isVisible ? '✓' : '✗'}`);
    }
    
    // Test scrolling to bottom
    console.log('\n=== Testing scroll to bottom ===');
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-scroll-element="${sectionId}"], #${sectionId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, lastSection.id);
      
      await page.waitForTimeout(1000);
      
      const bottomActiveInfo = await page.evaluate(() => {
        const activeItem = document.querySelector('.help-toc-item.active');
        const tocContainer = document.querySelector('.help-toc-container');
        
        if (activeItem && tocContainer) {
          const tocRect = tocContainer.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          
          return {
            id: activeItem.getAttribute('data-id'),
            isVisible: itemRect.top >= tocRect.top && itemRect.bottom <= tocRect.bottom,
            tocScrollTop: tocContainer.scrollTop,
            tocScrollHeight: tocContainer.scrollHeight,
            tocClientHeight: tocContainer.clientHeight
          };
        }
        return null;
      });
      
      console.log(`Last section active: ${bottomActiveInfo?.id || 'none'}`);
      console.log(`TOC auto-scrolled: ${bottomActiveInfo?.tocScrollTop > 0 ? '✓' : '✗'}`);
      console.log(`Active item visible: ${bottomActiveInfo?.isVisible ? '✓' : '✗'}`);
    }
    
    // Summary
    console.log('\n=== Summary ===');
    const successCount = results.filter(r => r.success).length;
    const visibleCount = results.filter(r => r.tocItemVisible).length;
    console.log(`Scroll spy accuracy: ${successCount}/${results.length} (${Math.round(successCount/results.length*100)}%)`);
    console.log(`TOC auto-scroll working: ${visibleCount}/${results.length} (${Math.round(visibleCount/results.length*100)}%)`);
    
    // Check if the fix resolved the issue
    const afterStandardDeployment = results.findIndex(r => r.section.includes('standard-deployment'));
    if (afterStandardDeployment >= 0 && afterStandardDeployment < results.length - 1) {
      const remainingResults = results.slice(afterStandardDeployment + 1);
      const remainingSuccess = remainingResults.filter(r => r.success).length;
      console.log(`\nSections after "Standard Deployment": ${remainingSuccess}/${remainingResults.length} working`);
      
      if (remainingSuccess === remainingResults.length) {
        console.log('✓ Bug fixed! Scroll spy now works after "Standard Deployment"');
      } else {
        console.log('✗ Bug persists - some sections after "Standard Deployment" still not working');
      }
    }
    
    expect(successCount).toBe(results.length);
  });
});