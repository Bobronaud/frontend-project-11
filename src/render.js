export default (elements) => (path, value) => {
  switch (path) {
    case 'form.valid': {
      if (!value) {
        elements.input.classList.add('is-invalid');
      } else {
        elements.input.classList.remove('is-invalid');
        elements.form.reset();
        elements.input.focus();
      }
      break;
    }
    case 'feeds': {
      break;
    }
    default:
      throw new Error(`state ${path} is not found`);
  }
};
