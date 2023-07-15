export default (elements) => (path, value, prevValue) => {
  if (path === 'form.valid') {
    if (!value) {
      elements.input.classList.add('is-invalid');
    } else {
      elements.input.classList.remove('is-invalid');
      elements.form.reset();
      elements.input.focus();
    }
  }
};
