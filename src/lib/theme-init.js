export const themeStorageKey = 's3onghyun-theme';

export const themeInitScript = `(() => {
  const storageKey = '${themeStorageKey}';
  const themes = ['paper', 'night'];
  const preferredTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'paper';
  let theme;

  try {
    const savedTheme = window.localStorage.getItem(storageKey);
    theme = themes.includes(savedTheme) ? savedTheme : preferredTheme();
  } catch {
    theme = preferredTheme();
  }

  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#1d2021' : '#f7f6ef');
})();`;
