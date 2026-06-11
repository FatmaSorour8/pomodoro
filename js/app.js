const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const todayKey=()=>new Date().toISOString().slice(0,10);
const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const sessionInfo={study:['Study','Deep focus for learning and revision.'],work:['Work','Plan, execute, and finish your tasks.'],reading:['Reading','Quiet reading sessions with clear breaks.'],coding:['Coding','Build features with distraction-free focus.']};
let settings=JSON.parse(localStorage.getItem('ff_settings'))||{focus:25,break:5,cycles:4,longBreak:15};
let stats=JSON.parse(localStorage.getItem('ff_stats'))||{};
let currentSession='study',mode='focus',cycle=1,total=settings.focus*60,remaining=total,timer=null,running=false;
const circle=$('#progressCircle'),circ=2*Math.PI*122; circle.style.strokeDasharray=circ;
function saveSettings(){localStorage.setItem('ff_settings',JSON.stringify(settings))}
function saveStats(){localStorage.setItem('ff_stats',JSON.stringify(stats))}
function dayStats(){const k=todayKey();stats[k]=stats[k]||{sessions:0,minutes:0,cycles:0,best:0};return stats[k]}
function fmt(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function updateUI(){ $('#timeDisplay').textContent=fmt(remaining); $('#modeLabel').textContent=mode==='focus'?'Focus':'Break'; $('#cycleDisplay').textContent=`Cycle ${cycle} of ${settings.cycles}`; const progress=1-(remaining/total); circle.style.strokeDashoffset=circ-(progress*circ); $('#sessionName').textContent=sessionInfo[currentSession][0]; $('#sessionDesc').textContent=sessionInfo[currentSession][1]; renderStats(); renderBadges(); }
function resetTimer(){clearInterval(timer);running=false;mode='focus';cycle=1;total=settings.focus*60;remaining=total;$('#startBtn').textContent='Start';updateUI()}
function startTimer(){if(running)return;running=true;$('#startBtn').textContent='Running';timer=setInterval(()=>{remaining--;updateUI();if(remaining<=0)completePhase()},1000)}
function pauseTimer(){running=false;clearInterval(timer);$('#startBtn').textContent='Resume'}
function completePhase(){clearInterval(timer);running=false;beep();notify(mode==='focus'?'Focus session completed!':'Break finished!'); if(mode==='focus'){let d=dayStats();d.sessions++;d.minutes+=settings.focus;d.best=Math.max(d.best,settings.focus); mode='break';total=(cycle===settings.cycles?settings.longBreak:settings.break)*60;remaining=total;}else{let d=dayStats();d.cycles++; if(cycle>=settings.cycles){cycle=1;mode='focus';}else{cycle++;mode='focus'} total=settings.focus*60;remaining=total;} saveStats();updateUI();startTimer();}
function beep(){const a=$('#alarmSound');a.currentTime=0;a.play().catch(()=>{})}
function notify(msg){if(Notification.permission==='granted')new Notification('FocusFlow',{body:msg})}
function renderStats(){const d=dayStats();$('#statSessions').textContent=d.sessions;$('#statMinutes').textContent=d.minutes;$('#statCycles').textContent=d.cycles;$('#statBest').textContent=d.best+'m';$('#streakCount').textContent=calcStreak();renderChart()}
function calcStreak(){let count=0,dt=new Date();for(let i=0;i<30;i++){let k=dt.toISOString().slice(0,10);if(stats[k]?.sessions>0){count++;dt.setDate(dt.getDate()-1)}else break}return count}
function renderChart(){const el=$('#weeklyChart');el.innerHTML='';let max=1,items=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=d.toISOString().slice(0,10),m=stats[k]?.minutes||0;max=Math.max(max,m);items.push([days[d.getDay()],m])}items.forEach(([name,m])=>{el.innerHTML+=`<div class="bar-wrap"><div class="bar" style="height:${Math.max(8,(m/max)*170)}px"></div><strong>${m}m</strong><span>${name}</span></div>`})}
function renderBadges(){const d=dayStats(),badges=[];if(d.sessions>=1)badges.push('First Focus');if(d.sessions>=4)badges.push('Deep Worker');if(d.minutes>=120)badges.push('2H Focus');if(calcStreak()>=3)badges.push('3-Day Streak');$('#badges').innerHTML=badges.length?badges.map(b=>`<span class="badge">🏆 ${b}</span>`).join(''):'<p>Complete sessions to unlock badges.</p>'}
$$('.nav-item').forEach(b=>b.onclick=()=>{$$('.nav-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.panel').forEach(p=>p.classList.remove('active-panel'));$('#'+b.dataset.panel).classList.add('active-panel')});
$$('.session-tab').forEach(b=>b.onclick=()=>{$$('.session-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentSession=b.dataset.session;updateUI()});
$('#startBtn').onclick=startTimer;$('#pauseBtn').onclick=pauseTimer;$('#resetBtn').onclick=resetTimer;
$('#notifyBtn').onclick=()=>Notification.requestPermission();
$('#themeToggle').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('ff_theme',document.body.classList.contains('dark')?'dark':'light');$('#themeToggle').textContent=document.body.classList.contains('dark')?'☀ Light':'🌙 Dark'};
$('#settingsForm').onsubmit=e=>{e.preventDefault();settings={focus:+$('#focusInput').value,break:+$('#breakInput').value,cycles:+$('#cyclesInput').value,longBreak:+$('#longBreakInput').value};saveSettings();resetTimer()};
$('#clearStats').onclick=()=>{if(confirm('Clear all statistics?')){stats={};saveStats();renderStats()}};
function init(){if(localStorage.getItem('ff_theme')==='dark')document.body.classList.add('dark');$('#themeToggle').textContent=document.body.classList.contains('dark')?'☀ Light':'🌙 Dark';$('#focusInput').value=settings.focus;$('#breakInput').value=settings.break;$('#cyclesInput').value=settings.cycles;$('#longBreakInput').value=settings.longBreak;resetTimer()}init();
