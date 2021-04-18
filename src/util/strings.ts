export type Strings = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  readonly '@langNames': Record<string, string>;
  readonly [id: string]: string;
};

// eslint-disable-next-line
export const DEFAULT_STRINGS: Strings = (window as any).DEFAULT_STRINGS;
