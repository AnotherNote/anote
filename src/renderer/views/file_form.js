import React, {
    Component,
    PropTypes
} from 'react';
import NoteEditor from './note_editor';
import TextField from 'material-ui/TextField';
import {
    debounce
} from '../../util';
import ReactDom from 'react-dom';
import NotePreview from './note_preview';
import NoteTitle from './note_title'

class FileForm extends Component {
  constructor(props) {
    super(props);
    this.debouncedOnTitleChange = debounce(this.onTitleChange, 200);
    this.debouncedOnContentchange = debounce(this.onContentChange, 200);
    this.first = false;
  }

  onTitleChange = (value, currentFile) => {
    if(this.props.callbacks && this.props.callbacks.onChangeTitle && currentFile.title != value)
      this.props.callbacks.onChangeTitle(value, currentFile)
  }

  onContentChange = (value, currentFile) => {
    if(value == null || currentFile == null)
      return;
    if(!this.first && this.props.callbacks && this.props.callbacks.onChangeContent){
      this.props.callbacks.onChangeContent(value, currentFile);
    }else{
      this.first = false;
    }
  }

  componentWillUnmount = () => {
    this.debouncedOnTitleChange.cancel();
    this.debouncedOnContentchange.cancel();
  }

  componentWillReceiveProps = (newProps) => {
    if((this.props.currentFile && this.props.currentFile._id) != (newProps.currentFile && newProps.currentFile._id)){
      if(this.refs.fileTitle){
        this.refs.fileTitle.setValue(newProps.currentFile.title);
        this.refs.fileTitle.focus();
        this.debouncedOnTitleChange.cancel();
      }
    }
    if((this.props.currentFile && this.props.currentFile._id) != (newProps.currentFile && newProps.currentFile._id)){
      if(this.refs.fileContent){
        this.refs.fileContent.setValue(newProps.currentFile.content || '');
        this.refs.fileContent.clearHistory();
        this.debouncedOnContentchange.cancel();
        if(newProps.currentFile.content != this.props.currentFile.content){
          this.first = true;
        }else{
          this.first = false;
        }
      }
    }
  }

  // cause: defaultValue only a initial state, not updated by state or props, so, have to replace element by condition
  // cause: key is very very important, key change will update the whole element. not just replace the attributes
  // key={(this.props.currentFile && this.props.currentFile._id) || 'none'}
  // 暂时去掉key的写法，用componentWillReceiveProps来手动赋值，提高editor的效率
  render() {
    let realForm = (
                    this.props.available == 'true' ?
                      <div>
                        <NoteTitle
                          autoFocus={true}
                          onChange={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.debouncedOnTitleChange(event.target.value, this.props.currentFile);
                          }}
                          defaultValue={(this.props.currentFile && this.props.currentFile.title)}
                          ref='fileTitle'
                          style={{
                            padding: '11px 8px 12px 8px',
                            display: 'block',
                            border: 'none',
                            borderBottom: '1pz solid #808080',
                            fontSize: '16px',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div className='editor-wrapper'>
                          <NoteEditor
                            defaultValue={this.props.currentFile && this.props.currentFile.content}
                            ref='fileContent'
                            onChange={(value) => {
                              this.debouncedOnContentchange(value, (this.props && this.props.currentFile) || null)
                            }}
                          />
                        </div>
                      </div>
                    :
                    <NotePreview
                      key={this.props.currentFile._id}
                      currentFile={this.props.currentFile}
                    />
                  );
    return (
      this.props.currentFile && this.props.currentFile._id ? realForm : <div/>
    );
  }
}

FileForm.propTypes = {
  currentFile: PropTypes.object,
  callbacks: PropTypes.object
}

export default FileForm;
