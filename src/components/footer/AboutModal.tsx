import * as React from 'react';
import Col from 'react-bootstrap/Col';
import Modal, { ModalProps } from 'react-bootstrap/Modal';

import { t } from '../../util/localization';

import githubLogo from './img/github.png';
import prompsitLogo from './img/prompsit150x52.png';
import alicanteLogo from './img/logouapp.gif';
import bytemarkLogo from './img/logo_bytemark.gif';
import catalunyaLogo from './img/stsi.gif';
import mineturLogo from './img/logomitc120.jpg';
import maeLogo from './img/logo_mae_ro_75pc.jpg';
import ccLogo from './img/cc-by-sa-3.0-88x31.png';
import gplLogo from './img/gplv3-88x31.png';

const AboutModal = (props: ModalProps): React.ReactElement => {
  return (
    <Modal {...props} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t('About_Apertium')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: t('What_Is_Apertium') }} />
        <div style={{ paddingBottom: '2em' }} dangerouslySetInnerHTML={{ __html: t('Maintainer') }} />

        <div className="row lead">
          <Col md="6">
            <div className="mx-auto">
              <a href="https://developers.google.com/open-source/soc/" target="_blank" rel="noreferrer">
                <img
                  alt="Google Summer of Code"
                  src="https://summerofcode.withgoogle.com/static/img/summer-of-code-logo.svg"
                  style={{ height: '2.5em' }}
                />
              </a>
              <a href="https://developers.google.com/open-source/gci/" target="_blank" rel="noreferrer">
                <img
                  alt="Google Code-In"
                  src="https://developers.google.com/open-source/gci/images/logo-icon.png"
                  style={{ height: '2.5em', paddingLeft: '0.5em' }}
                />
              </a>
            </div>
          </Col>

          <Col md="3" className="text-center">
            <a href="http://www.bytemark.co.uk/" target="_blank" rel="noreferrer">
              <img alt="Bytemark" className="w-100" src={bytemarkLogo} style={{ marginTop: '0.5em' }} />
            </a>
          </Col>
          <Col md="3" className="text-center">
            <a href="https://www.github.com/apertium" target="_blank" rel="noreferrer">
              <img alt="GitHub" src={githubLogo} style={{ height: '1.5em' }} />
            </a>
          </Col>
        </div>

        <div className="row lead">
          <Col md="6" className="text-center">
            <a href="http://www.minetur.gob.es/" target="_blank" rel="noreferrer">
              <img alt="Ministry of Industry, Energy and Tourism" src={mineturLogo} />
            </a>
          </Col>
          <Col md="6" className="text-center">
            <a href="http://www.ua.es/" target="_blank" rel="noreferrer">
              <img alt="Universidad de Alicante" src={alicanteLogo} />
            </a>
          </Col>
        </div>

        <div className="row">
          <Col md="4" className="text-center">
            <a href="http://www.prompsit.com/" target="_blank" rel="noreferrer">
              <img alt="Prompsit Language Engineering S.L." src={prompsitLogo} />
            </a>
          </Col>
          <Col md="4" className="text-center">
            <a href="http://www10.gencat.net" target="_blank" rel="noreferrer">
              <img alt="Generalitat de Catalunya" src={catalunyaLogo} />
            </a>
          </Col>
          <Col md="4" className="text-center">
            <a href="http://www.mae.ro/" target="_blank" rel="noreferrer">
              <img alt="ROMÂNIA  Ministerul Afacerilor Externe" src={maeLogo} />
            </a>
          </Col>
        </div>
        <div className="row">
          <div className="d-inline-block my-o" style={{ marginLeft: '0.5em', marginRight: '0.5em' }}>
            <a href="http://creativecommons.org/licenses/by-sa/3.0/">
              <img alt="Creative Commons licence" src={ccLogo} />
            </a>
          </div>

          <div className="d-inline-block my-0" style={{ marginLeft: '0.5em', marginRight: '0.5em' }}>
            <a href="https://www.gnu.org/licenses/gpl.html">
              <img alt="GNU GPL License" src={gplLogo} />
            </a>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AboutModal;
