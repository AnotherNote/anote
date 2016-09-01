import path from 'path';
import co from 'co';
import React, {
    Component
} from 'react';
import ReactDom from 'react-dom';
import {
    debounce
} from '../../util';
import {
    copyFile,
    getFileHash,
    hash2Key
} from '../../util';
import constants from '../../constants';
let {
    FILES_PATH
} = constants;

class NoteEditor extends Component {
  constructor(props) {
    super(props);
  }

  // default keymap like emacs keybinding
  // todo: add custom keymap
  keyMap = () => {
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
        // a hack hook(我自己hack的)
        onChange: function() {
          if(that.props.onChange){
            that.props.onChange((that.refs.textArea && that.refs.textArea.value) || null);
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

  setValue = (value) => {
    console.log(`setvalue: ${value}`);
    this.editor.cm.setValue(value);
  }

  clearHistory = () => {
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
      </div>
    );
  }
}

export default NoteEditor;
