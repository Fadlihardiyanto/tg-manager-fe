import Script from 'next/script';

export function ThemeScript() {
  return (
    <Script
      id='theme-script'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{
        __html: `(function(){document.documentElement.classList.add("light")})()`
      }}
    />
  );
}
