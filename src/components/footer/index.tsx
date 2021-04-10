import './footer.css';

import * as React from 'react';
import Nav from 'react-bootstrap/Nav';

import { t } from '../../util/localization';
import AboutModal from './AboutModal';

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
                <a
                  tabIndex={0}
                  style={{ fontSize: '16px' }}
                  onClick={() => setOpenTab('about')}
                  className="footer-link"
                >
                  <i className="fa fa-question-circle"></i> {t('About')}
                </a>
              </Nav.Item>
            </Nav>
          </div>
        </div>
      </div>

      <AboutModal show={openTab === 'about'} onHide={() => setOpenTab(undefined)} />
    </>
  );
};

export default Footer;
