import requestToRss from './requestToRss.js';

const startCheckNewPosts = (state) => {
  const promise = Promise.resolve();
  promise
    .then(() => {
      state.rssLinks.forEach((link) => {
        requestToRss(link, state);
      });
    })
    .then(() => {
      setTimeout(startCheckNewPosts(state), 5000);
    });
};
export default startCheckNewPosts;
