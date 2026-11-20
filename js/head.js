(function () {
  var toggle = document.querySelector('.toggle-menu');
  var menus = document.querySelector('.menus');
  if (!toggle || !menus) return;

  function closeMenu() {
    menus.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function (event) {
    event.stopPropagation();
    var isOpen = menus.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', function (event) {
    if (!menus.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  function syncLayout() {
    if (window.innerWidth <= 768) {
      menus.removeAttribute('style');
    } else {
      closeMenu();
    }
  }

  syncLayout();
  window.addEventListener('resize', syncLayout);
})();
