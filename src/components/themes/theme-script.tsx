'use client';

import Script from 'next/script';

// ponytail: inline script matches next-themes FOUC prevention.
// Attribute is hardcoded to 'class' since that's what the layout uses.
export function ThemeScript({ storageKey = 'theme' }: { storageKey?: string }) {
  return (
    <Script
      id='theme-script'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem("${storageKey}")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(t)}catch(e){}})()`
      }}
    />
  );
}
