import React from 'react';

import InternalLinks from './Footer/internal';
import SocialLinks from './Footer/socials';

const footer= () => (
  <footer className="footer-light">
    <InternalLinks/>
    <SocialLinks/>
  </footer>
);
export default footer;