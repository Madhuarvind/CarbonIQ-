const { test, expect } = require('@playwright/test');

test.describe('Carbon Calculator', () => {
  test('should load calculator page', async ({ page }) => {
    await page.goto('/calculator');

    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('Carbon Footprint Calculator');
    await expect(page.locator('text=Transportation')).toBeVisible();
    await expect(page.locator('text=Home Energy')).toBeVisible();
    await expect(page.locator('text=Food')).toBeVisible();
  });

  test('should calculate emissions', async ({ page }) => {
    await page.goto('/calculator');

    // Fill transportation data
    await page.locator('input[name="car-distance"]').fill('100');
    await page.locator('select[name="car-efficiency"]').selectOption('25');

    // Fill home energy data
    await page.locator('input[name="electricity"]').fill('500');

    // Submit calculation
    await page.locator('button[type="submit"]').click();

    // Check if results are displayed
    await expect(page.locator('text=Your Carbon Footprint')).toBeVisible();
    await expect(page.locator('.results')).toBeVisible();
  });

  test('should navigate to dashboard after calculation', async ({ page }) => {
    await page.goto('/calculator');

    // Quick calculation
    await page.locator('input[name="electricity"]').fill('300');
    await page.locator('button[type="submit"]').click();

    // Click view dashboard button
    await page.locator('text=View Dashboard').click();

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});

test.describe('Dashboard', () => {
  test('should load dashboard with charts', async ({ page }) => {
    await page.goto('/dashboard');

    // Check main dashboard elements
    await expect(page.locator('text=Carbon Overview')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(3); // Charts should be present
  });

  test('should switch between dashboard tabs', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on different tabs
    await page.locator('text=Charts').click();
    await expect(page.locator('text=Emissions by Category')).toBeVisible();

    await page.locator('text=Comparison').click();
    await expect(page.locator('text=National Average')).toBeVisible();

    await page.locator('text=Leaderboard').click();
    await expect(page.locator('text=Top Contributors')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to calculator
    await page.locator('text=Calculate Impact').click();
    await expect(page).toHaveURL(/.*calculator/);

    // Navigate back to home
    await page.locator('text=Carbo-Tracker').click();
    await expect(page).toHaveURL('/');

    // Navigate to shop
    await page.locator('text=Sustainable Products').click();
    await expect(page).toHaveURL(/.*shop/);
  });
});
