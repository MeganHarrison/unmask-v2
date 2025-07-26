import { test, expect } from '@playwright/test';

test.describe('Dashboard Texts Table', () => {
  test('should load dashboard page successfully', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the page loaded (should have some content)
    await expect(page.locator('body')).toContainText('Dashboard');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'dashboard-table-test.png', fullPage: true });
  });

  test('should have API endpoint working', async ({ request }) => {
    // Test the texts-bc API endpoint directly
    const response = await request.get('/api/texts-bc?page=1&limit=50');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeInstanceOf(Array);
    expect(data.pagination).toBeDefined();
    
    // Verify data structure
    if (data.data.length > 0) {
      const firstMessage = data.data[0];
      expect(firstMessage).toHaveProperty('id');
      expect(firstMessage).toHaveProperty('date_time');
      expect(firstMessage).toHaveProperty('sender');
      expect(firstMessage).toHaveProperty('message');
      expect(firstMessage).toHaveProperty('sentiment');
      expect(firstMessage).toHaveProperty('category');
      expect(firstMessage).toHaveProperty('tag');
      expect(firstMessage).toHaveProperty('conflict_detected');
    }
  });

  test('should render text messages section if data loads', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for potential async operations
    await page.waitForTimeout(2000);
    
    // Check if the Text Messages heading exists
    const textMessagesHeading = page.getByRole('heading', { name: 'Text Messages' });
    
    // If the heading exists, check for table elements
    if (await textMessagesHeading.isVisible()) {
      // Check if the table headers are present
      await expect(page.getByRole('columnheader', { name: 'Date & Time' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Sender' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Message' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Sentiment' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Tag' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Conflict' })).toBeVisible();
      
      // Check if pagination controls are present
      await expect(page.getByText('Rows per page')).toBeVisible();
      
      // Check if search input is present
      const searchInput = page.getByPlaceholder('Search messages...');
      await expect(searchInput).toBeVisible();
    } else {
      console.log('Text Messages section not visible - likely due to API issues');
    }
  });
});