/* Thiagao Ai - shared behaviour for the sub pages: cursor, menu, dot-matrix type, reveals */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var hdr=$('#hdr');

/* header height + active tab */
function syncHeader(){ document.documentElement.style.setProperty('--header-h',hdr.offsetHeight+'px'); }
$$('.navpill a').forEach(function(a){ if(a.pathname===location.pathname) a.classList.add('on'); });

/* menu (short + narrow screens) */
var toggle=$('#navToggle'), nav=$('#sitenav');
function setMenu(o){ toggle.classList.toggle('open',o); nav.classList.toggle('open',o); toggle.setAttribute('aria-expanded',String(o)); toggle.setAttribute('aria-label',o?'Close menu':'Open menu'); }
function closeMenu(){ if(toggle.classList.contains('open')) setMenu(false); }
toggle.addEventListener('click',function(){ setMenu(!toggle.classList.contains('open')); });
nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',closeMenu); });
window.addEventListener('keydown',function(e){ if(e.key==='Escape') closeMenu(); });
$$('a[href="#"]').forEach(function(a){ a.addEventListener('click',function(e){e.preventDefault()}); });

/* cursor */
var cur=$('#cursor'), cx=-100,cy=-100,tx=-100,ty=-100, seen=false;
window.addEventListener('pointermove',function(e){
  if(e.pointerType==='touch') return;
  tx=e.clientX; ty=e.clientY; if(!seen){seen=true;cx=tx;cy=ty;cur.style.opacity='1';}
  cur.classList.toggle('big',!!(e.target.closest&&e.target.closest('a,button,[data-hover]')));
});
document.addEventListener('mouseleave',function(){cur.style.opacity='0';seen=false;});
(function loop(){ cx+=(tx-cx)*.22; cy+=(ty-cy)*.22; cur.style.transform='translate('+cx+'px,'+cy+'px)'; requestAnimationFrame(loop); })();

/* dot-matrix word split */
$$('.rv').forEach(function(rv){
  var txt=rv.textContent, dot=rv.dataset.dot==='1'; rv.textContent='';
  txt.split(' ').forEach(function(w,i,arr){
    var s=document.createElement('span'); s.textContent=w; s.dataset.w='1'; if(dot) s.classList.add('dotfill'); rv.appendChild(s);
    if(i<arr.length-1){ var sp=document.createElement('span'); sp.innerHTML='&nbsp;'; if(dot) sp.classList.add('dotfill'); rv.appendChild(sp); }
  });
});
function regrid(){
  $$('.rv[data-dot="1"]').forEach(function(rv){
    Array.prototype.forEach.call(rv.children,function(s){
      var ox=((s.offsetLeft%6.5)+6.5)%6.5, oy=((s.offsetTop%6.5)+6.5)%6.5;
      s.style.backgroundPosition=(-ox)+'px '+(-oy)+'px';
    });
  });
}
function widest(h){
  var m=0; h.querySelectorAll('.rv').forEach(function(rv){ var k=rv.children; if(!k.length) return; var a=k[0],b=k[k.length-1]; m=Math.max(m,b.offsetLeft+b.offsetWidth-a.offsetLeft); }); return m;
}
function fit(){
  syncHeader();
  $$('.disp').forEach(function(h){
    h.style.fontSize=''; var fs=parseFloat(getComputedStyle(h).fontSize), avail=h.clientWidth, n=0;
    while(widest(h)>avail && fs>20 && n++<80){ fs=Math.max(20,fs*.96); h.style.fontSize=fs+'px'; }
  });
  regrid();
}

/* reveals on scroll */
function play(el){
  if(el.dataset.done) return; el.dataset.done='1';
  var base=+(el.dataset.d||0);
  if(el.classList.contains('rv')){ var wi=0; Array.prototype.forEach.call(el.children,function(s){ s.style.transitionDelay=(base+wi*55)+'ms'; if(s.dataset.w) wi++; }); el.classList.add('in'); }
  else { el.style.transitionDelay=base+'ms'; el.classList.add('in'); }
}
var io='IntersectionObserver' in window ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ play(e.target); io.unobserve(e.target); } }); },{threshold:.12,rootMargin:'0px 0px -5% 0px'}) : null;
function arm(){ $$('.rv,.fade').forEach(function(el){ if(io) io.observe(el); else play(el); }); }
window.KCUI={observe:function(el){ if(io) io.observe(el); else play(el); },fit:fit};

var yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();
fit(); arm();
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){ fit(); });
var rz=0; function onR(){ cancelAnimationFrame(rz); rz=requestAnimationFrame(function(){ if(getComputedStyle(toggle).display==='none') closeMenu(); fit(); }); }
window.addEventListener('resize',onR); if(window.visualViewport) window.visualViewport.addEventListener('resize',onR);
})();
