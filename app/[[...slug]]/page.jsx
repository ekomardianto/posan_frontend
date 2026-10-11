'use client'

import dynamic from 'next/dynamic'

const PosanApplication = dynamic(() => import('../../src/App.jsx'), {
  ssr: false,
})

export default function Page() {
  return (
    <div id="root">
      <PosanApplication />
    </div>
  )
}
