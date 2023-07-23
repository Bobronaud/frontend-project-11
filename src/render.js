export default (elements, i18nInstance) => (path, value) => {
  switch (path) {
    case 'form.valid': {
      if (value === '') {
        return;
      }
      if (!value) {
        elements.input.classList.add('is-invalid');
      } else {
        elements.input.classList.remove('is-invalid');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.feedback.textContent = i18nInstance.t('form.success');
        elements.form.reset();
        elements.input.focus();
      }
      break;
    }
    case 'feeds': {
      const isFirstFeedRender = value.length === 1;
      if (isFirstFeedRender) {
        const divCard = document.createElement('div');
        const divCardBody = document.createElement('div');
        const divCardTitle = document.createElement('h2');
        const ul = document.createElement('ul');
        divCard.classList.add('card', 'border-0');
        elements.feeds.append(divCard);
        divCardBody.classList.add('card-body');
        divCard.append(divCardBody);
        divCardTitle.classList.add('card-title', 'h4');
        divCardTitle.textContent = i18nInstance.t('main.feeds.name');
        divCardBody.append(divCardTitle);
        ul.classList.add('list-group', 'border-0', 'rounded-0');
        divCard.append(ul);
      }
      const lastFeed = value[value.length - 1];
      const { title, description } = lastFeed;
      const ul = document.querySelector('.feeds ul');
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');
      ul.append(li);
      const header = document.createElement('h3');
      header.classList.add('h6', 'm-0');
      header.textContent = title;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = description;
      li.append(header, p);
      break;
    }
    case 'posts': {
      const isFirstPostRender = value.length === 1;
      if (isFirstPostRender) {
        const divCard = document.createElement('div');
        const divCardBody = document.createElement('div');
        const divCardTitle = document.createElement('h2');
        divCard.classList.add('card', 'border-0');
        elements.posts.append(divCard);
        divCardBody.classList.add('card-body');
        divCardTitle.classList.add('card-title', 'h4');
        divCardTitle.textContent = i18nInstance.t('main.posts.name');
        divCardBody.append(divCardTitle);
        const ul = document.createElement('ul');
        ul.classList.add('list-group', 'border-0', 'rounded-0');
        divCard.append(divCardBody, ul);
      }
      const lastPost = value[value.length - 1];
      const { title, link, id } = lastPost;
      const ul = document.querySelector('.posts ul');
      const li = document.createElement('li');
      li.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );
      const a = document.createElement('a');
      a.classList.add('fw-bold');
      a.setAttribute('href', link);
      a.setAttribute('data-id', id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'nooperer');
      a.setAttribute('rel', 'noreferrer');
      a.textContent = title;
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-outline-primary', 'buttom-sm');
      button.setAttribute('type', 'button');
      button.setAttribute('data-id', id);
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18nInstance.t('main.posts.button.name');
      li.append(a, button);
      ul.append(li);
      break;
    }
    case 'form.error': {
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.add('text-danger');
      elements.feedback.textContent = i18nInstance.t(value);
      break;
    }
    case 'rssLinks': {
      break;
    }
    default:
      throw new Error(`state by path:'${path}' is not found`);
  }
};
