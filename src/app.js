import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';
import render from './render.js';
import uploadRss from './uploadRss.js';
import startCheckNewPosts from './startCheckNewPosts.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input[name="url"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const defaultLang = 'ru';
  const initialState = {
    lang: defaultLang,
    form: {
      valid: '',
      error: '',
    },
    rssLinks: [],
    feeds: [],
    posts: [],
    uiState: {
      modal: '',
      viewedPosts: [],
    },
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultLang,
      debug: true,
      resources: { ru },
    })
    .then(() => {
      const watcher = onChange(initialState, render(elements, i18nInstance));

      yup.setLocale({
        mixed: {
          notOneOf: 'form.errors.invlidNotOneOf',
        },
        string: {
          url: 'form.errors.invalidUrl',
          min: 'form.errors.emptyField',
        },
      });

      elements.form.addEventListener('submit', (el) => {
        el.preventDefault();
        const schema = yup.object().shape({
          link: yup.string().min(1).url().notOneOf(watcher.rssLinks),
        });
        schema
          .validate({ link: elements.input.value })
          .then(() => {
            const rssLink = elements.input.value;
            uploadRss(rssLink, watcher);
          })
          .catch((e) => {
            watcher.form.valid = false;
            watcher.form.error = e.errors;
            console.error(e);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const isButtonClicked = e.target.localName === 'button';
        if (isButtonClicked) {
          const buttonId = e.target.dataset.id;
          const actualPost = watcher.posts.find(({ id }) => id === buttonId);
          watcher.uiState.modal = actualPost;
          watcher.uiState.viewedPosts.push(actualPost.id);
        }
      });

      startCheckNewPosts(watcher);
    });
};
