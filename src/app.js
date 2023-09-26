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
      feed.feedLink = rss;
      state.feeds.push(feed);

      const postsList = posts.map((post) => {
        post.id = uniqueId();
        post.feedId = feed.id;
        return post;
      });
      state.posts.push(...postsList);

      state.form.state = 'processed';
    })
    .catch((err) => {
      state.form.state = 'failed';
      if (err.isParsingError) {
        state.form.error = 'form.errors.failParsing';
      } else if (err.isAxiosError) {
        state.form.error = 'form.errors.failRequest';
      } else {
        state.form.error = 'form.errors.unknownError';
      }
      console.error(err);
    });
};

const startCheckNewPosts = (state) => {
  const requests = state.feeds.map((feed) => {
    const request = axios
      .get(addProxy(feed.feedLink))
      .then((response) => {
        const content = response.data.contents;
        const [, posts] = parse(content);

        const postsOfCurrentFeed = state.posts.filter(({ feedId }) => feed.id === feedId);
        const loadedPostsLinks = postsOfCurrentFeed.map(({ postLink }) => postLink);
        const newPosts = posts.filter((post) => !loadedPostsLinks.includes(post.postLink));

        const postsList = newPosts.map((post) => {
          post.id = uniqueId();
          post.feedId = feed.id;
          return post;
        });
        state.posts.push(...postsList);
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
    submitButton: document.querySelector('form button'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const defaultLang = 'ru';
  const initialState = {
    lang: defaultLang,
    form: {
      state: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      modal: null,
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
        watcher.form.state = 'processing';
        const formData = new FormData(el.target);
        const url = formData.get('url');
        const feedLinks = watcher.feeds.map(({ feedLink }) => feedLink);
        const schema = yup.object().shape({
          link: yup.string().min(1).url().notOneOf(feedLinks),
        });
        schema
          .validate({ link: url })
          .then(() => {
            uploadRss(url, watcher);
          })
          .catch((e) => {
            watcher.form.state = 'failed';
            watcher.form.error = e.errors;
            console.error(e);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const clickedOnButtonOrLink = Boolean(e.target.dataset.id);
        if (!clickedOnButtonOrLink) {
          return;
        }
        const dataId = e.target.dataset.id;
        const isViewed = watcher.uiState.viewedPosts.includes(dataId);
        watcher.uiState.modal = dataId;
        if (dataId && !isViewed) {
          watcher.uiState.viewedPosts.push(dataId);
        }
      });

      startCheckNewPosts(watcher);
    });
};
