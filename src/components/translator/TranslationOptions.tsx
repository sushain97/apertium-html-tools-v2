/* eslint-disable jsx-a11y/label-has-for */

import * as React from 'react';

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
      <label className="mb-1">
        <input
          checked={markUnknown}
          onChange={({ currentTarget }) => setMarkUnknown(currentTarget.checked)}
          type="checkbox"
        />{' '}
        <span>{t('Mark_Unknown_Words')}</span>
      </label>
      <label className="mb-1">
        <input
          checked={instantTranslation}
          onChange={({ currentTarget }) => setInstantTranslation(currentTarget.checked)}
          type="checkbox"
        />{' '}
        <span>{t('Instant_Translation')}</span>
      </label>
      {Config.translationChaining && (
        <label className="mb-1">
          <input
            checked={translationChaining}
            onChange={({ currentTarget }) => setTranslationChaining(currentTarget.checked)}
            type="checkbox"
          />{' '}
          <span dangerouslySetInnerHTML={{ __html: t('Multi_Step_Translation') }} />
        </label>
      )}
    </>
  );
};

export default TranslationOptions;
