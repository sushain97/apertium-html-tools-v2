import './footer.css';

import * as React from 'react';
import { faBook, faDownload, faEnvelope, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ModalProps } from 'react-bootstrap/Modal';
import Nav from 'react-bootstrap/Nav';

import AboutModal from './AboutModal';
import ContactModal from './ContactModal';
import DocumentationModal from './DocumentationModal';
import DownloadModal from './DownloadModal';
import { useLocalization } from '../../util/localization';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const version: string = (window as any).VERSION;

const enum Tab {
  About = 'about',
  Download = 'download',
  Documentation = 'documentation',
  Contact = 'contact',
}

const Tabs: Record<Tab, (props: ModalProps) => React.ReactElement> = {
  [Tab.About]: AboutModal,
  [Tab.Download]: DownloadModal,
  [Tab.Documentation]: DocumentationModal,
  [Tab.Contact]: ContactModal,
};

const Footer = ({
  wrapRef,
  pushRef,
}: {
  wrapRef: React.RefObject<HTMLElement>;
  pushRef: React.RefObject<HTMLElement>;
}): React.ReactElement => {
  const { t } = useLocalization();

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
                <Nav.Link onClick={() => setOpenTab(Tab.About)} className="footer-link">
                  <FontAwesomeIcon icon={faQuestionCircle} /> {t('About')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link onClick={() => setOpenTab(Tab.Download)} className="footer-link">
                  <FontAwesomeIcon icon={faDownload} /> {t('Download')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link onClick={() => setOpenTab(Tab.Documentation)} className="footer-link">
                  <FontAwesomeIcon icon={faBook} /> {t('Documentation')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item as="li">
                <Nav.Link onClick={() => setOpenTab(Tab.Contact)} className="footer-link">
                  <FontAwesomeIcon icon={faEnvelope} /> {t('Contact')}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="card d-inline-block bg-light mr-3 mb-4 ml-3 p-2">
              <span>{t('Notice_Mistake')}</span>{' '}
              <a tabIndex={0} onClick={() => setOpenTab(Tab.About)} style={{ cursor: 'pointer' }}>
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
          <div className="align-self-end card card-body d-block bg-light d-md-none mt-2 mr-0 mb-0 p-2">
            <span>{t('Notice_Mistake')}</span>{' '}
            <a tabIndex={0} onClick={() => setOpenTab(Tab.About)} role="button" href="#">
              {t('Help_Improve')}
            </a>
          </div>
        </div>
      </div>

      {Object.entries(Tabs).map(([tab, Modal]) => (
        <Modal key={tab} show={openTab === tab} onHide={() => setOpenTab(undefined)} />
      ))}
    </>
  );
};

export default Footer;
