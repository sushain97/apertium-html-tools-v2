import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pairs: Readonly<Array<{ sourceLanguage: string; targetLanguage: string }>> = (window as any)
  .PAIRS;

const Translator = (): React.ReactElement => {
  return <>{JSON.stringify(Pairs)}</>;
};

export default Translator;
