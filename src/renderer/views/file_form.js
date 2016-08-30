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

class FileForm extends Component {
  constructor(props) {
    super(props);
    this.debouncedOnTitleChange = debounce(this.onTitleChange, 200);
  }

  onTitleChange = (value, currentFile) => {
    if(this.props.callbacks && this.props.callbacks.onChangeTitle && currentFile.title != value)
      this.props.callbacks.onChangeTitle(value, currentFile)
  }

  componentWillUnmount = () => {
    this.debouncedOnTitleChange.cancel();
  }

  componentWillReceiveProps = (newProps) => {
    if((this.props.currentFile && this.props.currentFile._id) != (newProps.currentFile && newProps.currentFile._id)){
      let $input = jQuery(ReactDom.findDOMNode(this.refs.fileTitle)).find('input');
      $input.val(newProps.currentFile.title || 'Untitled');
      this.debouncedOnTitleChange.cancel();
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
                        <TextField
                          hintText="Untitled"
                          fullWidth={true}
                          style={{height: '50px'}}
                          inputStyle={{'fontSize': '16px', color: '#5d5d5d'}}
                          defaultValue={this.props.currentFile && this.props.currentFile.title}
                          onChange={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            this.debouncedOnTitleChange(event.target.value, this.props.currentFile);
                          }}
                          autoFocus
                          ref='fileTitle'
                        />
                        <div className='editor-wrapper'>
                          <NoteEditor {...this.props}/>
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
