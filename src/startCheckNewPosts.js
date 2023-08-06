import axios from 'axios';
import parse from './parse.js';

const startCheckNewPosts = (state) => {
  const requests = state.rssLinks.map((rss) => {
    const promise = Promise.resolve(
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`),
    );
    promise
      .then((response) => {
        const content = response.data.contents;
        const [, posts] = parse(content);
        const allPostsLinks = state.posts.map(({ link }) => link);
        posts.forEach((post) => {
          if (!allPostsLinks.includes(post.link)) {
            state.posts.push(post);
          }
        });
      })
      .catch((err) => {
        state.form.error = err.request ? 'form.errors.failRequest' : err.message;
        console.error(err);
      });
    return promise;
  });

  Promise.all(requests).then(() => {
    setTimeout(() => {
      startCheckNewPosts(state);
    }, 5000);
  });
};
export default startCheckNewPosts;
