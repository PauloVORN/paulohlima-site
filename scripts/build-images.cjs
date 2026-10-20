// Gera as variações leves (AVIF, WebP e JPG) das fotos selecionadas e o arquivo de dados da galeria.
// Uso (na pasta do site):  node scripts/build-images.cjs
// Os originais ficam FORA do repositório, em NOVO SITE/Moda/<categoria>/seleção.
// Para trocar/reordenar fotos, edite a lista FOTOS abaixo e rode de novo.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = path.resolve(__dirname, '..', '..', 'Moda');
const OUT = path.resolve(__dirname, '..', 'assets', 'img');
const WIDTHS = [480, 800, 1200, 1600, 2400];

// ordem = ordem em que aparecem no site
const FOTOS = {
  campanha: [
    ['campanha/seleção/_HL_6234-Editar-Editar.jpg', 'arcos-da-lapa-toalha-amarela', 'Modelo com toalha amarela diante dos Arcos da Lapa, no Rio de Janeiro'],
    ['campanha/seleção/_HL_7068-Editar-2.jpg', 'praia-de-ipanema-toalha-laranja', 'Modelo sentada na praia de Ipanema com toalha laranja, com o Morro Dois Irmãos ao fundo'],
    ['campanha/seleção/_HL_6030-Editar-Editar.jpg', 'cristo-redentor-toalha-turquesa', 'Modelo de costas com toalha turquesa diante do Cristo Redentor'],
    ['campanha/seleção/_HL_6098-Editar.jpg', 'pao-de-acucar-maio-branco-toalha-azul', 'Modelo de maiô branco com toalha azul sobre uma pedra, com a Baía de Guanabara e o Pão de Açúcar ao fundo'],
    ['campanha/seleção/_U3A5917-Editar.jpg', 'vestido-verde-balaustrada-rio', 'Modelo de vestido verde diante de uma balaustrada, com barcos e a montanha ao fundo, no Rio de Janeiro'],
    ['campanha/seleção/_OFY7139-Editar.jpg', 'copacabana-palace-estampa-colorida', 'Modelo com saída de praia estampada diante do Copacabana Palace, em Copacabana'],
    ['campanha/seleção/_OFY7062-Editar.jpg', 'faixa-de-pedestres-copacabana-dupla', 'Duas modelos atravessam a faixa de pedestres na orla de Copacabana, com roupas lilás e estampadas'],
    ['campanha/seleção/_OFY6179-Editar.jpg', 'copacabana-palace-duas-modelos-preto', 'Duas modelos de roupas pretas diante do hotel Copacabana Palace'],
    ['campanha/seleção/_OFY7387 (2).jpg', 'copacabana-palace-regata-zebra', 'Modelo de regata zebrada e saia preta, com o Copacabana Palace e um ônibus ao fundo'],
    ['campanha/seleção/portfolio_externa_banabana (15).jpg', 'lancha-copacabana-contraluz', 'Modelo de blusa branca sentada na proa de uma lancha, em contraluz, com Copacabana ao fundo'],
    ['campanha/seleção/_HL_4557-Editar.jpg', 'sofa-na-praia-vestido-branco', 'Modelo de vestido branco recostada em um sofá na areia da praia'],
    ['campanha/seleção/_U3A2680-Editar.JPG', 'calcadao-de-copacabana-camisetas-rosa', 'Três modelos de camiseta rosa caminham no calçadão de Copacabana'],
    ['campanha/seleção/_97A6713.jpg', 'casa-de-pedra-conjunto-vermelho', 'Modelo de conjunto vermelho caminha diante de uma casa de pedra coberta de hera'],
    ['campanha/seleção/24042018-sombra-fresca-mar-de-lotus-outono-inverno-2018-rj-paulohlima (210).jpg', 'entardecer-jaqueta-jeans', 'Modelo de jaqueta jeans sentada em uma pedra ao entardecer, com o céu roxo ao fundo'],
  ],
  lookbook: [
    ['lookbook/selsção/_U3A3480.jpg', 'vestido-longo-branco', 'Modelo de vestido longo branco, em fundo claro de estúdio'],
    ['lookbook/selsção/_HL_7194.jpg', 'vestido-amarelo-tecido-ao-vento', 'Modelo de vestido amarelo com tecido leve ao vento, em fundo branco'],
    ['lookbook/selsção/lookbook estudio rio de janeiro rj para marcas de moda com fundo neutro para catálogo de moda e lojas virtuais (7).jpg', 'saia-cinza-rodada', 'Modelo de saia cinza rodada e blusa preta em movimento, em fundo branco de estúdio'],
    ['lookbook/selsção/lookbook-moda-rio-de-janeiro-rj-fotografo-paulo-h-lima.jpg', 'conjunto-preto-sandalia-oncinha', 'Modelo de conjunto preto e sandália de oncinha, em pose agachada, em fundo branco de estúdio'],
    ['lookbook/selsção/lookbook estudio rio de janeiro rj para marcas de moda com fundo neutro para catálogo de moda e lojas virtuais (9).jpg', 'conjunto-paete-quimono', 'Modelo de conjunto preto de paetê com quimono transparente, em fundo claro de estúdio'],
    ['lookbook/selsção/_HL_4822.jpg', 'vestido-longo-marrom', 'Modelo de vestido longo marrom, em fundo cinza de estúdio'],
    ['lookbook/selsção/DF300323-479.jpg', 'bolsa-verde-gola-alta-preta', 'Modelo de gola alta preta com bolsa verde de couro, em fundo bege'],
    ['lookbook/selsção/_HL_1140.jpg', 'blazer-branco-moodboard', 'Modelo sentada no chão, de blazer branco e calça azul-marinho, com notebook e papéis de moodboard'],
    ['lookbook/selsção/_HL_0871.jpg', 'duas-modelos-camisas', 'Retrato de duas modelos de camisas branca e preta, em fundo bege'],
    ['lookbook/selsção/_U3A5265.jpg', 'sueter-branco-gola-alta', 'Retrato de modelo de suéter branco de gola alta, com sofá bege ao fundo'],
    ['lookbook/selsção/STH030823-031.jpg', 'vestido-rosa-bordado', 'Modelo de vestido rosa bordado, em fundo rosa com luz circular'],
    ['lookbook/selsção/STH030823-523.jpg', 'poltrona-calca-listrada', 'Modelo sentada em poltrona de couro, de blazer preto e calça listrada, em fundo pêssego'],
  ],
};
const PREFIXO = { campanha: 'campanha-moda-rio-de-janeiro', lookbook: 'lookbook-moda-estudio-rio-de-janeiro' };

