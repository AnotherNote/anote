import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { debounce } from '../../util';

class NoteEditor extends Component {
  constructor(props) {
    super(props);
    this.debouncedOnchange = debounce(this.onChange, 200);
  }

  onChange = () => {
    if((this.refs.textArea.value != this.props.currentFile.content) && this.props.callbacks && this.props.callbacks.onChangeContent){
      this.props.callbacks.onChangeContent(this.refs.textArea.value, this.props.currentFile);
    }
  }

  componentWillUnmount() {
    this.debouncedOnchange.cancel();
  }

  componentDidMount() {
    if(this.debouncedOnchange)
      this.debouncedOnchange.cancel();
    var that = this,
      $imageInput = $(ReactDom.findDOMNode(that.refs.imageInput));
    var editor = editormd("editormd", {
        // lang: "en",
        path : "./lib/",
        onchange: function() {
          // console.log("onchange =>", this, this.id, this.settings, this.state);
          // console.log(that.refs.textArea.value);
          that.debouncedOnchange();
        },
        toolbarIcons: ["undo", "redo", "|", "bold", "del", "italic", "quote", "ucwords", "uppercase", "lowercase", "|", "h1", "h2", "h3", "h4", "h5", "h6", "|", "list-ul", "list-ol", "hr", "|", "link", "reference-link", "insertImage", "code", "preformatted-text", "code-block", "table", "datetime", "emoji", "html-entities", "pagebreak", "|", "goto-line", "watch", "preview", "fullscreen", "clear", "search", "image"],
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
            console.log('change image');
            console.log(event.target.files);
          });
        }
    });
    editor.setToolbarAutoFixed(true);
  }

  render () {
    return (
      <div id='editormd'>
        <textarea defaultValue={this.props.currentFile && this.props.currentFile.content} ref='textArea'></textarea>
        <input type='file' style={{display: 'none'}} ref='imageInput'/>
      </div>
    );
  }
}

export default NoteEditor;
