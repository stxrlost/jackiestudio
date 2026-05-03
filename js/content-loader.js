/* Jackie Studio — Content Loader */
/* Fetches content.json and renders dynamic sections */

(function () {
  const GRADIENTS = [
    'linear-gradient(135deg, #D4A0A7, #C07886)',
    'linear-gradient(135deg, #C07886, #FFB8C6)',
    'linear-gradient(135deg, #FFB8C6, #D4A0A7)',
    'linear-gradient(135deg, #FFB8C6, #A85C6E)',
    'linear-gradient(135deg, #A85C6E, #FFB8C6)',
    'linear-gradient(135deg, #F5DDD5, #C07886)',
    'linear-gradient(135deg, #FFB8C6, #D4A0A7)'
  ];

  const GALLERY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  const VIDEO_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>';

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderAbout(data) {
    var el = document.getElementById('about-container');
    if (!el || !data.about) return;
    el.innerHTML = data.about.paragraphs.map(function (p, i) {
      return '<p' + (i === 0 ? ' style="font-size:1.25rem;color:var(--color-text);font-weight:600"' : '') + '>' + esc(p) + '</p>';
    }).join('');
  }

  function renderGallery(data) {
    var el = document.getElementById('gallery-container');
    if (!el || !data.gallery) return;
    el.innerHTML = data.gallery.map(function (item, i) {
      var bg = item.image
        ? ''
        : ' style="background:' + GRADIENTS[i % GRADIENTS.length] + '"';
      var inner = item.image
        ? '<img src="' + esc(item.image) + '" alt="' + esc(item.caption) + '" loading="lazy">'
        : '<div class="gallery-placeholder">' + GALLERY_SVG + '<span>' + (item.category === 'Video' ? 'Art Process Video' : 'Add ' + item.category) + '</span></div>';
      return '<div class="gallery-item animate-on-scroll"' + bg + '>' +
        inner +
        '<div class="gallery-overlay">' +
        '<span class="gallery-caption">' + esc(item.caption) + '</span>' +
        '<span class="gallery-category">' + esc(item.category) + '</span>' +
        '</div></div>';
    }).join('');
  }

  function renderVideos(data) {
    var el = document.getElementById('videos-container');
    if (!el || !data.videos) return;
    el.innerHTML = data.videos.map(function (v) {
      var embed = v.youtubeId
        ? '<iframe src="https://www.youtube.com/embed/' + esc(v.youtubeId) + '" frameborder="0" allowfullscreen loading="lazy"></iframe>'
        : '<div class="video-placeholder">' + VIDEO_SVG + '<span>Add YouTube Video</span></div>';
      var embedBg = v.youtubeId ? '' : ' style="background:linear-gradient(135deg, #D4A0A7, #C07886)"';
      return '<div class="video-card animate-on-scroll">' +
        '<div class="video-embed"' + embedBg + '>' + embed + '</div>' +
        '<div class="video-info"><h3>' + esc(v.title) + '</h3><p>' + esc(v.description) + '</p></div>' +
        '</div>';
    }).join('');
  }

  function renderPersonal(data) {
    var el = document.getElementById('personal-container');
    if (!el || !data.personal) return;
    var dogSvg = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>';
    var bookSvg = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>';
    var icons = [dogSvg, bookSvg];

    el.innerHTML = data.personal.map(function (card, i) {
      var imgContent = card.image
        ? '<img src="' + esc(card.image) + '" alt="' + esc(card.title) + '" loading="lazy">'
        : (icons[i] || dogSvg);
      var imgBg = card.image ? '' : ' style="background:linear-gradient(135deg, var(--color-shell), var(--color-sky))"';
      return '<div class="personal-card animate-on-scroll">' +
        '<div class="personal-card-image"' + imgBg + '>' + imgContent + '</div>' +
        '<div class="personal-card-content"><h3>' + esc(card.title) + '</h3><p>' + esc(card.description) + '</p></div>' +
        '</div>';
    }).join('');
  }

  function renderSocial(data) {
    if (!data.social) return;
    var links = document.querySelectorAll('.social-link');
    if (data.social.youtube && links[0]) links[0].href = data.social.youtube;
    if (data.social.whatsapp && links[1]) links[1].href = data.social.whatsapp;
  }

  window.loadContent = function () {
    fetch('data/content.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        renderAbout(data);
        renderGallery(data);
        renderVideos(data);
        renderPersonal(data);
        renderSocial(data);

        // Re-init scroll animations and lightbox for new elements
        if (typeof initScrollAnimations === 'function') initScrollAnimations();
        if (typeof initLightbox === 'function') initLightbox();
      })
      .catch(function (err) {
        console.warn('Could not load content.json:', err);
      });
  };
})();
