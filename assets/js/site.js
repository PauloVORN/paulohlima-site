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

  // Medição de contatos (GA4): cliques em WhatsApp, e-mail e Instagram. Só registra onde o GA4 está carregado (site no ar).
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var onde = a.closest('.wa-fab') ? 'botao_flutuante' : a.closest('footer') ? 'rodape' : a.closest('#briefing, .contato') ? 'contato' : 'pagina';
    var params = { link_location: onde, page_path: location.pathname };
    if (h.indexOf('wa.me/') > -1) {
      track('whatsapp_click', params);
      // a mensagem pronta passa a dizer de qual página a pessoa veio, para você saber a origem ao receber
      if (h.indexOf('text=') > -1 && h.indexOf('Vim%20pelo%20seu%20site') > -1 && h.indexOf('via%20paulohlima') < 0) {
        a.setAttribute('href', h.replace('Vim%20pelo%20seu%20site', 'Vim%20pelo%20seu%20site%20(via%20paulohlima.com.br' + encodeURIComponent(location.pathname) + ')'));
      }
    } else if (h.indexOf('mailto:') === 0) track('email_click', params);
    else if (h.indexOf('instagram.com') > -1) track('instagram_click', params);
  }, true);

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
      track("generate_lead", { method: "briefing_whatsapp", tipo: field("tipo"), page_path: location.pathname });
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(build()), '_blank', 'noopener');
    });
    var mailBtn = document.getElementById('briefing-mail');
    if (mailBtn) {
      mailBtn.addEventListener('click', function () {
        track("generate_lead", { method: "briefing_email", tipo: field("tipo"), page_path: location.pathname });
        window.location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent('Orçamento — contato pelo site') + '&body=' + encodeURIComponent(build());
      });
    }
  }
})();
