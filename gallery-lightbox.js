/* Down by the Bay — gallery lightbox
   Click any gallery photo to view it large; arrows/keys move through the set.
   Reads each <image-slot>'s current image (dropped photo if present, else the
   authored src) at click time, so it stays correct if photos are swapped. */
(function () {
  function currentSrc(slot) {
    const img = slot.shadowRoot && slot.shadowRoot.querySelector('img');
    if (img && img.getAttribute('src')) return img.getAttribute('src');
    return slot.getAttribute('src') || '';
  }

  function init() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    const slots = [...gallery.querySelectorAll('image-slot')];
    if (!slots.length) return;

    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML =
      '<button class="lightbox-btn lightbox-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<button class="lightbox-btn lightbox-prev" aria-label="Previous photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<img alt="" />' +
      '<button class="lightbox-btn lightbox-next" aria-label="Next photo">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '<div class="lightbox-count"></div>';
    document.body.appendChild(box);

    const imgEl = box.querySelector('img');
    const countEl = box.querySelector('.lightbox-count');
    let idx = 0;

    function show(i) {
      idx = (i + slots.length) % slots.length;
      const src = currentSrc(slots[idx]);
      if (!src) return;
      imgEl.src = src;
      countEl.textContent = (idx + 1) + ' / ' + slots.length;
    }
    function open(i) { show(i); box.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { box.classList.remove('open'); document.body.style.overflow = ''; }

    slots.forEach((slot, i) => {
      slot.addEventListener('click', (e) => {
        // Ignore clicks on the slot's own controls (replace/clear/upload) if any are visible.
        if (e.target.closest && e.target.closest('.ctl, .empty')) return;
        if (!currentSrc(slot)) return;
        open(i);
      });
      // Block native drag-ghost + the double-click reframe affordance so the
      // gallery stays purely a click-to-view experience.
      slot.addEventListener('dragstart', (e) => e.preventDefault());
    });

    box.querySelector('.lightbox-close').addEventListener('click', close);
    box.querySelector('.lightbox-prev').addEventListener('click', () => show(idx - 1));
    box.querySelector('.lightbox-next').addEventListener('click', () => show(idx + 1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
