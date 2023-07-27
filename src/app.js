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
      elements.form.addEventListener('submit', (el) => {
        el.preventDefault();
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

            const requestToRss = (rss) => {
              axios
                .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`)
                .then((response) => {
                  const content = response.data.contents;
                  const xmlDom = parser(content);
                  const hasParserError = xmlDom.querySelector('parsererror');
                  if (hasParserError) {
                    throw new Error('form.errors.failParsing');
                  }
                  const feedTitle = xmlDom.querySelector('title').textContent;
                  const feedDescription = xmlDom.querySelector('description').textContent;
                  let feedId;

                  const allFeedTitles = watcher.feeds.map(({ title }) => title);
                  if (!allFeedTitles.includes(feedTitle)) {
                    feedId = uniqueId();
                    watcher.feeds.push({
                      title: feedTitle,
                      description: feedDescription,
                      id: feedId,
                    });
                    watcher.form.valid = true;
                    watcher.rssLinks.push(rss);
                  }

                  const items = xmlDom.querySelectorAll('item');
                  items.forEach((item) => {
                    const postTitle = item.querySelector('title').textContent;
                    const postDescription = item.querySelector('description').textContent;
                    const postLink = item.querySelector('link').textContent;
                    const postId = uniqueId();

                    const allPostLinks = watcher.posts.map(({ link }) => link);
                    if (!allPostLinks.includes(postLink)) {
                      watcher.posts.push({
                        title: postTitle,
                        description: postDescription,
                        link: postLink,
                        id: postId,
                        feedId,
                      });
                    }
                  });
                  setTimeout(requestToRss(rss), 5000);
                })
                .then(() => {
                  const postButtons = document.querySelectorAll('.posts button');
                  postButtons.forEach((button) => {
                    button.addEventListener('click', ({ target }) => {
                      const buttonId = target.dataset.id;
                      const actualPost = watcher.posts.find(({ id }) => id === buttonId);
                      watcher.uiState.modal = actualPost;
                      watcher.uiState.viewedPosts.push(actualPost.id);
                    });
                  });
                })
                .catch((err) => {
                  watcher.form.valid = false;
                  watcher.form.error = err.request ? 'form.errors.failRequest' : err.message;
                  console.error(err);
                });
              watcher.form.valid = '';
            };

            requestToRss(rssLink);
          })
          .catch((e) => {
            watcher.form.valid = false;
            watcher.form.error = e.errors;
            console.error(e);
          });
      });
    });
};
