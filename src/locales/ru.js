export default {
  translation: {
    mainHeader: {
      header: 'RSS агрегатор',
      subheader: 'Начните читать RSS сегодня! Это легко, это красиво.',
    },
    form: {
      inputInvition: 'Ссылка RSS',
      submitButton: 'Добавить',
      errors: {
        invalidUrl: 'Введите корректную URL ссылку',
        invlidNotOneOf: 'RSS уже существует',
        failRequest: 'Проблемы с интернет соединением. Попробуйте позднее',
        failParsing: 'Не удалось сформировать RSS (не коректный XML документ)',
      },
      success: 'RSS успешно загружен',
    },
    main: {
      feeds: {
        name: 'Фиды',
      },
      posts: {
        name: 'Посты',
        button: {
          name: 'Просмотр',
        },
      },
    },
    footer: {
      info: 'Сделано {{createdBy}}',
    },
  },
};
