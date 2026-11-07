/* Microsoft Clarity (mapas de calor e gravações). Só começa depois da página pronta, respeita
   "não rastrear" e fica desligado nas visitas do dono: abrir o site uma vez com ?sem_rastreio=1
   marca o aparelho. */
(function () {
  var CLARITY_ID = "z9vdaw2a24";
  try {
    if (new URLSearchParams(window.location.search).get("sem_rastreio") === "1") {
      localStorage.setItem("sem_rastreio", "1");
    }
    var semRastreio = localStorage.getItem("sem_rastreio") === "1";
    var naoRastrear = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
    if (!CLARITY_ID || semRastreio || naoRastrear) return;
    var iniciar = function () {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", CLARITY_ID);
    };
    if (document.readyState === "complete") setTimeout(iniciar, 1500);
    else window.addEventListener("load", function () { setTimeout(iniciar, 1500); });
  } catch (e) { /* sem Clarity: segue normal */ }
})();
