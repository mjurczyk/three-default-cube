/* Dark / light theme controls */

(function () {
  const themeToggleElement = document.querySelector('.utils-theme');
  const bodyElement = document.querySelector('body');

  const getCurrentMode = () => {
    let scheme = localStorage.getItem('color-scheme');

    if (!scheme) {
      scheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

      localStorage.setItem('color-scheme', scheme ? 'dark' : 'light');
    }

    return localStorage.getItem('color-scheme');
  };

  const updateMode = () => {
    const useDarkMode = getCurrentMode() === 'dark';

    if (useDarkMode) {
      bodyElement.classList.add('dark-mode');

      themeToggleElement.classList.remove('inactive');
      themeToggleElement.classList.add('active');
    } else {
      bodyElement.classList.remove('dark-mode');

      themeToggleElement.classList.add('inactive');
      themeToggleElement.classList.remove('active');
    }
  };

  themeToggleElement.addEventListener('click', () => {
    const useDarkMode = getCurrentMode() === 'dark';

    localStorage.setItem('color-scheme', useDarkMode ? 'light' : 'dark');

    updateMode();
  });

  updateMode();
})();

(function () {
  const iframes = document.querySelectorAll('iframe');

  Array.from(iframes).forEach(iframe => {
    iframe.addEventListener('mouseover', () => {
      iframe.focus();
    });
  });
})();

/* Generate ToC anchors */

(function () {
  const tableOfContents = document.querySelectorAll('#TableOfContents a');

  Array.from(tableOfContents).forEach(node => {
    const path = node.textContent.toLowerCase();
  
    node.href += path.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\W/g, '-');
  });
})();

/* Prefix search */

(function () {
  const searchField = document.querySelector('#search');
  const previousValue = sessionStorage.getItem('search');

  if (previousValue) {
    searchField.value = previousValue;

    if (typeof filterSearch === 'function') {
      filterSearch();
    }
  }

  searchField.addEventListener('keyup', (event) => {
    console.info(event.target.value);
    sessionStorage.setItem('search', event.target.value);
  });
})();
