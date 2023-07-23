export default (xmlString) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(xmlString, 'application/xml');
  return dom;
};
