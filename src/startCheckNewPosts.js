import requestToRss from './requestToRss.js';

const startCheckNewPosts = (state) => {
  const requests = state.rssLinks.map((link) => Promise.resolve(requestToRss(link, state)));
  Promise.all(requests).then(() => {
    setTimeout(() => {
      startCheckNewPosts(state);
    }, 5000);
  });
};
export default startCheckNewPosts;
