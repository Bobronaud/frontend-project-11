import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import parse from './parse.js';
import ru from './locales/ru.js';
import render from './render.js';

const addProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;

const uploadRss = (rss, state) => {
  axios
    .get(addProxy(rss))
    .then((response) => {
      const content = response.data.contents;
      const [feed, posts] = parse(content);

      feed.id = uniqueId();
      state.feeds.push(feed);

      posts.forEach((post) => {
        post.id = uniqueId();
        post.feedId = feed.id;
        state.posts.push(post);
      });

      state.rssLinks.push(rss);
      state.form.valid = true;
    })
    .catch((err) => {
      state.form.valid = false;
      state.form.error = err.request ? 'form.errors.failRequest' : err.message;
      console.error(err);
    });
  state.form.valid = '';
};

const startCheckNewPosts = (state) => {
  const requests = state.rssLinks.map((rss) => {
    const request = axios
      .get(addProxy(rss))
      .then((response) => {
        const content = response.data.contents;
        const [feed, posts] = parse(content);
        const currentFeed = state.feeds.find(({ title }) => title === feed.title);

        const loadedPostsLinks = state.posts.map(({ link }) => link);
        const newPosts = posts.filter((post) => !loadedPostsLinks.includes(post.link));
        newPosts.forEach((post) => {
          post.id = uniqueId();
          post.feedId = currentFeed.id;
          state.posts.push(post);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    return request;
  });

  Promise.all(requests).then(() => {
    setTimeout(() => {
      startCheckNewPosts(state);
    }, 5000);
  });
};

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
      const watcher = onChange(initialState, render(elements, i18nInstance, initialState));

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
        const formData = new FormData(el.target);
        const url = formData.get('url');
        const schema = yup.object().shape({
          link: yup.string().min(1).url().notOneOf(watcher.rssLinks),
        });
        schema
          .validate({ link: url })
          .then(() => {
            const rssLink = url;
            uploadRss(rssLink, watcher);
          })
          .catch((e) => {
            watcher.form.valid = false;
            watcher.form.error = e.errors;
            console.error(e);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const dataId = e.target.dataset.id;
        if (dataId) {
          watcher.uiState.modal = dataId;
          watcher.uiState.viewedPosts.push(dataId);
        }
      });

      startCheckNewPosts(watcher);
    });
};
