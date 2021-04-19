import * as React from 'react';

const WebpageTranslationForm = (props: {
  cancelLink: string;
  srcLang: string;
  tgtLang: string;
}): React.ReactElement => {
  return (
    <>
      TODO: {props.srcLang}-{props.tgtLang}
    </>
  );
};

export default WebpageTranslationForm;
