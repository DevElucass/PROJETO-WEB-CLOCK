// --- helper: cria marcas do mostrador ---
(function createMarks(){
  const marks = document.getElementById('marks');
  for(let i=0;i<60;i++){
    const el = document.createElement('div');
    el.className = 'mark'+(i%5===0? ' big':'');
    el.style.transform = `rotate(${i*6}deg) translate(-50%, 0)`;
    marks.appendChild(el);
  }
})();

// elementos
const hour = document.getElementById('hour');
const minute = document.getElementById('minute');
const second = document.getElementById('second');
const digital = document.getElementById('digital');
const dateEl = document.getElementById('date');
const tzSelect = document.getElementById('tz');
const format24 = document.getElementById('format');
const themeBtn = document.getElementById('themeBtn');
const showSec = document.getElementById('showSec');

// popula fusos horários úteis (lista curta para simplicidade)
const commonZones = [
  'UTC',
  'America/Sao_Paulo',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
];

function populateTZ(){
  commonZones.forEach(z=>{
    const opt = document.createElement('option');
    opt.value = z;
    opt.textContent = z.replace('_',' ');
    tzSelect.appendChild(opt);
  });
  // tenta selecionar o fuso do navegador
  try{
    const guessed = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(Array.from(tzSelect.options).some(o=>o.value===guessed)) tzSelect.value = guessed;
  }catch(e){}
}
populateTZ();

// alterna tema simples
let dark=true;
themeBtn.addEventListener('click', ()=>{
  dark=!dark;
  if(!dark){
    document.documentElement.style.setProperty('--bg','#f5f7fb');
    document.documentElement.style.setProperty('--card','#ffffff');
    document.documentElement.style.setProperty('--accent','#0b6efd');
    document.documentElement.style.setProperty('--muted','#46505b');
    document.documentElement.style.setProperty('--white','#0b1724');
  }else{
    document.documentElement.style.setProperty('--bg','#0f1724');
    document.documentElement.style.setProperty('--card','#0b1220');
    document.documentElement.style.setProperty('--accent','#4f46e5');
    document.documentElement.style.setProperty('--muted','#9aa4b2');
    document.documentElement.style.setProperty('--white','#e6eef8');
  }
});

// atualiza relógio
function updateClock(){
  const tz = tzSelect.value || undefined;
  const now = tz ? new Date(new Date().toLocaleString('en-US',{timeZone:tz})) : new Date();

  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours();

  // analógico
  const secDeg = s*6; // 360/60
  const minDeg = m*6 + s*0.1; // acrescenta movimento suave
  const hourDeg = (h%12)*30 + m*0.5; // 360/12 = 30
  second.style.transform = `rotate(${secDeg}deg)`;
  minute.style.transform = `rotate(${minDeg}deg)`;
  hour.style.transform = `rotate(${hourDeg}deg)`;

  // esconder segundos analógico se desmarcado
  second.style.display = showSec.checked ? 'block' : 'none';

  // digital
  const use24 = format24.checked;
  const hh = use24 ? String(h).padStart(2,'0') : String(((h+11)%12)+1).padStart(2,'0');
  const ampm = use24 ? '' : (h>=12? ' PM':' AM');
  digital.textContent = `${hh}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}${ampm}`;

  // data
  try{
    const dateStr = new Intl.DateTimeFormat(undefined, {weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone: tz|| undefined}).format(now);
    dateEl.textContent = capitalize(dateStr);
  }catch(e){
    dateEl.textContent = now.toDateString();
  }
}

function capitalize(str){
  return str.replace(/(^|\s)\S/g, l=>l.toUpperCase());
}

// Atualiza a cada 250ms para suavidade
setInterval(updateClock, 250);
updateClock();

// eventos para controles
tzSelect.addEventListener('change', updateClock);
format24.addEventListener('change', updateClock);
showSec.addEventListener('change', updateClock);

// acessibilidade: tecla T alterna tema
document.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='t') themeBtn.click();
});