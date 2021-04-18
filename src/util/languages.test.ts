import { langDirection } from './languages';

describe('langDirection', () => {
  it('maps eng to ltr', () => expect(langDirection('eng')).toBe('ltr'));
  it('maps ara to rlt', () => expect(langDirection('ara')).toBe('rtl'));
});
