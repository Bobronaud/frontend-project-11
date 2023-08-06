import axios from 'axios';
import parse from './parse.js';

const uploadRss = (rss, state) => {
  axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`)
    .then((response) => {
      const content = response.data.contents;
      const [feed, posts] = parse(content);
      state.feeds.push(feed);
      posts.forEach((post) => {
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

export default uploadRss;
