const marked = require('marked');
import constants from './constants';
let { FILES_PATH } = constants;

const defaultOptions = {
  image: function(href, title, text) {
    console.log('render image');
    var pp = /[http|https]/;
    if(!pp.test(href)){
      return "<p>" + "<img src='" + FILES_PATH + '/' + href + "'/>" + "</p>";
    }else{
      return "<p>" + "<img src='" + href + "'/>" + "</p>";
    }
  },
  link: function(href, title, text) {
    let out = "<a class='external' href=\"" + href + "\"";
    if (title) {
        out += " title=\"" + title + "\"";
    }
    out += ">" + text + "</a>";
    return out;
  }
}

function renderFactory(options={}) {
  let markedRenderer = new marked.Renderer();
  options = Object.assign({}, defaultOptions, options);
  let propKeys = Object.keys(options);
  propKeys.forEach((key) => {
    markedRenderer[key] = options[key];
  });
  return markedRenderer;
}

export default renderFactory;