const run = (args) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('ffmpeg: ' + (r.stderr || '').slice(0, 300));
};
const probe = (f) => {
  const p = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], { encoding: 'utf8' });
  const [w, h] = p.stdout.trim().split(',').map(Number);
  return { w, h };
};
const temP3 = (f) => {
  const b = fs.readFileSync(f), i = b.indexOf('ICC_PROFILE');
  return i >= 0 && /Display P3|ProPhoto|Adobe RGB/.test(b.slice(i, i + 4000).toString('latin1'));
};

const dados = {};
for (const cat of Object.keys(FOTOS)) {
  const dir = path.join(OUT, cat);
  fs.mkdirSync(dir, { recursive: true });
  dados[cat] = [];
  for (const [rel, slug, alt] of FOTOS[cat]) {
    const src = path.join(BASE, rel);
    if (!fs.existsSync(src)) throw new Error('não achei: ' + src);
    const { w, h } = probe(src);
    const nome = `${PREFIXO[cat]}-${slug}`;
    const larguras = [...new Set([...WIDTHS.filter((x) => x < w), Math.min(w, 2400)])].sort((a, b) => a - b);
    const cor = temP3(src) ? 'format=gbrp,zscale=pin=smpte432:tin=iec61966-2-1:p=bt709:t=iec61966-2-1,' : '';
    for (const lw of larguras) {
      const base = path.join(dir, `${nome}-${lw}`);
      const vf = `scale=${lw}:-2:flags=lanczos,${cor}format=yuv420p10le`;
      if (!fs.existsSync(base + '.avif')) run(['-i', src, '-vf', vf, '-c:v', 'libaom-av1', '-crf', '30', '-cpu-used', '6', '-row-mt', '1', '-still-picture', '1', base + '.avif']);
      if (!fs.existsSync(base + '.webp')) run(['-i', src, '-vf', `scale=${lw}:-2:flags=lanczos,${cor}format=yuv420p`, '-c:v', 'libwebp', '-quality', '80', base + '.webp']);
    }
    const jw = Math.min(w, 1600);
    const jpg = path.join(dir, `${nome}-${jw}.jpg`);
    if (!fs.existsSync(jpg)) run(['-i', src, '-vf', `scale=${jw}:-2:flags=lanczos,${cor}format=yuvj420p`, '-q:v', '3', jpg]);
    dados[cat].push({ nome, alt, w, h, larguras, jpg: jw });
    console.log(cat, nome, `${w}x${h}`, larguras.join(','));
  }
}
fs.mkdirSync(path.resolve(__dirname, '..', '_data'), { recursive: true });
fs.writeFileSync(path.resolve(__dirname, '..', '_data', 'fotos.json'), JSON.stringify(dados, null, 1));
console.log('dados gravados em _data/fotos.json');
