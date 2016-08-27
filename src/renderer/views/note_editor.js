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
    this.debouncedOnchange = debounce(this.onChange, 200);
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

  onChange = () => {
    console.log('note editor onchange');
    if((this.refs.textArea.value != this.props.currentFile.content) && this.props.callbacks && this.props.callbacks.onChangeContent){
      this.props.callbacks.onChangeContent(this.refs.textArea.value, this.props.currentFile);
    }
  }

  componentWillUnmount() {
    this.debouncedOnchange.cancel();
  }

  componentWillReceiveProps = (newProps) => {
    if((this.props.currentFile && this.props.currentFile._id) != (newProps.currentFile && newProps.currentFile._id))
      this.editor.cm.setValue(newProps.currentFile.content);
  }

  componentDidMount() {
    console.log('note editor componentDidMount');
    if(this.debouncedOnchange)
      this.debouncedOnchange.cancel();
    this.debouncedOnchange = debounce(this.onChange, 200);
    var that = this,
      $imageInput = $(ReactDom.findDOMNode(that.refs.imageInput));
    var editor = editormd("editormd", {
        autoFocus: false,
        path : "./lib/",
        onchange: function() {
          console.log('editor onchange');
          // console.log("onchange =>", this, this.id, this.settings, this.state);
          // console.log(that.refs.textArea.value);
          that.debouncedOnchange();
        },
        toolbarIcons: ["undo", "redo", "|", "bold", "italic", "quote", "|", "h1", "h2", "h3", "|", "list-ul", "list-ol", "hr", "|", "link", "reference-link", "insertImage", "code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search"],
        toolbarIconsClass : {
          insertImage: "fa-picture-o"  // 指定一个FontAawsome的图标类
        },
        toolbarHandlers: {
          insertImage: function(cm, icon, cursor, selection) {
            $imageInput.trigger('click');
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
    window.editor = editor;
    this.editor = editor;
  }

  render () {
    return (
      <div id='editormd'>
        <textarea
          defaultValue={this.props.currentFile && this.props.currentFile.content}
          ref='textArea'/>
        <input type='file' style={{display: 'none'}} ref='imageInput' accept='image/*' />
      </div>
    );
  }
}

export default NoteEditor;
