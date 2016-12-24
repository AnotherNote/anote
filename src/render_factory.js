import marked from 'marked';
import constants from './constants';

const { FILES_PATH } = constants;

const defaultOptions = {
  image(href, title, text) {
    console.log('render image');
    const pp = /[http|https]/;
    if (!pp.test(href)) {
      return `<p><img src='${FILES_PATH}/${href}'/></p>`;
    }
    return `<p><img src='${href}'/></p>`;
  },
  link(href, title, text) {
    let out = `<a class='external' href="${href}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += `>${text}</a>`;
    return out;
  },
};

function renderFactory(options = {}) {
  const markedRenderer = new marked.Renderer();
  options = Object.assign({}, defaultOptions, options);
  const propKeys = Object.keys(options);
  propKeys.forEach((key) => {
    markedRenderer[key] = options[key];
  });
  return markedRenderer;
}

export default renderFactory;
