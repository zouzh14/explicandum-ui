
import { describe, it, expect } from 'vitest';
import { translations } from './i18n';

describe('i18n translations', () => {
  it('should have both en and zh languages', () => {
    expect(translations.en).toBeDefined();
    expect(translations.zh).toBeDefined();
  });

  it('should have matching keys for en and zh', () => {
    const enKeys = Object.keys(translations.en).sort();
    const zhKeys = Object.keys(translations.zh).sort();
    expect(enKeys).toEqual(zhKeys);
  });
});
