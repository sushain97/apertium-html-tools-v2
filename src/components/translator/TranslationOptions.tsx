import * as React from 'react';
import Form from 'react-bootstrap/Form';

import Config from '../../../config';
import { useLocalization } from '../../util/localization';

const TranslationOptions = ({
  markUnknown,
  setMarkUnknown,
  instantTranslation,
  setInstantTranslation,
  translationChaining,
  setTranslationChaining,
}: {
  markUnknown: boolean;
  setMarkUnknown: React.Dispatch<React.SetStateAction<boolean>>;
  instantTranslation: boolean;
  setInstantTranslation: React.Dispatch<React.SetStateAction<boolean>>;
  translationChaining: boolean;
  setTranslationChaining: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactElement => {
  const { t } = useLocalization();

  return (
    <>
      <Form.Check
        checked={markUnknown}
        custom
        id="mark-unknown-words"
        label={t('Mark_Unknown_Words')}
        onChange={({ currentTarget }) => setMarkUnknown(currentTarget.checked)}
      />
      <Form.Check
        checked={instantTranslation}
        custom
        id="instant-translation"
        label={t('Instant_Translation')}
        onChange={({ currentTarget }) => setInstantTranslation(currentTarget.checked)}
      />
      {Config.translationChaining && (
        <Form.Check
          checked={translationChaining}
          custom
          id="translation-chaining"
          label={<span dangerouslySetInnerHTML={{ __html: t('Multi_Step_Translation') }} />}
          onChange={({ currentTarget }) => setTranslationChaining(currentTarget.checked)}
        />
      )}
    </>
  );
};

export default TranslationOptions;
