import * as React from 'react';
import Alert from 'react-bootstrap/Alert';

import { useLocalization } from '../util/localization';

const InstallationAlert = (): React.ReactElement => {
  const { t } = useLocalization();

  const [show, setShow] = React.useState(false);

  return (
    <Alert
      className="m-2 p-2 d-md-none d-lg-block"
      dismissible
      onClose={() => setShow(false)}
      show={show}
      style={{ fontSize: 'inherit', position: 'fixed', right: '20px', top: '20px', width: '360px', zIndex: 9999999 }}
      variant="warning"
    >
      <Alert.Heading className="m-0 pb-2">{t('Install_Apertium')}</Alert.Heading>
      <p className="mb-0" dangerouslySetInnerHTML={{ __html: t('Install_Apertium_Para') }} />
    </Alert>
  );
};

export default InstallationAlert;
