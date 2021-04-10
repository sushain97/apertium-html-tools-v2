import * as React from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';

import { t } from '../../util/localization';

const DownloadModal = (props: ModalProps): React.ReactElement => {
  return (
    <Modal {...props}>
      <Modal.Header closeButton>
        <Modal.Title>{t('Apertium_Downloads')}</Modal.Title>
      </Modal.Header>
      <Modal.Body dangerouslySetInnerHTML={{ __html: t('Downloads_Para') }} />
    </Modal>
  );
};

export default DownloadModal;
