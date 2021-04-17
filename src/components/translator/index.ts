import Translator from './Translator';
import { parentLang } from '../../util/languages';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Pairs: Readonly<Record<string, Set<string>>> = ((window as any).PAIRS as Array<{
  sourceLanguage: string;
  targetLanguage: string;
}>).reduce((pairs, { sourceLanguage, targetLanguage }) => {
  pairs[sourceLanguage] = pairs[sourceLanguage] || new Set();
  pairs[sourceLanguage].add(targetLanguage);
  return pairs;
}, {} as Record<string, Set<string>>);

export const SrcLangs = new Set(Object.keys(Pairs));
SrcLangs.forEach((lang) => {
  const parent = parentLang(lang);
  if (!SrcLangs.has(parent)) {
    SrcLangs.add(parent);
  }
});

export const DstLangs = new Set(([] as Array<string>).concat(...Object.values(Pairs).map((ls) => Array.from(ls))));
DstLangs.forEach((lang) => {
  const parent = parentLang(lang);
  if (!DstLangs.has(parent)) {
    DstLangs.add(parent);
  }
});

export const isPair = (src: string, dst: string): boolean => Pairs[src] && Pairs[src].has(dst);

export default Translator;
