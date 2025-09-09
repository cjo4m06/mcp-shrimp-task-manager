import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Help Page Scroll Spy Debugging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:10002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // Wait for app to fully load
    
    // Try to find and click the help tab
    const helpTab = await page.$('#help-tab');
    if (helpTab) {
      await helpTab.click();
    } else {
      // If no help-tab, try to find the tab bar and click the second tab
      const tabs = await page.$$('.tab-button');
      if (tabs.length > 1) {
        await tabs[1].click(); // Help is usually the second tab
      }
    }
    
    await page.waitForTimeout(1000); // Wait for tab switch
  });

  test('debug scroll spy behavior throughout entire document', async ({ page }) => {
    // Get all TOC items and their IDs
    const tocItems = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.help-toc-item').forEach(item => {
        const id = item.getAttribute('data-id');
        const text = item.querySelector('.help-toc-text')?.textContent?.trim();
        items.push({ id, text });
      });
      return items;
    });

    console.log('Found TOC items:', tocItems);

    // Get all content sections
    const contentSections = await page.evaluate(() => {
      const sections = [];
      document.querySelectorAll('[data-scroll-element]').forEach(el => {
        const id = el.getAttribute('data-scroll-element') || el.id;
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim();
        const rect = el.getBoundingClientRect();
        const container = document.querySelector('#help-content-container');
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top + container.scrollTop;
        sections.push({ id, tag, text: text?.substring(0, 50), relativeTop });
      });
      return sections.sort((a, b) => a.relativeTop - b.relativeTop);
    });

    console.log('Found content sections:', contentSections);

    // Function to check which item is active
    const getActiveItem = async () => {
      return await page.evaluate(() => {
        const activeItem = document.querySelector('.help-toc-item.active');
        if (activeItem) {
          return {
            id: activeItem.getAttribute('data-id'),
            text: activeItem.querySelector('.help-toc-text')?.textContent?.trim()
          };
        }
        return null;
      });
    };

    // Scroll through each section and check if it gets highlighted
    const scrollResults = [];
    
    for (const section of contentSections) {
      console.log(`\nScrolling to section: ${section.id} (${section.text?.substring(0, 30)}...)`);
      
      // Scroll to the section
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-scroll-element="${sectionId}"], #${sectionId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top + container.scrollTop;
          container.scrollTo({ top: relativeTop - 50, behavior: 'smooth' });
        }
      }, section.id);

      // Wait for scroll to complete
      await page.waitForTimeout(600);

      // Check active item
      const activeItem = await getActiveItem();
      const scrollPosition = await page.evaluate(() => {
        const container = document.querySelector('#help-content-container');
        return container ? container.scrollTop : 0;
      });

      scrollResults.push({
        section: section.id,
        sectionText: section.text,
        activeItem: activeItem,
        scrollPosition: scrollPosition,
        success: activeItem?.id === section.id
      });

      console.log(`Active item: ${activeItem?.id || 'none'} (expected: ${section.id})`);
      console.log(`Scroll position: ${scrollPosition}`);
    }

    // Print summary
    console.log('\n=== Scroll Spy Results Summary ===');
    let lastWorkingIndex = -1;
    scrollResults.forEach((result, index) => {
      const status = result.success ? '✓' : '✗';
      console.log(`${status} ${result.section}: Active=${result.activeItem?.id || 'none'}, ScrollPos=${result.scrollPosition}`);
      if (result.success) {
        lastWorkingIndex = index;
      }
    });

    if (lastWorkingIndex >= 0 && lastWorkingIndex < scrollResults.length - 1) {
      console.log(`\nScroll spy stops working after: ${scrollResults[lastWorkingIndex].section}`);
      console.log(`First failing section: ${scrollResults[lastWorkingIndex + 1].section}`);
    }

    // Test the workaround: click in sidebar then scroll
    console.log('\n=== Testing Workaround ===');
    const failingSection = scrollResults.find(r => !r.success);
    if (failingSection) {
      console.log(`Testing workaround for section: ${failingSection.section}`);
      
      // Click on the TOC item
      await page.evaluate((sectionId) => {
        const tocItem = document.querySelector(`.help-toc-item[data-id="${sectionId}"]`);
        if (tocItem) {
          tocItem.click();
        }
      }, failingSection.section);

      await page.waitForTimeout(600);

      // Now scroll slightly
      await page.evaluate(() => {
        const container = document.querySelector('#help-content-container');
        if (container) {
          container.scrollBy({ top: 100, behavior: 'smooth' });
        }
      });

      await page.waitForTimeout(600);

      const activeAfterWorkaround = await getActiveItem();
      console.log(`Active after workaround: ${activeAfterWorkaround?.id || 'none'}`);

      // Scroll back to the section
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-scroll-element="${sectionId}"], #${sectionId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top + container.scrollTop;
          container.scrollTo({ top: relativeTop - 50, behavior: 'smooth' });
        }
      }, failingSection.section);

      await page.waitForTimeout(600);

      const activeAfterScrollBack = await getActiveItem();
      console.log(`Active after scrolling back: ${activeAfterScrollBack?.id || 'none'}`);
      console.log(`Workaround ${activeAfterScrollBack?.id === failingSection.section ? 'WORKS' : 'FAILED'}`);
    }

    // Check sidebar scroll position
    console.log('\n=== Checking Sidebar Scroll Behavior ===');
    const sidebarInfo = await page.evaluate(() => {
      const sidebar = document.querySelector('.help-toc-container');
      if (sidebar) {
        return {
          scrollHeight: sidebar.scrollHeight,
          clientHeight: sidebar.clientHeight,
          scrollTop: sidebar.scrollTop,
          hasScrollbar: sidebar.scrollHeight > sidebar.clientHeight
        };
      }
      return null;
    });

    console.log('Sidebar info:', sidebarInfo);

    // Test scrolling to bottom sections
    const bottomSection = contentSections[contentSections.length - 1];
    if (bottomSection) {
      console.log(`\nScrolling to bottom section: ${bottomSection.id}`);
      
      await page.evaluate((sectionId) => {
        const element = document.querySelector(`[data-scroll-element="${sectionId}"], #${sectionId}`);
        const container = document.querySelector('#help-content-container');
        if (element && container) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, bottomSection.id);

      await page.waitForTimeout(1000);

      const sidebarAfterScroll = await page.evaluate(() => {
        const sidebar = document.querySelector('.help-toc-container');
        const activeItem = document.querySelector('.help-toc-item.active');
        if (sidebar && activeItem) {
          const sidebarRect = sidebar.getBoundingClientRect();
          const itemRect = activeItem.getBoundingClientRect();
          return {
            sidebarScrollTop: sidebar.scrollTop,
            activeItemVisible: itemRect.top >= sidebarRect.top && itemRect.bottom <= sidebarRect.bottom,
            activeItemTop: itemRect.top - sidebarRect.top,
            activeItemId: activeItem.getAttribute('data-id')
          };
        }
        return null;
      });

      console.log('Sidebar after scrolling to bottom:', sidebarAfterScroll);
    }

    // Generate report
    const workingCount = scrollResults.filter(r => r.success).length;
    const totalCount = scrollResults.length;
    console.log(`\n=== Final Report ===`);
    console.log(`Scroll spy working: ${workingCount}/${totalCount} sections (${Math.round(workingCount/totalCount*100)}%)`);
    
    expect(workingCount).toBe(totalCount);
  });
});