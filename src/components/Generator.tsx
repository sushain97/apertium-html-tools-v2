import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Generators: { [code: string]: string } = (window as any).GENERATORS;

const Generator = (): React.ReactElement => {
  return <>{JSON.stringify(Generators)}</>;
};

export default Generator;
