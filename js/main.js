/* Jackie Studio — Main JavaScript */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});

/* --- Scroll Animations (IntersectionObserver) --- */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

/* --- Navbar: scroll effect + mobile toggle --- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  });

  toggle.addEventListener('click', () => {
    links.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('active');
      toggle.classList.remove('active');
    });
  });
}

/* --- Lightbox --- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = galleryItems[index];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');

    if (img) {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
    } else {
      // Placeholder — show a colored background instead
      lightboxImage.src = '';
      lightboxImage.style.display = 'none';
    }

    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImage.style.display = '';
  }

  function nextImage() {
    openLightbox((currentIndex + 1) % galleryItems.length);
  }

  function prevImage() {
    openLightbox((currentIndex - 1 + galleryItems.length) % galleryItems.length);
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.style.cursor = 'pointer';
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
}
