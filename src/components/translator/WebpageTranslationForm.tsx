import * as React from 'react';

const WebpageTranslationForm = (props: {
  onCancel: () => void;
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
