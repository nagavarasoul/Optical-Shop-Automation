/* ==========================================================================
   VS Lens Mart mockups: shared photo large view (camp detail, gallery)
   A native <dialog>: focus trap, Esc and backdrop come built in.
   VSLM_LIGHTBOX.open(items, index, opener)
     items: [{ label, caption, meta }]  label = placeholder text, caption = alt text
     opener: the element to return focus to when the view closes
   ========================================================================== */
window.VSLM_LIGHTBOX = (() => {
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="lightbox" id="lightbox" aria-label="Photo">
      <div class="lightbox__inner">
        <button class="icon-btn lightbox__nav" type="button" data-lb="prev" aria-label="Previous photo"><svg class="icon icon--lg" style="transform:rotate(180deg)"><use href="#i-arrow"/></svg></button>
        <div class="ph ph--dark" id="lb-photo"></div>
        <button class="icon-btn lightbox__nav" type="button" data-lb="next" aria-label="Next photo"><svg class="icon icon--lg"><use href="#i-arrow"/></svg></button>
        <div class="lightbox__cap"><span><b id="lb-cap"></b><br><span id="lb-meta"></span></span><button class="icon-btn" type="button" data-lb="close" aria-label="Close"><svg class="icon icon--lg"><use href="#i-x"/></svg></button></div>
      </div>
    </dialog>`);
  const lb = document.getElementById('lightbox');
  let items = [], cur = 0, opener = null;

  function render() {
    const it = items[cur];
    document.getElementById('lb-photo').innerHTML = `<span>${it.label}</span>`;
    document.getElementById('lb-cap').textContent = it.caption;
    document.getElementById('lb-meta').textContent = [it.meta, `${cur + 1} of ${items.length}`].filter(Boolean).join(' · ');
    lb.setAttribute('aria-label', it.caption);
  }
  const go = d => { cur = (cur + d + items.length) % items.length; render(); };

  lb.addEventListener('click', e => {
    const b = e.target.closest('[data-lb]');
    if (b) return b.dataset.lb === 'close' ? lb.close() : go(b.dataset.lb === 'next' ? 1 : -1);
    if (e.target === lb) lb.close();   // click on the backdrop
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  let sx = null;   // swipe on phones
  lb.addEventListener('pointerdown', e => { sx = e.clientX; });
  lb.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(e.clientX < sx ? 1 : -1); sx = null; });
  // The browser restores focus itself on close; run after it so focus lands on the photo that was opened
  lb.addEventListener('close', () => setTimeout(() => opener?.focus(), 0));

  function open(list, index, from) {
    if (!lb.showModal || !list.length) return;
    items = list; cur = index; opener = from;
    render();
    lb.showModal();
  }
  return { open };
})();
