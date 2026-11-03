// Adapt this example to the discovered project inventory before running.
export default {
  baseURL: 'http://127.0.0.1:3000',
  browsers: ['chromium'],
  viewports: [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ],
  // Retain only supported themes; add any custom themes the app provides.
  themes: [
    { name: 'light', colorScheme: 'light' },
    { name: 'dark', colorScheme: 'dark' },
  ],
  // For an app using a persisted theme, adapt to its real key/values:
  // async prepare({ context, theme }) {
  //   await context.addInitScript(value => {
  //     localStorage.setItem('theme', value);
  //   }, theme.name);
  // },
  async ready({ page }) {
    // Replace or extend with the actual app/theme/data readiness assertions.
    await page.getByRole('main').waitFor({ state: 'visible' });
  },
  scenarios: [
    {
      name: 'home',
      path: '/',
      async run({ capture }) {
        await capture('default');
      },
    },
    // Add actual routes and component flows. For example:
    // {
    //   name: 'navigation', path: '/',
    //   async run({ page, capture }) {
    //     const trigger = page.getByRole('button', { name: 'Menu', exact: true });
    //     await trigger.hover();
    //     await capture('menu-trigger-hover');
    //     await trigger.click();
    //     await page.getByRole('menu').waitFor({ state: 'visible' });
    //     await capture('menu-open');
    //   },
    // },
    // Keyboard focus: navigate with Tab/Shift+Tab, assert the intended active
    // element and :focus-visible, then capture. Add selected, validation,
    // modal, chart, and other states from the coverage ledger.
  ],
};
