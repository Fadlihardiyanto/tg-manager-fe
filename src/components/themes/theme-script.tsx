/**
 * Applies the light-only theme class during HTML parsing, before first paint,
 * so server-rendered markup is not repainted after hydration.
 *
 * Rendered as a plain inline <script> instead of `next/script` with
 * `strategy="beforeInteractive"`, which is only valid inside `pages/_document`.
 */
export function ThemeScript() {
  return (
    <script
      id='theme-script'
      dangerouslySetInnerHTML={{
        __html: `(function(){document.documentElement.classList.add("light")})()`
      }}
    />
  );
}
