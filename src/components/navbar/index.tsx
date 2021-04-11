import './navbar.css';

import * as React from 'react';

import Nav from 'react-bootstrap/Nav';
import BootstrapNavbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import Config, { Mode } from '../../../config';
import { t } from '../../util/localization';
import LocaleSelector from '../LocaleSelector';
import logo from './Apertium_box_white_small.embed.png';

const Logo = () => (
  <img
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    alt="Apertium Box"
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

const WordMark = () => (
  <span
    style={{
      color: 'gray',
      display: 'inline-block',
      fontFamily: `DejaVu Sans','DejaVu Sans Fallback','Arial #000',Arial`,
      fontSize: '2.25em',
      fontStyle: 'italic',
      fontWeight: 'bold',
      left: '2.25em',
      marginBottom: '-.25em',
      top: '.5em',
      position: 'absolute',
    }}
  >
    Apertium
  </span>
);

const TagLine = () => (
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

const Navbar = ({
  setLocale,
}: {
  setLocale: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactElement => {
  return (
    <BootstrapNavbar
      bg="dark"
      variant="dark"
      expand="md"
      className="navbar navbar-default mb-4 pt-0"
    >
      <Container className="position-relative" style={{ lineHeight: '1.5em' }}>
        <div>
          <div>
            <Logo />
            <WordMark />
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
        <BootstrapNavbar.Toggle></BootstrapNavbar.Toggle>
        <BootstrapNavbar.Collapse>
          <Nav className="mt-1 ml-auto" as="ul">
            {Config.enabledModes.size > 1 && (
              <>
                {Config.enabledModes.has(Mode.Translation) && (
                  <Nav.Item className="p-1" as="li">
                    <Nav.Link>{t('Translation')}</Nav.Link>
                  </Nav.Item>
                )}
                {Config.enabledModes.has(Mode.Analysis) && (
                  <Nav.Item className="p-1" as="li">
                    <Nav.Link>{t('Morphological_Analysis')}</Nav.Link>
                  </Nav.Item>
                )}
                {Config.enabledModes.has(Mode.Generation) && (
                  <Nav.Item className="p-1" as="li">
                    <Nav.Link>{t('Morphological_Generation')}</Nav.Link>
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
