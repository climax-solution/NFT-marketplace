import React, { lazy, Suspense } from 'react';
import Loading from './Loading/Loading';

const InternalLinks = lazy(() => import('./Footer/internal'));
const SocialLinks = lazy(() => import('./Footer/socials'));

const footer= () => (
  <Suspense fallback={<Loading/>}>
    <footer className="footer-light">
      <InternalLinks/>
      <SocialLinks/>
    </footer>
  </Suspense>
);
export default footer;