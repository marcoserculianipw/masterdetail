document.addEventListener('DOMContentLoaded', () => {
  // Inicialização dos ícones Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  
  const heroVideo = document.getElementById('heroVideo');

  if (heroVideo) {
    heroVideo.muted = true;

    const playVideo = () => {
      heroVideo.play().catch(() => {
        // Fallback: se o navegador bloquear autoplay de início, toca no primeiro toque ou clique
        const unlock = () => {
          heroVideo.play();
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      });
    };
    playVideo();

    // Se o loop nativo do navegador falhar ao chegar no último milissegundo, força o replay
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play();
    });

    // Se o usuário alternar de aba e voltar, garante que o vídeo retome
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        heroVideo.play();
      }
    });
  }

  
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  /* ----------------------------------------------------
     3. CARROSSEL DE PROJETOS & NAVEGAÇÃO
  ---------------------------------------------------- */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  function getCardStep() {
    const card = track ? track.querySelector('.gallery-card') : null;
    return card ? card.offsetWidth + 24 : 360;
  }

  if (track && nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: getCardStep(), behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -getCardStep(), behavior: 'smooth' });
    });

    /* ARRASTE COM O MOUSE (DRAG SUAVE) */
    let isDown = false;
    let startX;
    let scrollLeft;
    let hasDragged = false;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      track.classList.remove('scroll-smooth');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        track.classList.add('scroll-smooth');
      }
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.add('scroll-smooth');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 6) hasDragged = true;
      track.scrollLeft = scrollLeft - walk;
    });

    /* ----------------------------------------------------
       4. MODAL / LIGHTBOX (AMPLIAR FOTO EM TELA CHEIA)
    ---------------------------------------------------- */
    const modal = document.getElementById('imageModal');
    const modalContainer = document.getElementById('modalContainer');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeModal = document.getElementById('closeModal');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));

    let currentIndex = 0;

    function renderModalItem(index) {
      const card = galleryCards[index];
      if (!card) return;
      
      currentIndex = index;
      modalImg.src = card.dataset.fullImg;
      modalImg.alt = card.dataset.title;
      modalTitle.textContent = card.dataset.title;
      modalDesc.textContent = card.dataset.desc;
    }

    function openLightbox(index) {
      renderModalItem(index);
      modal.classList.remove('hidden');
      
      requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modalContainer.classList.remove('scale-95');
        modalContainer.classList.add('scale-100');
      });
      document.body.style.overflow = 'hidden';
    }

    function hideLightbox() {
      modal.classList.add('opacity-0');
      modalContainer.classList.remove('scale-100');
      modalContainer.classList.add('scale-95');
      
      setTimeout(() => {
        modal.classList.add('hidden');
        modalImg.src = '';
      }, 300);
      document.body.style.overflow = 'auto';
    }

    galleryCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (hasDragged) return; // Não abre se o usuário apenas arrastou o carrossel
        openLightbox(index);
      });
    });

    if (modalPrev && modalNext) {
      modalPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryCards.length) % galleryCards.length;
        renderModalItem(currentIndex);
      });

      modalNext.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryCards.length;
        renderModalItem(currentIndex);
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', hideLightbox);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.id === 'imageModal') {
          hideLightbox();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!modal || modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') hideLightbox();
      if (e.key === 'ArrowLeft' && modalPrev) modalPrev.click();
      if (e.key === 'ArrowRight' && modalNext) modalNext.click();
    });
  }
});