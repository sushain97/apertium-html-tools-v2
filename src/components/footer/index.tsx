import './footer.css';

import * as React from 'react';
import Nav from 'react-bootstrap/Nav';

import { t } from '../../util/localization';
import AboutModal from './AboutModal';
import DownloadModal from './DownloadModal';
import DocumentationModal from './DocumentationModal';
import ContactModal from './ContactModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const version: string = (window as any).VERSION;

type Tab = 'about' | 'download' | 'documentation' | 'contact';

const Footer = ({
  wrapRef,
  pushRef,
}: {
  wrapRef: React.RefObject<HTMLElement>;
  pushRef: React.RefObject<HTMLElement>;
}): React.ReactElement => {
  const [openTab, setOpenTab] = React.useState<Tab | undefined>(undefined);

  const footerRef = React.createRef<HTMLDivElement>();
  React.useLayoutEffect(() => {
    const refreshSizes = () => {
      const footerHeight = footerRef.current?.offsetHeight;
      if (footerHeight && pushRef.current && wrapRef.current) {
        pushRef.current.style.height = `${footerHeight}px`;
        wrapRef.current.style.marginBottom = `-${footerHeight}px`;
      }
    };

    window.addEventListener('resize', refreshSizes);
    refreshSizes();

    return () => window.removeEventListener('resize', refreshSizes);
  }, [footerRef, wrapRef, pushRef]);

  return (
    <>
      <div ref={footerRef} className="d-flex flex-column container">
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

            <div className="card d-inline-block bg-light mr-3 mb-4 ml-3 p-2">
              <span>{t('Notice_Mistake')}</span>{' '}
              <a tabIndex={0} onClick={() => setOpenTab('about')} style={{ cursor: 'pointer' }}>
                {t('Help_Improve')}
              </a>
            </div>

            <a
              className="text-muted d-none d-lg-block version"
              href="https://github.com/apertium/apertium-html-tools"
              target="_blank"
              rel="noreferrer"
            >
              <small>{version}</small>
            </a>
          </div>
        </div>
      </div>

      <AboutModal show={openTab === 'about'} onHide={() => setOpenTab(undefined)} />
      <DownloadModal show={openTab === 'download'} onHide={() => setOpenTab(undefined)} />
      <DocumentationModal show={openTab === 'documentation'} onHide={() => setOpenTab(undefined)} />
      <ContactModal show={openTab === 'contact'} onHide={() => setOpenTab(undefined)} />

      <div className="align-self-end card card-body d-block bg-light d-md-none mt-2 mr-0 mb-0 p-2">
        <span>{t('Notice_Mistake')}</span>
        <a tabIndex={0} onClick={() => setOpenTab('about')} style={{ cursor: 'pointer' }}>
          {t('Help_Improve')}
        </a>
      </div>
    </>
  );
};

export default Footer;
