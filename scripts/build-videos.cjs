// Comprime os fashion films para a web (H.264, início rápido), gera a capa de cada um e o arquivo de dados.
// Uso (na pasta do site):  node scripts/build-videos.cjs
// Os originais ficam FORA do repositório, em NOVO SITE/Moda/FASHION FILM/seleção.
// Para trocar/reordenar filmes ou corrigir títulos, edite a lista FILMES abaixo e rode de novo.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = path.resolve(__dirname, '..', '..', 'Moda', 'FASHION FILM', 'seleção');
const OUT = path.resolve(__dirname, '..', 'assets', 'video');

// ordem = ordem em que aparecem no site. [arquivo, slug, título, marca, estação]
const FILMES = [
  ['YOUTUBE_ZINZANE_FASHION_FILM_10_out.mp4', 'zinzane-fashion-film', 'Fashion Film', 'Zinzane', ''],
  ['ALMA COLORIDA - FF ATLANTICA.mp4', 'atlantica-alma-colorida', 'Alma Colorida', 'Toalhas Atlântica', 'Verão 2025'],
  ['OH BEACH - 01.mp4', 'oh-beach-verao-2025', 'Oh Beach', 'Oh Beach', 'Verão 2025'],
  ['VERTICAL - FLORESTRA  - 05 v2.mp4', 'zinzane-travellers-floresta', 'Travellers · Floresta', 'Zinzane', 'Inverno 2023'],
  ['VERTICAL - METRÔ - 20.mp4', 'zinzane-travellers-metro', 'Travellers · Metrô', 'Zinzane', 'Inverno 2023'],
  ['REELS_MLOURES_CAP_ABRAÇO.mp4', 'mloures-abraco', 'Abraço', 'MLoures', ''],
  ['REELS_ZINZANE_04.mp4', 'zinzane-reels-04', 'Reels 04', 'Zinzane', ''],
  ['ZINZANE_REELS_07.mp4', 'zinzane-reels-07', 'Reels 07', 'Zinzane', ''],
];

const sh = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(cmd + ': ' + (r.stderr || '').slice(-400));
  return r.stdout;
};
fs.mkdirSync(OUT, { recursive: true });
const dados = [];
for (const [arq, slug, titulo, marca, estacao] of FILMES) {
  const src = path.join(BASE, arq);
  if (!fs.existsSync(src)) throw new Error('não achei: ' + src);
  const info = JSON.parse(sh('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', src]));
  const w = info.streams[0].width, h = info.streams[0].height, dur = Math.round(+info.format.duration);
  const mp4 = path.join(OUT, slug + '.mp4'), poster = path.join(OUT, slug + '.webp');
  if (!fs.existsSync(mp4)) {
    console.log('comprimindo', slug, `${w}x${h}`, dur + 's');
    sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
      '-maxrate', '4500k', '-bufsize', '9000k', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', mp4]);
  }
  if (!fs.existsSync(poster)) {
    // quadro de cena a 25% do filme (evita o cartão de título do início)
    sh('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(1, Math.round(dur * 0.25))), '-i', mp4, '-vf', `thumbnail=90,scale=${w > h ? 1280 : 720}:-2`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '82', poster]);
  }
  const mb = +(fs.statSync(mp4).size / 1048576).toFixed(1);
  dados.push({ slug, titulo, marca, estacao, w, h, dur, mb, vertical: h > w });
  console.log(slug, mb + 'MB');
}
fs.mkdirSync(path.resolve(__dirname, '..', '_data'), { recursive: true });
fs.writeFileSync(path.resolve(__dirname, '..', '_data', 'filmes.json'), JSON.stringify(dados, null, 1));
console.log('total', dados.reduce((a, x) => a + x.mb, 0).toFixed(0) + 'MB; dados em _data/filmes.json');
