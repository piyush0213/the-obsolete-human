import { test, expect } from '@playwright/test';

test('Full museum journey from entrance to specimen profile', async ({ page }) => {
  // Go to homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/The Obsolete Human/);
  
  // Test skip to content link
  await page.keyboard.press('Tab');
  const skipLink = page.getByText('Skip to main content');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  
  // Click "Enter the Exhibit"
  await page.getByRole('link', { name: /Enter the Exhibit/i }).click();
  
  // Now on onboarding page
  await expect(page).toHaveURL(/\/onboarding/);
  
  // Fill out the classification form using keyboard navigation
  await page.getByLabel(/Specimen Name/i).fill('Test Subject Alpha');
  
  // Submit the form
  await page.getByRole('button', { name: /Classify Specimen/i }).click();
  
  // Loading skeleton should appear
  await expect(page.getByText(/Classifying specimen/i)).toBeVisible();
  
  // Should redirect to specimen page
  await expect(page).toHaveURL(/\/specimen/);
  
  // Specimen page should render the results
  await expect(page.getByRole('heading', { name: /The Test Subject Alpha Specimen/i })).toBeVisible();
});
