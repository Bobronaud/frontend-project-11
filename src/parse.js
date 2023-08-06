import uniqueId from 'lodash/uniqueId.js';

export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');
  const errorNode = dom.querySelector('parsererror');
  if (errorNode) {
    throw new Error('form.errors.failParsing');
  }

  const feed = {
    title: dom.querySelector('title').textContent,
    description: dom.querySelector('description').textContent,
    id: uniqueId(),
  };

  const items = Array.from(dom.querySelectorAll('item'));
  const posts = items.map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
    id: uniqueId(),
    feedId: feed.id,
  }));
  return [feed, posts];
};
