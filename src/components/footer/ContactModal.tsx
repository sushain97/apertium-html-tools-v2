import * as React from 'react';
import Modal, { ModalProps } from 'react-bootstrap/Modal';

import { t } from '../../util/localization';

const ContactModal = (props: ModalProps): React.ReactElement => {
  return (
    <Modal {...props}>
      <Modal.Header closeButton>
        <Modal.Title>{t('Contact')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('Contact_Us')}</p>
        <div dangerouslySetInnerHTML={{ __html: t('Contact_Para') }} />
      </Modal.Body>
    </Modal>
  );
};

export default ContactModal;
