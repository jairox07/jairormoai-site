/* Píxel de Meta del Kit Editor IA.
   Pega aquí el ID del píxel (solo números) para activarlo. Vacío = no se carga nada. */
(function () {
  var PIXEL_ID = '';
  window.kitTrack = function () {};
  if (!PIXEL_ID) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
  window.kitTrack = function (ev, params, opts) { window.fbq('track', ev, params || {}, opts || {}); };
})();
