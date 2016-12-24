import path from 'path';
import co from 'co';
import React, {
  Component
} from 'react';
import {
  copyFile,
  getFileHash,
  hash2Key,
  buffer2File,
  debounce,
  placeImageToLocalAsyn,
  downloadAsyn
} from '../../util';
let {
    FILES_PATH
} = constants;
const clipboard = require('electron').clipboard;
const fs = require('fs');
const toMarkdown = require('to-markdown');
const sanitizeHtml = require('sanitize-html');
import Spinner from './spinner'
import constants from '../../constants';
import ReactDom from 'react-dom';

import CodeMirror from 'codemirror';
require('codemirror/addon/dialog/dialog.js');
require('codemirror/addon/search/searchcursor.js');
require('codemirror/addon/search/search.js');
require('codemirror/addon/scroll/annotatescrollbar.js');
require('codemirror/addon/search/matchesonscrollbar.js');
require('codemirror/addon/search/jump-to-line.js');


import ANotePreview from './anote_preview'
require('codemirror/mode/markdown/markdown');

// for past image
function pastImage(cm) {
  console.log('pastImage');
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
function pastHtml(cm, component) {
  let htmlText = clipboard.readHTML();
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
    component.showSpinner();
    placeImageToLocalAsyn(tmpContent).then(function(content) {
      component.hideSpinner();
      cm.replaceSelection(content);
    }, function () {
      component.hideSpinner();
    });
    // cm.replaceSelection(tmpContent);
    return true;
  }
  return false
}

// past text
function pastText(cm) {
  let text = clipboard.readText();
  if(text && text.length > 0){
    cm.replaceSelection(text);
  }
}

class ANoteEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSpinner: false,
      previewValue: this.props.defaultValue,
      fullscreen: false
    };

    this.debouncedSetPreviewValue = debounce(this.setPrevewValue, 50);
  }

  componentWillUnmount() {
    this.debouncedSetPreviewValue.cancel();
  }

  setPrevewValue(previewValue) {
    this.setState({
      previewValue
    });
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

  defaultKeyMaps() {
    let that = this;
    return {
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
      // 自动判断文本格式来粘贴
      "Cmd-V": function(cm){
        if(pastImage(cm)){
          return;
        }
        if(pastHtml(cm, that)){
          return;
        }
        pastText(cm);
      },
      "Cmd-Z": function(cm){
        let doc = cm.getDoc();
        if(doc)
          doc.undo();
      },
      "Cmd-Y": function(cm){
        let doc = cm.getDoc();
        if(doc)
          doc.redo();
      },
      // 粘贴纯文本
      "Alt-V": function(cm) {
        pastText(cm);
      },
      "Cmd-S": function(cm) {
        if(that.props.onChange)
          that.props.onChange(cm.getValue());
      },
      "Cmd-F": "findPersistent"
    };
  }

  componentDidMount() {
    // init editor
    this.textAreaElement = ReactDom.findDOMNode(this.refs.textArea);
    this.$imageInput = $(ReactDom.findDOMNode(this.refs.imageInput));

    window.editor = this.editor = CodeMirror.fromTextArea(this.textAreaElement, {
      theme: 'base16-light',
      mode: 'markdown',
      lineWrapping: true,
      lineNumbers: true
    });

    // set keymaps
    this.setKeyMaps();

    // setsize based on the editorState prop
    this.setSize();

    // change event
    this.editor.on('change', (instance, changeObj) => {
      if(this.props.editorState == 1 || this.editorState == 2)
        this.debouncedSetPreviewValue(this.editor.getValue());
      if(this.props.onChange){
        this.props.onChange(this.editor.getValue());
      }
    });

    this.editor.setValue(this.props.defaultValue || '');

    // set image input
    this.$imageInput.change(function(event){
      let files = event.target.files;
      if(files.length == 0)
        return;
      co(function * () {
        for(let i=0; i < files.length; i++){
          let path = files[i].path;
          let hashKey = yield getFileHash(path);
          let key = hash2Key(hashKey);
          yield copyFile(path, `${FILES_PATH}/${key}`);
          this.editor.replaceSelection("![" + files[i].name + "](" + key + ")");
        }
      });
    });
  }

  componentWillReceiveProps(newProps){
    this.setSize(newProps);
    if(newProps.editorState == 1 || newProps.editorState == 2)
      this.debouncedSetPreviewValue(this.editor.getValue());
  }

  // set editor size based on editorState
  // 0 => normal editor, 1 => watching, 2 => preview
  setSize(newProps) {
    let props = newProps || this.props,
      editorState = props.editorState || 0;
    switch (editorState) {
      // normal
      case 0:
        this.editor.setSize('100%', '100%');
        this.refs.preview.setSize('0px', '0px');
        break;
      // watching
      case 1:
        this.editor.setSize('50%', '100%');
        this.refs.preview.setSize('50%', '100%');
        break;
      // preview
      case 2:
        this.editor.setSize('0px', '0px');
        this.refs.preview.setSize('100%', '100%');
        break;
      default:
        return;
    }
  }

  setValue(value) {
    if(this.editor){
      return this.editor.setValue(value);
    }
    jQuery(ReactDom.findDOMNode(this.refs.textArea)).val(value);
  }

  getValue() {
    if(this.editor)
      return this.editor.getValue();
    return false;
  }

  clearHistory() {
    if(this.editor)
      this.editor.clearHistory();
  }

  // set keymaps
  setKeyMaps(newProps) {
    let props = newProps || this.props;
    console.log(Object.assign({}, this.defaultKeyMaps(), props.keyMaps));
    if(props.keyMaps && typeof props.keyMaps == 'object')
      return this.editor.setOption('extraKeys', Object.assign({}, this.defaultKeyMaps(), props.keyMaps));
    if(this.props.keyMaps && typeof props.keyMaps == 'function')
      return this.editor.setOption('extraKeys', Object.assign({}, this.defaultKeyMaps(), props.keyMaps()));
    this.editor.setOption('extraKeys', this.defaultKeyMaps());
  }

  // 这个用于以ref形式来操作editor
  performEditor(method) {
    if(!this.editor || !this.editor[method] || typeof this.editor[method] != 'function')
      return;
    let args = [].slice.apply(arguments, [1]);
    this.editor[method].apply(this.editor, args);
  }

  insertImage(event) {
    event.preventDefault();
    event.stopPropagation();
    if(this.$imageInput)
      this.$imageInput.trigger('click');
  }

  // toolbar elements
  _renderTools() {
    return (
        <div
          className='toolbar-container'
        >
          <ul
            className='menu left'
          >
            <li>
              <a
                href="javascript:;"
                title="undo（Cmd+Z）"
                unselectable="on"
                onClick={this.undo}
              >
                <i className="fa fa-undo" name="undo"></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="redo（Cmd+Y）"
                unselectable="on"
                onClick={this.redo}
              >
                <i className="fa fa-repeat" name="redo"></i>
              </a>
            </li>
          </ul>
          <ul
            className='menu right'
          >
            <li>
              <a
                href="javascript:;"
                title="bold"
                unselectable="on"
                onClick={this.changeBold}
              >
                <i className="fa fa-bold" name="bold" unselectable="on"></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="italics"
                unselectable="on"
                onClick={this.changeItalics}
              >
                <i className="fa fa-italic" name="italic" unselectable="on"></i>
              </a>
            </li>
            <li
              className="divider"
              unselectable="on"
            >|</li>
            <li>
              <a
                href="javascript:;"
                title="list"
                unselectable="on"
                onClick={this.insertUl}
              >
                <i
                  className="fa fa-list-ul"
                  name="list-ul"
                  unselectable="on"
                ></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="order list"
                unselectable="on"
                onClick={this.insertOl}
              >
                <i
                  className="fa fa-list-ol"
                  name="list-ol"
                  unselectable="on"
                ></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="hr"
                unselectable="on"
                onClick={this.insertHr}
              >
                <i
                  className="fa fa-minus"
                  name="hr"
                  unselectable="on"
                ></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="add image"
                unselectable="on"
                onClick={this.insertImage}
              >
                <i className="fa fa-picture-o" name="image"></i>
              </a>
            </li>
            <li
              className="divider"
              unselectable="on"
            >|</li>
            <li>
              <a
                href="javascript:;"
                title="watch"
                unselectable="on"
                onClick={this.toggleWatching}
              >
                <i className={this._anoteWatchingClassNames()} name="watch"></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="preview"
                unselectable="on"
                onClick={this.togglePreview}
              >
                <i className='fa fa-desktop' name="preview"></i>
              </a>
            </li>
            <li>
              <a
                href="javascript:;"
                title="fullscreen"
                unselectable="on"
                onClick={this.toggleFullscreen}
                className={this.state.fullscreen ? 'active' : ''}
              >
                <i className="fa fa-arrows-alt" name="fullscreen"></i>
              </a>
            </li>
          </ul>
        </div>
    )
  }

  undo(event) {
    event.preventDefault();
    event.stopPropagation();

    let doc = this.editor.getDoc();
    if(doc)
      doc.undo();
  }

  redo(event) {
    event.preventDefault();
    event.stopPropagation();

    let doc = this.editor.getDoc();
    if(doc)
      doc.redo();
  }

  toggleFullscreen() {
    this.setState({
      fullscreen: !this.state.fullscreen
    });
  }

  toggleWatching() {
    if(this.props.toggleWatching)
      this.props.toggleWatching();
  }

  togglePreview() {
    if(this.props.togglePreview)
      this.props.togglePreview();
  }

  changeBold(event) {
    event.preventDefault();
    event.stopPropagation();

    this.editor.replaceSelection('**' + this.editor.getSelection() + '**');
  }

  changeItalics(event) {
    event.preventDefault();
    event.stopPropagation();

    this.editor.replaceSelection('*' + this.editor.getSelection() + '*');
  }

  insertHr(event) {
    event.preventDefault();
    event.stopPropagation();

    this.editor.replaceSelection('------------');
  }

  insertUl(event) {
    event.preventDefault();
    event.stopPropagation();

    this.editor.replaceSelection('- ');
  }

  insertOl(event) {
    event.preventDefault();
    event.stopPropagation();

    this.editor.replaceSelection('1. ');
  }

  _anoteClassNames() {
    let klasses = '';
    klasses = this.state.fullscreen ? 'anote-editor anote-fullscreen' : 'anote-editor';
    if(this.props.editorState == 2 || this.props.withoutToolbar)
      klasses += ' anote-without-toolbar';
    return klasses;
  }

  _anoteWatchingClassNames() {
    let klasses = '';
    if(this.props.editorState == 1){
      klasses += 'fa fa-eye-slash';
    }else{
      klasses += 'fa fa-eye';
    }
    return klasses;
  }

  _anotePreviewCloseBtnStyle() {
    if(this.props.editorState == 2){
      return {
        display: 'block'
      }
    }
    return {
      display: 'none'
    }
  }

  render() {
    return (
      <div
        className={this._anoteClassNames()}
      >
        <Spinner show={this.state.showSpinner}/>
        <div
          className='content-wrapper'
        >
          <div
            className={this.props.editorState == 2 || !!this.props.withoutToolbar ? 'toolbar hidden' : 'toolbar'}
          >
              {this._renderTools()}
          </div>
          <div
            className='anote-workpanel'
          >
            <textarea
              ref='textArea'
            />
            <input
              type='file'
              style={{display: 'none'}}
              ref='imageInput'
              accept='image/*'
              multiple
            />
            <ANotePreview
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px'
              }}
              value={this.state.previewValue}
              ref='preview'
            />
            <a
              href="javascript:;"
              className="fa fa-close anote-preview-close-btn"
              style={this._anotePreviewCloseBtnStyle()}
              onClick={this.togglePreview}
            ></a>
          </div>
        </div>
      </div>
    )
  }
}

export default ANoteEditor;
