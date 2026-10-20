/* Visualizador de fotos em tela cheia (sem dependências).
   Teclado: ← → navegam, Esc fecha. Toque: deslize para os lados. Respeita o formato de cada foto. */
(function () {
  'use strict';
  var galeria = document.querySelector('[data-galeria]');
  if (!galeria) return;

  var itens = Array.prototype.slice.call(galeria.querySelectorAll('.galeria-item'));
  var colunas = 0;
  // Distribui as fotos em colunas na ordem da lista (cada uma vai para a coluna mais baixa).
  // Usa a proporção real de cada foto, então nada é cortado e não há buracos.
  function distribuir() {
    var n = window.matchMedia('(max-width: 900px)').matches ? 2 : 3;
    if (n === colunas) return;
    colunas = n;
    var cols = [], alturas = [];
    galeria.innerHTML = '';
    for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'galeria-col'; galeria.appendChild(c); cols.push(c); alturas.push(0); }
    itens.forEach(function (it) {
      var p = it.getAttribute('data-ar').split('/'), ar = (+p[0]) / (+p[1]);
      var m = alturas.indexOf(Math.min.apply(null, alturas));
      cols[m].appendChild(it); alturas[m] += ar + 0.02;
    });
    galeria.classList.add('galeria--colunas');
  }
  distribuir();
  window.addEventListener('resize', distribuir);

  var links = Array.prototype.slice.call(galeria.querySelectorAll('.galeria-link'));
  links.sort(function (a, b) { return itens.indexOf(a.closest('.galeria-item')) - itens.indexOf(b.closest('.galeria-item')); });
  var fotos = links.map(function (a) {
    return {
      base: a.getAttribute('data-base'),
      larguras: a.getAttribute('data-larguras').split(',').map(Number),
      jpg: a.getAttribute('data-jpg'),
      w: +a.getAttribute('data-w'),
      h: +a.getAttribute('data-h'),
      alt: a.getAttribute('data-alt')
    };
  });

  var box = document.createElement('div');
  box.className = 'lb';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Visualizador de fotos');
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-fechar" type="button" aria-label="Fechar">×</button>' +
    '<button class="lb-nav lb-ant" type="button" aria-label="Foto anterior">‹</button>' +
    '<button class="lb-nav lb-prox" type="button" aria-label="Próxima foto">›</button>' +
    '<figure class="lb-fig"><picture class="lb-pic"></picture></figure>' +
    '<p class="lb-cont" aria-live="polite"></p>';
  document.body.appendChild(box);

  var pic = box.querySelector('.lb-pic');
  var cont = box.querySelector('.lb-cont');
  var atual = 0, abertoPor = null, tocouX = null;

  function srcset(f, ext) {
    return f.larguras.map(function (w) { return f.base + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', ');
  }
  function fonte(tipo, f, ext) {
    var s = document.createElement('source');
    s.type = tipo; s.sizes = '100vw'; s.srcset = srcset(f, ext);
    return s;
  }
  function montar(i) {
    var f = fotos[i];
    var novoPic = document.createElement('picture');      // as <source> entram antes do <img>: o navegador escolhe o formato sem baixar o JPG de reserva
    novoPic.className = 'lb-pic';
    novoPic.appendChild(fonte('image/avif', f, 'avif'));
    novoPic.appendChild(fonte('image/webp', f, 'webp'));
    var im = document.createElement('img');
    im.width = f.w; im.height = f.h; im.alt = f.alt;
    im.src = f.base + '-' + f.jpg + '.jpg';
    novoPic.appendChild(im);
    pic.parentNode.replaceChild(novoPic, pic);
    pic = novoPic;
    cont.textContent = (i + 1) + ' / ' + fotos.length;
  }
  function pre(i) {                                   // pré-carrega a vizinha para a troca ser instantânea
    var f = fotos[(i + fotos.length) % fotos.length], im = new Image();
    im.src = f.base + '-' + f.larguras[Math.min(3, f.larguras.length - 1)] + '.webp';
  }
  function ir(i) {
    atual = (i + fotos.length) % fotos.length;
    montar(atual); pre(atual + 1); pre(atual - 1);
  }
  function abrir(i, origem) {
    abertoPor = origem;
    ir(i);
    box.hidden = false;
    document.documentElement.classList.add('lb-aberto');
    box.querySelector('.lb-fechar').focus();
  }
  function fechar() {
    box.hidden = true;
    document.documentElement.classList.remove('lb-aberto');
    pic.textContent = '';
    if (abertoPor) abertoPor.focus();
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); abrir(i, a); });
  });
  box.querySelector('.lb-fechar').addEventListener('click', fechar);
  box.querySelector('.lb-ant').addEventListener('click', function () { ir(atual - 1); });
  box.querySelector('.lb-prox').addEventListener('click', function () { ir(atual + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('lb-fig')) fechar(); });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') fechar();
    else if (e.key === 'ArrowLeft') ir(atual - 1);
    else if (e.key === 'ArrowRight') ir(atual + 1);
    else if (e.key === 'Tab') {                       // mantém o foco dentro do visualizador
      var f = box.querySelectorAll('button');
      var primeiro = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });

  box.addEventListener('touchstart', function (e) { tocouX = e.changedTouches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (tocouX === null) return;
    var dx = e.changedTouches[0].clientX - tocouX;
    tocouX = null;
    if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
