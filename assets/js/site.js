/* Paulo H Lima — comportamentos mínimos (sem dependências) */
(function () {
  'use strict';
  var masthead = document.querySelector('.masthead');
  var capa = document.querySelector('.capa');
  var fab = document.getElementById('wa-fab');

  function update() {
    var y = window.scrollY || window.pageYOffset;
    // Na capa o menu é transparente sobre a foto. Passou da foto: vira barra creme, como nas páginas internas.
    if (masthead && capa) {
      masthead.classList.toggle('masthead--solid', y > capa.offsetHeight - masthead.offsetHeight);
    }
    // Botão de WhatsApp: na capa só depois de rolar um pouco; nas demais páginas, sempre.
    if (fab) {
      var show = capa ? y > capa.offsetHeight * 0.6 : true;
      fab.classList.toggle('wa-fab--on', show);
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();

  // Briefing da página Contato: monta a mensagem e abre o WhatsApp (ou o e-mail). Não envia nada a servidor nenhum.
  var form = document.getElementById('briefing');
  if (form) {
    var number = form.getAttribute('data-wa');
    var mail = form.getAttribute('data-mail');
    var field = function (name) { var el = form.elements[name]; return el ? el.value.trim() : ''; };
    var build = function () {
      var lines = ['Olá, Paulo! Vim pelo seu site e gostaria de conversar sobre um projeto.', ''];
      var map = [['nome', 'Nome'], ['marca', 'Marca ou empresa'], ['tipo', 'Tipo de trabalho'], ['data', 'Data ou período'], ['projeto', 'Sobre o projeto']];
      map.forEach(function (m) { var v = field(m[0]); if (v) lines.push(m[1] + ': ' + v); });
      return lines.join('\n');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(build()), '_blank', 'noopener');
    });
    var mailBtn = document.getElementById('briefing-mail');
    if (mailBtn) {
      mailBtn.addEventListener('click', function () {
        window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Orçamento — contato pelo site') + '&body=' + encodeURIComponent(build());
      });
    }
  }
})();
