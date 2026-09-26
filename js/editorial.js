/* Archive filtering and restrained, progressively enhanced entrances. */
(() => {
  const archive = document.querySelector('#project-archive');
  if (archive) {
    const projects = [...archive.querySelectorAll('.ed-folder')];
    const filters = [...document.querySelectorAll('[data-filter]')];
    const views = [...document.querySelectorAll('[data-view]')];
    const status = document.querySelector('.ed-results');
    const params = new URLSearchParams(location.search);
    const apply = (filter, view, updateURL) => {
      let count = 0;
      for (const project of projects) {
        const matches = filter === 'all' || project.dataset.categories.split('|').includes(filter);
        project.hidden = !matches;
        if (matches) count++;
      }
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
      views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
      archive.classList.toggle('is-index', view === 'index');
      status.textContent = `${count} ${count === 1 ? 'project' : 'projects'}${filter !== 'all' ? ` / ${filter}` : ''}`;
      if (updateURL) {
        const url = new URL(location.href);
        filter === 'all' ? url.searchParams.delete('industry') : url.searchParams.set('industry', filter);
        view === 'folders' ? url.searchParams.delete('view') : url.searchParams.set('view', view);
        url.hash = '';
        history.replaceState(null, '', url);
      }
    };
    let filter = filters.some(b => b.dataset.filter === params.get('industry')) ? params.get('industry') : 'all';
    let view = params.get('view') === 'index' ? 'index' : 'folders';
    // Legacy deep links reveal the matching folder even when a filter is present.
    if (projects.some(p => `#${p.id}` === location.hash)) filter = 'all';
    apply(filter, view, false);
    document.querySelector('[data-archive-controls]').hidden = false;
    filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; apply(filter, view, true); }));
    views.forEach(button => button.addEventListener('click', () => { view = button.dataset.view; apply(filter, view, true); }));
    window.addEventListener('hashchange', () => {
      const project = projects.find(p => `#${p.id}` === location.hash);
      if (project) { filter = 'all'; apply(filter, view, false); project.scrollIntoView({block: 'start'}); }
    });
  }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('will-reveal');
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .06});
    document.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.add('will-reveal'); observer.observe(element);
    });
    motion.addEventListener('change', event => {
      if (event.matches) {
        observer.disconnect();
        document.querySelectorAll('.will-reveal').forEach(element => element.classList.remove('will-reveal'));
      }
    });
  }
})();
