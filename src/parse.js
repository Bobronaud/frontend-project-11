export default (data, type) => {
  try {
    const parser = new DOMParser();
    const dom = parser.parseFromString(data, type);
    return dom;
  } catch (e) {
    throw new Error('form.errors.failParsing');
  }
};
