import assert from 'node:assert/strict';
import vm from 'node:vm';

import { themeInitScript, themeStorageKey } from '../src/lib/theme-init.js';

const runThemeInit = ({ savedTheme, prefersDark = false, storageThrows = false } = {}) => {
  const documentElement = { dataset: {} };
  const themeColor = { content: '#f7f6ef', setAttribute: (_, value) => { themeColor.content = value; } };
  const context = {
    document: { documentElement, querySelector: () => themeColor },
    window: {
      matchMedia: () => ({ matches: prefersDark }),
      localStorage: { getItem: () => {
        if (storageThrows) throw new Error('unavailable');
        return savedTheme;
      } },
    },
  };
  vm.runInNewContext(themeInitScript, context);
  return { theme: documentElement.dataset.theme, themeColor: themeColor.content };
};

assert.equal(themeStorageKey, 's3onghyun-theme');
assert.deepEqual(runThemeInit({ prefersDark: true }), { theme: 'night', themeColor: '#1d2021' });
assert.deepEqual(runThemeInit({ savedTheme: 'paper', prefersDark: true }), { theme: 'paper', themeColor: '#f7f6ef' });
assert.deepEqual(runThemeInit({ savedTheme: 'invalid', prefersDark: false }), { theme: 'paper', themeColor: '#f7f6ef' });
assert.deepEqual(runThemeInit({ prefersDark: true, storageThrows: true }), { theme: 'night', themeColor: '#1d2021' });
console.log('Theme init checks passed');
