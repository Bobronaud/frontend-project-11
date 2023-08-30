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
        emptyField: 'Не должно быть пустым',
        invalidUrl: 'Ссылка должна быть валидным URL',
        invlidNotOneOf: 'RSS уже существует',
        failRequest: 'Ошибка сети',
        failParsing: 'Ресурс не содержит валидный RSS',
        unknownError: 'Неизвестная ошибка',
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
