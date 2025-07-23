import { test, expect } from '@playwright/test';

test.describe('Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for component testing
    await page.route('**/api/messages', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              id: 1,
              date: '2025-01-01',
              sender: 'Me',
              message: 'Test message',
              sentiment_score: 0.8,
              conflict_detected: false
            }
          ]
        })
      });
    });
  });

  test('MessageTable displays messages correctly', async ({ page }) => {
    await page.goto('/messages');
    
    // Wait for table to load
    await page.waitForSelector('table');
    
    // Check for message content
    await expect(page.locator('text=Test message')).toBeVisible();
    await expect(page.locator('text=Me')).toBeVisible();
  });

  test('TrajectoryChart renders without errors', async ({ page }) => {
    await page.goto('/trajectory');
    
    // Check for chart container
    await expect(page.locator('[data-testid="trajectory-chart"]')).toBeVisible();
    
    // Check for axis labels
    await expect(page.locator('text=Connection Score')).toBeVisible();
  });

  test('ConflictCard shows conflict information', async ({ page }) => {
    await page.route('**/api/conflicts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conflicts: [
            {
              id: 1,
              start_date: '2025-01-01',
              trigger_summary: 'Test conflict',
              emotional_intensity: 7,
              resolution_outcome: 'Resolved'
            }
          ]
        })
      });
    });

    await page.goto('/conflicts');
    
    // Check for conflict card
    await expect(page.locator('text=Test conflict')).toBeVisible();
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('DailyTracker form submits correctly', async ({ page }) => {
    await page.goto('/daily-tracker');
    
    // Fill out form
    await page.fill('[name="mood"]', '7');
    await page.fill('[name="connection_felt"]', '8');
    await page.fill('[name="gratitude_notes"]', 'Test gratitude');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for success message
    await expect(page.locator('text=Successfully saved')).toBeVisible();
  });
});