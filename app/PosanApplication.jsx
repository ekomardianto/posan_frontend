'use client';

import dynamic from 'next/dynamic';

const PosanApp = dynamic(() => import('../src/App.jsx'), {
  ssr: false,
});

export default function PosanApplication() {
  return (
    <div id="root">
      <PosanApp />
    </div>
  );
}
