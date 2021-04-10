import './footer.css';

import * as React from 'react';
import Nav from 'react-bootstrap/Nav';

import { t } from '../../util/localization';
import AboutModal from './AboutModal';
import DownloadModal from './DownloadModal';
import DocumentationModal from './DocumentationModal';
import ContactModal from './ContactModal';

type Tab = 'about' | 'download' | 'documentation' | 'contact';

const Footer = (): React.ReactFragment => {
  const [openTab, setOpenTab] = React.useState<Tab | undefined>(undefined);

  return (
    <>
      <div id="footer" className="d-flex flex-column container">
        <div className="d-flex flex-column container">
          <div className="d-none d-md-flex flex-wrap flex-row justify-content-between position-relative row">
            <Nav variant="pills" as="ul" style={{ cursor: 'pointer' }}>
              <Nav.Item as="li">
                <a tabIndex={0} onClick={() => setOpenTab('about')} className="footer-link">
                  <i className="fa fa-question-circle"></i> {t('About')}
                </a>
              </Nav.Item>
              <Nav.Item as="li">
                <a tabIndex={0} onClick={() => setOpenTab('download')} className="footer-link">
                  <i className="fa fa-download"></i> {t('Download')}
                </a>
              </Nav.Item>
              <Nav.Item as="li">
                <a tabIndex={0} onClick={() => setOpenTab('documentation')} className="footer-link">
                  <i className="fa fa-book"></i> {t('Documentation')}
                </a>
              </Nav.Item>
              <Nav.Item as="li">
                <a tabIndex={0} onClick={() => setOpenTab('contact')} className="footer-link">
                  <i className="fa fa-envelope"></i> {t('Contact')}
                </a>
              </Nav.Item>
            </Nav>
          </div>
        </div>
      </div>

      <AboutModal show={openTab === 'about'} onHide={() => setOpenTab(undefined)} />
      <DownloadModal show={openTab === 'download'} onHide={() => setOpenTab(undefined)} />
      <DocumentationModal show={openTab === 'documentation'} onHide={() => setOpenTab(undefined)} />
      <ContactModal show={openTab === 'contact'} onHide={() => setOpenTab(undefined)} />
    </>
  );
};

export default Footer;
