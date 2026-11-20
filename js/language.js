(function (window, document, navigator) {
  'use strict';

  var STORAGE_KEY = 'preferredLanguage';
  var languages = ['en', 'zh-Hans'];
  var selectedLanguage;

  function browserLanguage() {
    var candidates = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (var index = 0; index < candidates.length; index++) {
      if (/^zh(?:-|$)/i.test(candidates[index])) return 'zh-Hans';
    }
    return 'en';
  }

  function readPreference() {
    try {
      var preference = window.localStorage.getItem(STORAGE_KEY);
      return languages.indexOf(preference) === -1 ? null : preference;
    } catch (error) {
      return null;
    }
  }

  function savePreference(language) {
    if (languages.indexOf(language) === -1) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // Refreshing the unified URL still works without storage access.
    }
  }

  function currentLanguage() {
    return selectedLanguage || readPreference() || browserLanguage();
  }

  function translatedContent(language) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-language-region]'), function (scope) {
      var content = scope.querySelector('[data-language-content]');
      var template = scope.querySelector('template[data-language-content]');
      if (!content || !template) return;

      if (language === 'en') {
        return;
      }
      content.replaceChildren(template.content.cloneNode(true));
      content.setAttribute('data-active-language', language);
    });
  }

  function translatedText(language) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-locale-en]'), function (element) {
      var html = element.getAttribute('data-locale-html-' + language);
      var value = element.getAttribute('data-locale-' + language);
      if (html !== null) {
        element.innerHTML = html;
      } else if (value !== null) {
        element.textContent = value;
      }

      var attributes = element.getAttribute('data-locale-attrs');
      if (attributes) {
        attributes.split(/\s+/).forEach(function (name) {
          if (name) element.setAttribute(name, value);
        });
      }
    });
  }

  function translatedMetadata(language) {
    var title = document.documentElement.getAttribute('data-i18n-title-' + language);
    if (title) document.title = title;

    ['description', 'keywords'].forEach(function (name) {
      var meta = document.querySelector('meta[name="' + name + '"]');
      if (!meta) return;
      var value = meta.getAttribute('data-content-' + language);
      if (value !== null) meta.setAttribute('content', value);
    });
  }

  function translatedMessages(language) {
    if (!window.GLOBAL_CONFIG || !window.GLOBAL_LOCALES) return;
    var translations = window.GLOBAL_LOCALES[language];
    if (!translations || !translations.copy) return;
    Object.keys(translations.copy).forEach(function (key) {
      window.GLOBAL_CONFIG.copy[key] = translations.copy[key];
    });
  }

  function languageSwitch(target) {
    while (target && target !== document) {
      if (
        typeof target.className === 'string' &&
        (' ' + target.className + ' ').indexOf(' language-switch ') !== -1
      ) {
        return target;
      }
      target = target.parentNode;
    }
    return null;
  }

  function translatedTagNames(language) {
    let labels = {};
    try {
      labels = JSON.parse(document.documentElement.getAttribute('data-tag-map') || '{}');
    } catch (error) {}

    Array.prototype.forEach.call(document.querySelectorAll('[data-locale-tag]'), function (element) {
      const name = element.getAttribute('data-locale-tag');
      element.textContent = language === 'zh-Hans' ? (labels[name] || name) : name;
    });
  }

  function updateSwitch(language) {
    Array.prototype.forEach.call(document.querySelectorAll('.language-switch'), function (element) {
      element.hidden = false;
      element.textContent = language === 'en' ? '中文' : 'EN';
      element.setAttribute('aria-label', language === 'en' ? '切换到中文' : 'Switch to English');
      element.setAttribute('data-language', language);
    });
  }

  function applyLanguage(language) {
    if (languages.indexOf(language) === -1) language = 'en';
    selectedLanguage = language;
    document.documentElement.lang = language;
    translatedMetadata(language);
    translatedContent(language);
    translatedText(language);
    translatedTagNames(language);
    translatedMessages(language);
    updateSwitch(language);
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  document.documentElement.lang = currentLanguage();
  ready(function () {
    applyLanguage(currentLanguage());
  });

  document.addEventListener('click', function (event) {
    var switcher = languageSwitch(event.target);
    if (!switcher || event.button === 2) return;
    event.preventDefault();

    savePreference(currentLanguage() === 'en' ? 'zh-Hans' : 'en');
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.location.reload();
  }, false);

  window.BlogLanguage = {
    apply: applyLanguage,
    current: currentLanguage,
    storageKey: STORAGE_KEY
  };
})(window, window.document, window.navigator);
