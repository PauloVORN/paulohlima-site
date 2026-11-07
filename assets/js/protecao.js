/* Desestimula o download casual de fotos e vídeos (botão "Baixar", picture-in-picture,
   menu de contexto e arrastar). Não impede captura de tela nem quem inspeciona a página. */
(function () {
  function protegeVideo(v) {
    v.setAttribute("controlsList", "nodownload noremoteplayback");
    v.setAttribute("disablePictureInPicture", "");
    v.disablePictureInPicture = true;
  }
  document.querySelectorAll("video").forEach(protegeVideo);
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.tagName === "VIDEO") protegeVideo(n);
        else if (n.querySelectorAll) n.querySelectorAll("video").forEach(protegeVideo);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("contextmenu", function (e) {
    if (e.target.closest && e.target.closest("img, video, picture")) e.preventDefault();
  });
  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG") e.preventDefault();
  });
})();
