// pandao markdown editor
// now not used
import path from 'path';
import co from 'co';
import React, {
    Component
} from 'react';
import ReactDom from 'react-dom';
import {
    debounce,
    placeImageToLocalAsyn,
    downloadAsyn
} from '../../util';
import {
    copyFile,
    getFileHash,
    hash2Key,
    buffer2File
} from '../../util';
import constants from '../../constants';
let {
    FILES_PATH
} = constants;
import Spinner from './spinner'

const clipboard = require('electron').clipboard;
const fs = require('fs');
const toMarkdown = require('to-markdown');
const sanitizeHtml = require('sanitize-html');

// for past image
function pastImage(cm) {
  let image = clipboard.readImage();
  if(image && !image.isEmpty()){
    let text = clipboard.readText();
    buffer2File(image.toPNG()).then(function(key){
      cm.replaceSelection("![" + (text.length == 0 ? 'past-image' : text) + "](" + key + ")");
    });
    return true;
  }
  return false;
}

// for past html(html2markdown)
function pastHtml(cm, ele) {
  console.log('pastHtml');
  let htmlText = clipboard.readHTML();
  console.log(htmlText);
  //这里electron的坑不小，它也判断不太好是html还是text
  if(!/<[a-z][\s\S]*>/i.test(htmlText))
    return false;
  let cleanText = sanitizeHtml(htmlText, {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'img'],
    selfClosing: ['br', 'hr', 'base', 'img'],
    allowedAttributes: {
      'a': [ 'href' ],
      'img': [ 'src' ]
    }
  });
  if(htmlText && htmlText.length > 0){
    let tmpContent = toMarkdown(cleanText, {
      converters: [
        {
          filter: 'code',
          replacement: function(content) {
            return '`' + content + '`';
          }
        },
        {
          filter: 'img',
          replacement: function(content, node) {
            // need add back worker
            return "![" + 'web-image' + "](" + node.src + ")"
          }
        }
      ]
    });
    let regex = /(<([^>]+)>)/ig;
    tmpContent = tmpContent.replace(regex, '');
    ele.showSpinner();
    placeImageToLocalAsyn(tmpContent).then(function(content) {
      ele.hideSpinner();
      cm.replaceSelection(content);
    }, function () {
      ele.hideSpinner();
    });
    // cm.replaceSelection(tmpContent);
    return true;
  }
  return false
}

// past text
function pastText(cm) {
  let text = clipboard.readText();
  console.log('pastText\n');
  console.log(text);
  if(text && text.length > 0){
    cm.replaceSelection(text);
  }
}

class NoteEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: false
    }
  }

  showSpinner() {
    this.setState({
      showSpinner: true
    });
  }

  hideSpinner() {
    this.setState({
      showSpinner: false
    });
  }

  // default keymap like emacs keybinding
  // todo: add custom keymap
  keyMap() {
    var that = this;
    var keyMap = {
      "Ctrl-P": function(cm) {
        cm.execCommand("goLineUp");
      },
      "Ctrl-N": function(cm) {
        cm.execCommand("goLineDown");
      },
      "Ctrl-A": function(cm) {
        cm.execCommand("goLineStart");
      },
      "Ctrl-E": function(cm) {
        cm.execCommand("goLineEnd");
      },
      "Ctrl-K": function(cm) {
        cm.execCommand("killLine");
      },
      "Ctrl-F": function(cm) {
        cm.execCommand("goColumnRight");
      },
      "Ctrl-B": function(cm) {
        cm.execCommand("goColumnLeft");
      },
      "Alt-F": function(cm) {
        cm.execCommand("goWordRight");
      },
      "Alt-B": function(cm){
        cm.execCommand("goWordLeft");
      },
      "Cmd-V": function(cm){
        if(pastImage(cm)){
          return;
        }
        if(pastHtml(cm, that)){
          return;
        }
        pastText(cm);
      }
    };
    return keyMap;
  }


  componentDidMount() {
    var that = this,
      $imageInput = $(ReactDom.findDOMNode(that.refs.imageInput));
    var editor = editormd("editormd", {
        autoFocus: false,
        path : "./lib/",
        // 这个方法只有preview和watch的时候才调用
        onchange: function() {
        },
        watch: false,
        toolbarIcons: ["undo", "redo", "|", "bold", "italic", "quote", "|", "h1", "h2", "h3", "|", "list-ul", "list-ol", "hr", "|", "link", "reference-link", "insertImage", "code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search"],
        toolbarIconsClass : {
          insertImage: "fa-picture-o"  // 指定一个FontAawsome的图标类
        },
        toolbarHandlers: {
          insertImage: function(cm, icon, cursor, selection) {
            $imageInput.trigger('click');
          }
        },
        // a hack hook
        onChange: function() {
          if(that.props.onChange && that.refs.textArea){
            that.props.onChange((that.refs.textArea && that.refs.textArea.value) || '');
          }
        },
        onload: function() {
          $imageInput.change(function(event){
            let files = event.target.files;
            if(files.length == 0)
              return;
            co(function * () {
              let path = files[0].path;
              let hashKey = yield getFileHash(path);
              let key = hash2Key(hashKey);
              yield copyFile(path, `${FILES_PATH}/${key}`);
              editor.cm.replaceSelection("![" + files[0].name + "](" + key + ")");
            });
          });

          this.addKeyMap(that.keyMap());
        }
    });
    editor.setToolbarAutoFixed(true);
    this.editor = editor;
  }

  setValue(value) {
    if(this.editor.cm)
      return this.editor.cm.setValue(value);
    jQuery(ReactDom.findDOMNode(this.refs.textArea)).val(value);
  }

  clearHistory() {
    if(this.editor.cm)
      this.editor.cm.clearHistory();
  }

  render () {
    return (
      <div id='editormd'>
        <textarea
          defaultValue={this.props.defaultValue}
          ref='textArea'
        />
        <input type='file' style={{display: 'none'}} ref='imageInput' accept='image/*' />
        <Spinner show={this.state.showSpinner}/>
      </div>
    );
  }
}

export default NoteEditor;
