import { test, expect } from '@playwright/test';

test.describe('Motion Components Homepage', () => {
  test('should load homepage with motion components', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if main heading is present
    await expect(page.getByRole('heading', { name: 'Motion Components Showcase' })).toBeVisible();
    
    // Check if AI Text Loading section is present
    await expect(page.getByRole('heading', { name: 'AI Text Loading Animation' })).toBeVisible();
    
    // Check if AI Voice section is present  
    await expect(page.getByRole('heading', { name: 'AI Voice Interface' })).toBeVisible();
    
    // Check if Scroll Text section is present
    await expect(page.getByRole('heading', { name: 'Scroll Text Animation' })).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ path: 'homepage-motion-components.png', fullPage: true });
  });
});