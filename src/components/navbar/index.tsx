import './navbar.css';

import * as React from 'react';
import { generatePath, useLocation } from 'react-router-dom';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import Config from '../../../config';
import LocaleSelector from '../LocaleSelector';
import { Mode } from '../../types';
import logo from './Apertium_box_white_small.embed.png';
import { useLocalization } from '../../util/localization';

const Logo = (): React.ReactElement => (
  <img
    alt="Apertium Box"
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    style={{
      backgroundImage: `url(${logo})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'auto 3.75em',
      height: '3.65em',
      marginRight: '-.5em',
      verticalAlign: 'text-bottom',
      width: '4.25em',
    }}
  />
);

const TagLine = (): React.ReactElement => {
  const { t } = useLocalization();

  return (
    <p
      style={{
        color: '#fff',
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 10px',
      }}
    >
      {t('tagline')}
    </p>
  );
};

const Navbar = ({ setLocale }: { setLocale: React.Dispatch<React.SetStateAction<string>> }): React.ReactElement => {
  const { t } = useLocalization();
  const { pathname } = useLocation();

  return (
    <BootstrapNavbar bg="dark" className="navbar navbar-default mb-4 pt-0" expand="md" variant="dark">
      <Container className="position-relative" style={{ lineHeight: '1.5em' }}>
        <div>
          <div>
            <Logo />
            {Config.subtitle && (
              <span className="apertium-sublogo" style={Config.subtitleColor ? { color: Config.subtitleColor } : {}}>
                {Config.subtitle}
              </span>
            )}
            <span className="apertium-logo">Apertium</span>
          </div>
          <TagLine />
        </div>
        <div
          className="float-right d-none d-md-block align-self-start"
          style={{
            width: '35%',
          }}
        >
          <LocaleSelector setLocale={setLocale} />
        </div>
        <BootstrapNavbar.Toggle />
        <BootstrapNavbar.Collapse>
          <Nav as="ul" className="mt-1 ml-auto">
            {Config.enabledModes.size > 1 && (
              <>
                {Config.enabledModes.has(Mode.Translation) && (
                  <Nav.Item as="li" className="p-1">
                    <Nav.Link
                      active={pathname == '/translation' || (pathname == '/' && Config.defaultMode == Mode.Translation)}
                      href={`#${generatePath('/translation')}`}
                    >
                      {t('Translation')}
                    </Nav.Link>
                  </Nav.Item>
                )}
                {Config.enabledModes.has(Mode.Analysis) && (
                  <Nav.Item as="li" className="p-1">
                    <Nav.Link
                      active={pathname == '/analysis' || (pathname == '/' && Config.defaultMode == Mode.Analysis)}
                      href={`#${generatePath('/analysis')}`}
                    >
                      {t('Morphological_Analysis')}
                    </Nav.Link>
                  </Nav.Item>
                )}
                {Config.enabledModes.has(Mode.Generation) && (
                  <Nav.Item as="li" className="p-1">
                    <Nav.Link
                      active={pathname == '/generation' || (pathname == '/' && Config.defaultMode == Mode.Generation)}
                      href={`#${generatePath('/generation')}`}
                    >
                      {t('Morphological_Generation')}
                    </Nav.Link>
                  </Nav.Item>
                )}
                {Config.enabledModes.has(Mode.Sandbox) && (
                  <Nav.Item as="li" className="p-1">
                    <Nav.Link
                      active={pathname == '/sandbox' || (pathname == '/' && Config.defaultMode == Mode.Sandbox)}
                      href={`#${generatePath('/sandbox')}`}
                    >
                      {t('APy_Sandbox')}
                    </Nav.Link>
                  </Nav.Item>
                )}
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
