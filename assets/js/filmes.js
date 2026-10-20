/* Player de fashion films em tela cheia (sem dependências). Abre ao tocar na capa; Esc fecha. */
(function () {
  'use strict';
  var botoes = document.querySelectorAll('.filme-btn');
  if (!botoes.length) return;

  var box = document.createElement('div');
  box.className = 'pl';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Player de fashion film');
  box.hidden = true;
  box.innerHTML = '<button class="pl-fechar" type="button" aria-label="Fechar">×</button><video controls playsinline preload="metadata"></video><p class="pl-tit"></p>';
  document.body.appendChild(box);

  var video = box.querySelector('video'), tit = box.querySelector('.pl-tit'), abertoPor = null;

  function abrir(b) {
    abertoPor = b;
    video.setAttribute('poster', b.getAttribute('data-poster'));
    video.src = b.getAttribute('data-src');
    tit.textContent = b.getAttribute('data-titulo');
    box.hidden = false;
    document.documentElement.classList.add('pl-aberto');
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* o navegador pediu um toque no play: os controles já estão na tela */ });
    box.querySelector('.pl-fechar').focus();
  }
  function fechar() {
    video.pause();
    video.removeAttribute('src');
    video.load();
    box.hidden = true;
    document.documentElement.classList.remove('pl-aberto');
    if (abertoPor) abertoPor.focus();
  }

  Array.prototype.forEach.call(botoes, function (b) { b.addEventListener('click', function () { abrir(b); }); });
  box.querySelector('.pl-fechar').addEventListener('click', fechar);
  box.addEventListener('click', function (e) { if (e.target === box) fechar(); });
  document.addEventListener('keydown', function (e) { if (!box.hidden && e.key === 'Escape') fechar(); });
})();
