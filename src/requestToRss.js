import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import parser from './parser.js';

const requestToRss = (rss, state) => {
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

      const allFeedTitles = state.feeds.map(({ title }) => title);
      if (!allFeedTitles.includes(feedTitle)) {
        feedId = uniqueId();
        state.feeds.push({
          title: feedTitle,
          description: feedDescription,
          id: feedId,
        });
        state.form.valid = true;
        state.rssLinks.push(rss);
      }

      const items = xmlDom.querySelectorAll('item');
      items.forEach((item) => {
        const postTitle = item.querySelector('title').textContent;
        const postDescription = item.querySelector('description').textContent;
        const postLink = item.querySelector('link').textContent;
        const postId = uniqueId();

        const allPostLinks = state.posts.map(({ link }) => link);
        if (!allPostLinks.includes(postLink)) {
          state.posts.push({
            title: postTitle,
            description: postDescription,
            link: postLink,
            id: postId,
            feedId,
          });
        }
      });
    })
    .catch((err) => {
      state.form.valid = false;
      state.form.error = err.request ? 'form.errors.failRequest' : err.message;
      console.error(err);
    });
  state.form.valid = '';
};

export default requestToRss;
