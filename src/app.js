import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import ru from './locales/ru.js';
import render from './render.js';
import parser from './parser.js';
import checkNewPosts from './checkNewPosts.js';

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
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        yup.setLocale({
          mixed: {
            notOneOf: 'form.errors.invlidNotOneOf',
          },
          string: {
            url: 'form.errors.invalidUrl',
            min: 'form.errors.emptyField',
          },
        });
        const schema = yup.object().shape({
          link: yup.string().min(1).url().notOneOf(watcher.rssLinks),
        });
        schema
          .validate({ link: elements.input.value })
          .then(() => {
            const rssLink = elements.input.value;
            axios
              .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rssLink)}`)
              .then((response) => {
                const content = response.data.contents;
                const xmlDom = parser(content);
                const hasParserError = xmlDom.querySelector('parsererror');
                if (hasParserError) {
                  throw new Error('form.errors.failParsing');
                }
                return xmlDom;
              })
              .then((xmlDom) => {
                const feedTitle = xmlDom.querySelector('title').textContent;
                const feedDescription = xmlDom.querySelector('description').textContent;
                const feedId = uniqueId();
                watcher.feeds.push({
                  title: feedTitle,
                  description: feedDescription,
                  id: feedId,
                });

                const items = xmlDom.querySelectorAll('item');
                items.forEach((item) => {
                  const postTitle = item.querySelector('title').textContent;
                  const postDescription = item.querySelector('description').textContent;
                  const link = item.querySelector('link').textContent;
                  const postId = uniqueId();
                  watcher.posts.push({
                    title: postTitle,
                    description: postDescription,
                    link,
                    id: postId,
                    feedId,
                  });
                });
                watcher.rssLinks.push(rssLink);
                watcher.form.valid = true;
                setTimeout(checkNewPosts(watcher), 5000);
              })
              .then(() => {
                const postButtons = document.querySelectorAll('.posts button');
                postButtons.forEach((button) => {
                  button.addEventListener('click', (el) => {
                    const buttonId = el.target.dataset.id;
                    const actualPost = watcher.posts.find(({ id }) => id === buttonId);
                    watcher.uiState.modal = actualPost;
                    watcher.uiState.viewedPosts.push(actualPost.id);
                  });
                });
              })
              .catch((err) => {
                if (err.request) {
                  watcher.form.valid = false;
                  watcher.form.error = 'form.errors.failRequest';
                  console.error('form.errors.failRequest');
                  console.error(err);
                } else {
                  watcher.form.valid = false;
                  watcher.form.error = err.message;
                  console.error(err);
                }
              });
            watcher.form.valid = '';
          })
          .catch((err) => {
            watcher.form.valid = false;
            watcher.form.error = err.errors;
            console.error(err);
          });
      });
    });
};
