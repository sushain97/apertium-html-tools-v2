import * as React from 'react';

import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import LocaleSelector from '../locale-selector';
import logo from './Apertium_box_white_small.png';

export default () => {
  return (
    <Navbar
      bg="dark"
      expand="md"
      style={{
        padding: '.5rem 1rem',
      }}
    >
      <Container className="position-relative">
        <div>
          <div>
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
            <span
              style={{
                color: 'gray',
                fontSize: '2.25em',
                marginBottom: '-.25em',
                left: '2.25em',
              }}
            >
              Apertium
            </span>
          </div>
          <p
            style={{
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 10px',
            }}
          >
            A free/open-source machine translation platform
          </p>
        </div>
        <div className="float-right d-none d-md-block align-self-start">
          <LocaleSelector />
        </div>
        <Navbar.Toggle></Navbar.Toggle>
        <Navbar.Collapse>
          <Nav></Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
