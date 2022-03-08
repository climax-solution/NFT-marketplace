import React, { lazy } from 'react';
const InternalLinks = lazy(() => import('./Footer/internal'));
const SocialLinks = lazy(() => import('./Footer/socials'));

const footer= () => (
  <footer className="footer-light">
    <InternalLinks/>
    <SocialLinks/>
  </footer>
);
export default footer;