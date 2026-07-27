
document.querySelectorAll('.card,.panel,.metric,.role,.mini').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(900px) rotateX(${-y*2.2}deg) rotateY(${x*2.8}deg)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
function toast(msg='Prototype action saved.'){const t=document.getElementById('toast');if(!t)return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800)}
document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();toast()}));
document.querySelectorAll('[data-modal]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.modal)?.classList.add('show')));
document.querySelectorAll('.modal .close,.modal [data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('.modal')?.classList.remove('show')));
document.querySelectorAll('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast||'Saved')));
