import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Analyzers: { [code: string]: string } = (window as any).ANALYZERS;

const Analyzer = (): React.ReactElement => {
  return <>{JSON.stringify(Analyzers)}</>;
};

export default Analyzer;
