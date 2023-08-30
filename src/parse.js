export default (data) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(data, 'text/xml');
  const errorNode = dom.querySelector('parsererror');
  if (errorNode) {
    const error = new Error(errorNode.textContent);
    error.isParsingError = true;
    throw error;
  }

  const feed = {
    title: dom.querySelector('title').textContent,
    description: dom.querySelector('description').textContent,
  };

  const items = Array.from(dom.querySelectorAll('item'));
  const posts = items.map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    postLink: item.querySelector('link').textContent,
  }));
  return [feed, posts];
};
