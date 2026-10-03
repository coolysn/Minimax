(() => {
"use strict";

/* ------------------------------------------------------------------ *
 *  RULES ENGINE  (pure functions on a compact state)
 *  Cell index = row*3 + col, row 0 = top.
 *  State: { B:[idx...], R:[idx...], t:0|1 }  t=0 blue to move, 1 red.
 *  Blue (0) moves E, N, S  (E off the east edge leaves the board).
 *  Red  (1) moves N, W, E  (N off the north edge leaves the board).
 * ------------------------------------------------------------------ */
const START = (t = 0) => ({ B:[0,3], R:[7,8], t });   // bottom-left corner empty; t = side to move first

function movesFor(S){
  const mine = S.t === 0 ? S.B : S.R;
  const occ = new Set([...S.B, ...S.R]);
  const out = [];
  for (const p of mine){
    const r = (p/3)|0, c = p%3;
    const cand = S.t === 0
      ? [[r,c+1,'E'],[r-1,c,'N'],[r+1,c,'S']]
      : [[r-1,c,'N'],[r,c-1,'W'],[r,c+1,'E']];
    for (const [nr,nc,d] of cand){
      if (S.t === 0 && nc === 3){ out.push({from:p,to:-1,dir:d}); continue; }
      if (S.t === 1 && nr === -1){ out.push({from:p,to:-1,dir:d}); continue; }
      if (nr<0||nr>2||nc<0||nc>2) continue;
      const q = nr*3+nc;
      if (occ.has(q)) continue;
      out.push({from:p,to:q,dir:d});
    }
  }
  return out;
}
function applyMove(S, m){
  const key = S.t === 0 ? 'B' : 'R';
  const list = S[key].filter(x => x !== m.from);
  if (m.to >= 0) list.push(m.to);
  list.sort((a,b)=>a-b);
  const N = { B:S.B, R:S.R, t:1-S.t };
  N[key] = list;
  return { state:N, won: list.length === 0 };
}
const keyOf = S => S.B.join('') + '|' + S.R.join('') + '|' + S.t;

/* ------------------------------------------------------------------ *
 *  SOLVER – retrograde analysis over the full reachable state graph.
 *  val: 'W' / 'L' for the player to move, with distance; missing = draw.
 * ------------------------------------------------------------------ */
const graph = new Map(), val = new Map();
(function solve(){
  const stack = [START(0), START(1)];                       // blue-first and red-first openings
  stack.forEach(s => graph.set(keyOf(s), { S:s, succ:null }));
  while (stack.length){
    const S = stack.pop(), k = keyOf(S), node = graph.get(k);
    node.succ = [];
    for (const m of movesFor(S)){
      const res = applyMove(S, m);
      if (res.won){ node.succ.push({m, key:null}); continue; }
      const nk = keyOf(res.state);
      node.succ.push({m, key:nk});
      if (!graph.has(nk)){ graph.set(nk, { S:res.state, succ:null }); stack.push(res.state); }
    }
  }
  let round = 0, changed = true;
  while (changed){
    round++;
    const fresh = [];
    for (const [k,node] of graph){
      if (val.has(k)) continue;
      if (node.succ.length === 0){ fresh.push([k,'L']); continue; }   // no legal move = loss
      let anyL = false, allW = true;
      for (const s of node.succ){
        if (s.key === null){ anyL = true; break; }                    // moving last car off = win
        const v = val.get(s.key);
        if (v && v.r === 'L'){ anyL = true; break; }
        if (!(v && v.r === 'W')) allW = false;
      }
      if (anyL) fresh.push([k,'W']); else if (allW) fresh.push([k,'L']);
    }
    for (const [k,r] of fresh) val.set(k,{r,d:round});
    changed = fresh.length > 0;
  }
})();

function scoreMove(S, m){
  const res = applyMove(S, m);
  if (res.won) return 1000;
  const v = val.get(keyOf(res.state));
  if (!v) return 0;                            // draw by endless play
  return v.r === 'L' ? 1000 - v.d : -1000 + v.d;
}
function bestMoves(S){
  const ms = movesFor(S);
  let best = -Infinity, pick = [];
  for (const m of ms){
    const s = scoreMove(S, m);
    if (s > best){ best = s; pick = [m]; } else if (s === best) pick.push(m);
  }
  return pick;
}
const rnd = a => a[(Math.random()*a.length)|0];
function aiChoose(S, level){
  const ms = movesFor(S);
  const good = level === 2 ? 1 : 0.7;   // CHAMP: 0% random moves, DRIVER: 30% random moves
  if (Math.random() < good) return rnd(bestMoves(S));
  return rnd(ms);
}

/* ------------------------------------------------------------------ *
 *  SPRITE
 * ------------------------------------------------------------------ */
const SPRITE = [
  "..tt...tt..",
  ".########h.",
  "##ssswwww##",
  "##ssswwww##",
  ".########h.",
  "..tt...tt.."
];
const CMAP = { '#':'b', 's':'s', 'w':'w', 't':'t', 'h':'h' };
function carSVG(cls){
  let r = '';
  SPRITE.forEach((row,y)=>{ [...row].forEach((ch,x)=>{ if (CMAP[ch]) r += `<rect class="${CMAP[ch]}" x="${x}" y="${y}" width="1.02" height="1.02"/>`; }); });
  return `<svg ${cls?`class="${cls}"`:''} viewBox="0 0 11 6" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
// 'ss' stripe sits behind the windows on the body of the car
document.querySelector('.strip').innerHTML = carSVG('a cb') + carSVG('b cr');

/* ------------------------------------------------------------------ *
 *  UI / GAME CONTROLLER
 * ------------------------------------------------------------------ */
const $ = s => document.querySelector(s);
const boardEl = $('#board'), statusEl = $('#status');
const human = 0;                 // the player always drives blue; the CPU always drives red
let diff = 2, first = 0;         // first: 0 = player moves first, 1 = CPU moves first
let S, cars, cellEls, topExit, rightExit, selected = null, busy = false, over = false, hintOn = false;
let history = {}, aiTimer = null, gameId = 0;

/* audio */
let actx = null, sound = true;
function beep(freq, dur, type='square', vol=.05, delay=0){
  if (!sound) return;
  try{
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur);
  }catch(e){}
}
const sfx = {
  select(){ beep(660,.06) },
  move(){ beep(180,.08,'square',.06); beep(240,.08,'square',.05,.07) },
  exit(){ beep(523,.08); beep(784,.12,'square',.05,.08) },
  bad(){ beep(110,.15,'sawtooth',.05) },
  win(){ [523,659,784,1047].forEach((f,i)=>beep(f,.16,'square',.06,i*.14)) },
  lose(){ [392,330,262,196].forEach((f,i)=>beep(f,.2,'sawtooth',.05,i*.18)) },
  draw(){ beep(330,.2); beep(330,.2,'square',.05,.25) }
};

/* build board DOM once per game */
function buildBoard(){
  boardEl.innerHTML = '';
  cellEls = []; topExit = []; rightExit = [];
  // top exit row (red leaves here)
  for (let c=0;c<3;c++){
    const e = document.createElement('div');
    e.className = 'exit er'; e.style.gridColumn = c+1; e.style.gridRow = 1;
    e.innerHTML = '<i>&#9650;</i>'; e.dataset.arrow = '\u25B2';
    boardEl.appendChild(e); topExit.push(e);
  }
  const corner = document.createElement('div');
  corner.className = 'corner'; corner.style.gridColumn = 4; corner.style.gridRow = 1;
  corner.innerHTML = 'EXIT<br>ZONE';
  boardEl.appendChild(corner);
  for (let r=0;r<3;r++){
    for (let c=0;c<3;c++){
      const e = document.createElement('div');
      e.className = 'cell' + ((r+c)%2 ? ' alt' : '');
      e.style.gridColumn = c+1; e.style.gridRow = r+2;
      boardEl.appendChild(e); cellEls[r*3+c] = e;
    }
    const x = document.createElement('div');
    x.className = 'exit eb'; x.style.gridColumn = 4; x.style.gridRow = r+2;
    x.innerHTML = '<i>&#9654;</i>'; x.dataset.arrow = '\u25B6';
    boardEl.appendChild(x); rightExit.push(x);
  }
  // cars
  cars = [];
  const defs = [['blue',0,0],['blue',0,3],['red',1,7],['red',1,8]];
  defs.forEach(([cls,owner,pos],i)=>{
    const el = document.createElement('button');
    el.className = 'car ' + cls; el.type = 'button';
    el.setAttribute('aria-label', cls + ' car');
    el.innerHTML = carSVG('');
    boardEl.appendChild(el);
    const car = { id:i, owner, pos, off:false, el };
    el.addEventListener('click', ()=>onCarClick(car));
    cars.push(car);
    placeCar(car);
  });
  // click handling for squares/exits
  cellEls.forEach((e,i)=> e.addEventListener('click', ()=>onSquare(i)));
  rightExit.forEach((e,r)=> e.addEventListener('click', ()=>onExit(0, r)));
  topExit.forEach((e,c)=> e.addEventListener('click', ()=>onExit(1, c)));
}

function gridOf(car, exiting){
  const r = (car.pos/3)|0, c = car.pos%3;
  if (exiting) return car.owner === 0 ? [3, r+1] : [c, 0];
  return [c, r+1];
}
function placeCar(car, exiting=false){
  const [gx,gy] = gridOf(car, exiting);
  car.el.style.setProperty('--gx', gx);
  car.el.style.setProperty('--gy', gy);
}

/* state helpers */
function stateFromCars(turn){
  const B = cars.filter(c=>c.owner===0&&!c.off).map(c=>c.pos).sort((a,b)=>a-b);
  const R = cars.filter(c=>c.owner===1&&!c.off).map(c=>c.pos).sort((a,b)=>a-b);
  return { B, R, t:turn };
}
const carAt = (owner,pos) => cars.find(c=>c.owner===owner && !c.off && c.pos===pos);

/* rendering */
function clearTargets(){
  document.querySelectorAll('.target,.hintt').forEach(e=>{
    e.classList.remove('target','hintt'); e.removeAttribute('data-arrow');
  });
}
const ARROW = { N:'\u25B2', S:'\u25BC', E:'\u25B6', W:'\u25C0' };
function refreshHighlights(hintMove){
  clearTargets();
  cars.forEach(c=>c.el.classList.remove('sel','hint','movable','mine'));
  if (over) return;
  const myTurn = S.t === human && !busy;
  cars.forEach(c=>{
    if (c.owner === human && !c.off) c.el.classList.add('mine');
  });
  if (!myTurn) return;
  const ms = movesFor(S);
  cars.forEach(c=>{
    if (c.owner===human && !c.off && ms.some(m=>m.from===c.pos)) c.el.classList.add('movable');
  });
  if (hintMove){
    const hc = carAt(human, hintMove.from);
    if (hc) hc.el.classList.add('hint');
  }
  if (selected){
    selected.el.classList.add('sel');
    let sm = ms.filter(m=>m.from===selected.pos);
    if (hintMove && hintMove.from===selected.pos) sm = sm.filter(m=>m.to===hintMove.to);   // hint: show only the best move
    sm.forEach(m=>{
      const el = targetEl(m);
      el.classList.add('target'); el.dataset.arrow = ARROW[m.dir];
      if (hintMove && hintMove.from===m.from && hintMove.to===m.to) el.classList.add('hintt');
    });
  }
}
function targetEl(m){
  if (m.to >= 0) return cellEls[m.to];
  const r = (m.from/3)|0, c = m.from%3;
  return S.t === 0 ? rightExit[r] : topExit[c];
}

function updateScore(){
  [['#pBlue',0,'BLUE'],['#pRed',1,'RED']].forEach(([sel,owner])=>{
    const p = $(sel);
    const mine = cars.filter(c=>c.owner===owner);
    const homeCount = mine.filter(c=>c.off).length;
    p.querySelector('.who span').textContent = (owner===human ? 'YOU' : 'CPU');
    p.querySelector('.home').innerHTML =
      mine.map(c=>carSVG(c.off?'done':'')).join('') + `<span>HOME ${homeCount}/2</span>`;
    p.classList.toggle('turn', !over && S.t === owner);
  });
}
function setStatus(main, sub=''){
  statusEl.innerHTML = main + (sub ? `<small>${sub}</small>` : '');
}

/* game flow */
function newGame(){
  gameId++;
  clearTimeout(aiTimer);
  S = START(first); selected = null; busy = false; over = false; hintOn = false;
  history = {}; history[keyOf(S)] = 1;
  buildBoard();
  const ov = $('#over'); if (ov) ov.remove();
  beginTurn();
}

function beginTurn(){
  updateScore();
  const ms = movesFor(S);
  if (ms.length === 0){
    // Rule: a player with no legal moves loses.
    const loser = S.t;
    finish(1 - loser, loser === human ? 'YOU HAVE NO LEGAL MOVE' : 'CPU HAS NO LEGAL MOVE');
    return;
  }
  if (S.t === human){
    busy = false;
    setStatus('YOUR TURN', 'TAP ONE OF YOUR CARS, THEN A FLASHING SQUARE');
    refreshHighlights();
  } else {
    busy = true;
    setStatus('CPU THINKING...', '');
    refreshHighlights();
    const id = gameId;
    aiTimer = setTimeout(()=>{
      if (id !== gameId) return;
      doMove(aiChoose(S, diff));
    }, 650 + Math.random()*350);
  }
}

function doMove(m){
  const owner = S.t;
  const car = carAt(owner, m.from);
  if (!car) return;
  busy = true; selected = null; hintOn = false;
  clearTargets();
  const exiting = m.to < 0;
  const res = applyMove(S, m);
  if (exiting){
    placeCar(car, true);
    car.off = true;
    sfx.exit();
    setTimeout(()=>car.el.classList.add('gone'), 330);
  } else {
    car.pos = m.to; placeCar(car); sfx.move();
  }
  S = res.state;
  refreshHighlights();
  const id = gameId;
  if (res.won){
    updateScore();
    setTimeout(()=>{ if (id===gameId) finish(owner, 'BOTH CARS ARE HOME'); }, 650);
    return;
  }
  const k = keyOf(S);
  history[k] = (history[k]||0) + 1;
  if (history[k] >= 3){
    updateScore();
    setTimeout(()=>{ if (id===gameId) finish(-1, 'SAME POSITION 3 TIMES'); }, 450);
    return;
  }
  setTimeout(()=>{ if (id===gameId) beginTurn(); }, 380);
}

function finish(winner, reason){
  over = true; busy = true; selected = null;
  clearTimeout(aiTimer);
  refreshHighlights(); updateScore();
  let title, cls;
  if (winner === -1){ title = 'DRAW'; sfx.draw(); }
  else if (winner === human){ title = 'YOU WIN!'; sfx.win(); }
  else { title = 'CPU WINS'; sfx.lose(); }
  setStatus(title, reason);
  const ov = document.createElement('div');
  ov.id = 'over';
  ov.style.gridColumn = '1 / 5'; ov.style.gridRow = '1 / 5';
  ov.innerHTML = `<h2>${title}</h2><p>${reason}</p>
    <div class="row"><button class="opt" id="againBtn">PLAY AGAIN</button><button class="opt" id="ovMenu">MENU</button></div>`;
  boardEl.appendChild(ov);
  $('#againBtn').addEventListener('click', newGame);
  $('#ovMenu').addEventListener('click', toMenu);
  $('#againBtn').focus();
}

/* input */
function canAct(){ return !over && !busy && S.t === human; }
function onCarClick(car){
  if (!canAct() || car.owner !== human || car.off) return;
  const ms = movesFor(S).filter(m=>m.from===car.pos);
  if (!ms.length){
    sfx.bad(); car.el.classList.add('shake');
    setTimeout(()=>car.el.classList.remove('shake'), 260);
    setStatus('THAT CAR IS BLOCKED', 'PICK ANOTHER CAR');
    return;
  }
  if (selected === car) hintOn = false;   // deselecting the hinted car turns the hint off
  selected = (selected === car) ? null : car;
  sfx.select();
  refreshHighlights(hintOn ? bestMoves(S)[0] : null);
  setStatus('YOUR TURN', selected ? 'TAP A FLASHING SQUARE TO DRIVE' : 'TAP ONE OF YOUR CARS, THEN A FLASHING SQUARE');
}
function onSquare(i){
  if (!canAct() || !selected) return;
  if (!cellEls[i].classList.contains('target')) return;   // only highlighted squares can be chosen
  const m = movesFor(S).find(m=>m.from===selected.pos && m.to===i);
  if (m) doMove(m);
}
function onExit(owner, idx){
  if (!canAct() || !selected || owner !== human) return;
  const exitEl = owner === 0 ? rightExit[idx] : topExit[idx];
  if (!exitEl.classList.contains('target')) return;   // only highlighted exits can be chosen
  const m = movesFor(S).find(m=>m.from===selected.pos && m.to===-1);
  if (!m) return;
  // make sure they clicked the exit that matches the car's row/col
  const r = (m.from/3)|0, c = m.from%3;
  if ((human===0 && idx===r) || (human===1 && idx===c)) doMove(m);
}
document.addEventListener('keydown', e=>{
  if (!$('#rules').classList.contains('hidden')){ if (e.key==='Escape') closeRules(); return; }
  if ($('#game').classList.contains('hidden')) return;
  const map = { ArrowRight:'E', ArrowLeft:'W', ArrowUp:'N', ArrowDown:'S' };
  const d = map[e.key];
  if (!d || !canAct()) return;
  e.preventDefault();
  const ms = movesFor(S).filter(m=>m.dir===d);
  let m = null;
  if (selected) m = ms.find(x=>x.from===selected.pos);
  if (!m && ms.length === 1) m = ms[0];
  if (m) doMove(m);
  else if (ms.length > 1){ setStatus('SELECT A CAR FIRST', 'MORE THAN ONE CAR CAN GO THAT WAY'); sfx.bad(); }
  else sfx.bad();
});

/* buttons */
$('#hintBtn').addEventListener('click', ()=>{
  if (!canAct()) return;
  const m = bestMoves(S)[0];
  hintOn = true;
  selected = carAt(human, m.from);
  refreshHighlights(m);
  sfx.select();
  setStatus('HINT', 'THE WHITE-OUTLINED CAR AND SQUARE ARE THE BEST MOVE');
});
$('#restartBtn').addEventListener('click', newGame);
$('#menuBtn').addEventListener('click', toMenu);
$('#sndBtn').addEventListener('click', e=>{
  sound = !sound; e.currentTarget.textContent = sound ? 'SOUND ON' : 'SOUND OFF';
  if (sound) sfx.select();
});
function openRules(){
  $('#rules').classList.remove('hidden');
  $('#rulesClose').focus({ preventScroll:true });
  $('#rules .box').scrollTop = 0;
}
function closeRules(){ $('#rules').classList.add('hidden'); }
$('#rulesBtn').addEventListener('click', openRules);
$('#rulesBtn2').addEventListener('click', openRules);
$('#rulesClose').addEventListener('click', closeRules);
$('#rules').addEventListener('click', e=>{ if (e.target.id==='rules') closeRules(); });

function toMenu(){
  gameId++; clearTimeout(aiTimer);
  $('#game').classList.add('hidden'); $('#menu').classList.remove('hidden');
}
function toGame(){
  $('#menu').classList.add('hidden'); $('#game').classList.remove('hidden');
  newGame();
}
function bindGroup(sel, setter){
  const btns = [...document.querySelectorAll(sel + ' .opt')];
  btns.forEach(b=>b.addEventListener('click', ()=>{
    btns.forEach(x=>x.setAttribute('aria-pressed', x===b ? 'true' : 'false'));
    setter(+b.dataset.v); sfx.select();
  }));
}
const DIFF_TEXT = {
  1: 'DRIVER: THE CPU PLAYS THE BEST MOVE ON 7 OUT OF 10 TURNS AND A RANDOM LEGAL MOVE ON 3 OUT OF 10 (30% RANDOM).',
  2: 'CHAMP: THE CPU ALWAYS PLAYS THE BEST MOVE (0% RANDOM).'
};
function showDiffText(){ $('#diffDesc').textContent = DIFF_TEXT[diff]; }
bindGroup('#diffOpts', v=>{ diff = v; showDiffText(); });
bindGroup('#sideOpts', v=>first=v);
showDiffText();
$('#startBtn').addEventListener('click', toGame);
})();