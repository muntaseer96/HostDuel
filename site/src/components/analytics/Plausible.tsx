import Script from 'next/script';

export function Plausible() {
  return (
    <>
      <Script
        src="https://analytics.muntaseerrahman.com/js/pa-5g0kHez4zWhP5eZgiNDbg.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </>
  );
}
