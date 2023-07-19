import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import ru from './locales/ru.js';
import render from './render.js';

export default () => {
  const defaultLang = 'ru';
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input[name="url"]'),
  };

  const initialState = {
    lang: defaultLang,
    form: {
      valid: '',
    },
    feeds: [],
  };
  const watcher = onChange(initialState, render(elements));

  i18n
    .init({
      lng: defaultLang,
      debug: true,
      resourses: { ru },
    })
    .then(() => {
      console.log(i18n.t('mainHeader.header'));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        yup.setLocale({
          mixed: {
            notOneOf: i18n.t('form.errors.invlidNotOneOf'),
          },
          string: {
            url: i18n.t('form.errors.invalidUrl'),
          },
        });
        const schema = yup.object().shape({
          link: yup.string().url().notOneOf(watcher.feeds),
        });
        schema
          .validate({ link: elements.input.value })
          .then(() => {
            watcher.feeds.push(elements.input.value);
            watcher.form.valid = true;
          })
          .catch((err) => {
            watcher.form.valid = false;
            console.error(err);
          });
      });
    });
};
