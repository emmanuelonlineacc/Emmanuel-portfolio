const dialog=document.querySelector('#project-dialog');dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});document.querySelector('#year').textContent=new Date().getFullYear();
// Keep motion optional and respect the visitor's system preference.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton=document.createElement('button');
motionButton.className='motion-control';motionButton.type='button';
let motionPaused=reducedMotion.matches;
function applyMotion(){document.body.classList.toggle('motion-paused',motionPaused);motionButton.textContent=motionPaused?'Enable motion':'Pause motion';motionButton.setAttribute('aria-pressed',String(motionPaused));}
motionButton.addEventListener('click',()=>{motionPaused=!motionPaused;applyMotion();});
document.querySelector('footer').append(motionButton);applyMotion();
reducedMotion.addEventListener('change',event=>{motionPaused=event.matches;applyMotion();});
const revealElements=document.querySelectorAll('.intro,.focus-list>div,.project-row,.contact-top,.contact h2');
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.12});revealElements.forEach(element=>{element.classList.add('reveal');observer.observe(element);});}
const progress=document.querySelector('.scroll-progress');
let scrollQueued=false;
function updateProgress(){const range=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${range>0?window.scrollY/range:0})`;scrollQueued=false;}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
document.querySelector('#project-details').addEventListener('click',()=>dialog.showModal());

// Intro is progressive enhancement: the page remains visible without JavaScript.
const loader=document.querySelector('.page-loader');
let introTimer;
function finishIntro(){loader.classList.add('finished');clearTimeout(introTimer);setTimeout(()=>loader.remove(),650);}
if(!reducedMotion.matches){loader.classList.add('active');introTimer=setTimeout(finishIntro,1400);document.querySelector('#skip-intro').addEventListener('click',finishIntro);}else{loader.remove();}

// A luminous, snake-like pointer trail follows the mouse without intercepting clicks.
const pointerFine=window.matchMedia('(hover: hover) and (pointer: fine)');
const snakeCanvas=document.createElement('canvas');snakeCanvas.className='snake-canvas';snakeCanvas.setAttribute('aria-hidden','true');document.body.append(snakeCanvas);
const snakeContext=snakeCanvas.getContext('2d');
const snakePoints=Array.from({length:30},()=>({x:0,y:0}));
let pointerX=0,pointerY=0,snakeVisible=false,snakeFrame=0,lastPointer=0;
function resizeSnake(){const ratio=Math.min(window.devicePixelRatio||1,2);snakeCanvas.width=window.innerWidth*ratio;snakeCanvas.height=window.innerHeight*ratio;snakeContext?.setTransform(ratio,0,0,ratio,0,0);}
function clearSnake(){snakeContext?.clearRect(0,0,window.innerWidth,window.innerHeight);}
function drawSnake(now){snakeFrame=0;if(!snakeContext||motionPaused||reducedMotion.matches||!pointerFine.matches||document.hidden){clearSnake();return;}clearSnake();if(!snakeVisible)return;
 snakePoints.forEach((point,index)=>{const target=index===0?{x:pointerX,y:pointerY}:snakePoints[index-1];point.x+=(target.x-point.x)*.36;point.y+=(target.y-point.y)*.36;});
 const fade=Math.max(0,1-(now-lastPointer-180)/1000);
 for(let i=snakePoints.length-1;i>0;i--){snakeContext.beginPath();snakeContext.moveTo(snakePoints[i].x,snakePoints[i].y);snakeContext.lineTo(snakePoints[i-1].x,snakePoints[i-1].y);snakeContext.strokeStyle=`rgba(${i<15?'255,197,43':'255,36,61'},${(1-i/30)*.8*fade})`;snakeContext.lineWidth=(1-i/30)*5+.5;snakeContext.lineCap='round';snakeContext.shadowBlur=12;snakeContext.shadowColor='#ffc52b';snakeContext.stroke();}
 if(fade>0){snakeFrame=requestAnimationFrame(drawSnake);}else{snakeVisible=false;clearSnake();}}
window.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||motionPaused||reducedMotion.matches||!pointerFine.matches)return;pointerX=event.clientX;pointerY=event.clientY;lastPointer=performance.now();if(!snakeVisible){snakePoints.forEach(point=>{point.x=pointerX;point.y=pointerY;});snakeVisible=true;}if(!snakeFrame)snakeFrame=requestAnimationFrame(drawSnake);},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{snakeVisible=false;clearSnake();});window.addEventListener('resize',resizeSnake);resizeSnake();
motionButton.addEventListener('click',()=>{if(motionPaused){cancelAnimationFrame(snakeFrame);snakeFrame=0;snakeVisible=false;clearSnake();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(snakeFrame);snakeFrame=0;snakeVisible=false;clearSnake();}});
// Shallow perspective gives project previews a physical response to the pointer.
document.querySelectorAll('.project-image,.project-visual').forEach(card=>{card.addEventListener('pointermove',event=>{if(motionPaused||reducedMotion.matches||!pointerFine.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',`${-(event.clientY-r.top-r.height/2)/r.height*7}deg`);card.style.setProperty('--tilt-y',`${(event.clientX-r.left-r.width/2)/r.width*7}deg`);});card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});});

// Pause media when it leaves the screen; playback stays under visitor control.
if("IntersectionObserver" in window){const mediaObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)entry.target.pause();});},{threshold:0});document.querySelectorAll("video").forEach(video=>mediaObserver.observe(video));}
document.addEventListener("visibilitychange",()=>{if(document.hidden)document.querySelectorAll("video").forEach(video=>video.pause());});

const themeToggle=document.querySelector('#theme-toggle');
const systemLight=window.matchMedia('(prefers-color-scheme: light)');
let explicitTheme=false;try{explicitTheme=['light','dark'].includes(localStorage.getItem('portfolio-theme'));}catch(e){}
function setTheme(theme,remember=false){document.documentElement.dataset.theme=theme;const light=theme==='light';themeToggle.textContent=light?'Dark mode':'Light mode';themeToggle.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');themeToggle.setAttribute('aria-pressed',String(light));document.querySelector('meta[name="theme-color"]').content=light?'#fffaf3':'#090909';if(remember){explicitTheme=true;try{localStorage.setItem('portfolio-theme',theme);}catch(e){}}}
setTheme(document.documentElement.dataset.theme||'dark');
themeToggle.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light',true));
systemLight.addEventListener('change',event=>{if(!explicitTheme)setTheme(event.matches?'light':'dark');});

// Keep the soundtrack and project videos from playing over each other.
const portfolioMedia=document.querySelectorAll("audio,video");portfolioMedia.forEach(media=>media.addEventListener("play",()=>{portfolioMedia.forEach(other=>{if(other!==media)other.pause();});}));document.addEventListener("visibilitychange",()=>{if(document.hidden)document.querySelectorAll("audio").forEach(audio=>audio.pause());});
