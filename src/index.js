import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js';

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('input[name="url"]'),
};

const initialState = {
  form: {
    valid: '',
  },
  feeds: [],
};

const watcher = onChange(initialState, render(elements));

elements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const schema = yup.object().shape({
    link: yup.string().url().notOneOf(watcher.feeds),
  });
  schema
    .isValid({ link: elements.input.value })
    .then((valid) => {
      watcher.feeds.push(elements.input.value);
      watcher.form.valid = valid;
    })
    .catch(console.error);
});
