import React, { Component, PropTypes } from 'react';
import NoteEditor from './note_editor';
import TextField from 'material-ui/TextField';
import { debounce } from '../../util'

class FileForm extends Component {
  constructor(props) {
    super(props);
    this.debouncedOnTitleChange = debounce(this.onTitleChange, 200);
  }

  onTitleChange = (event) => {
    if(this.props.callbacks && this.props.callbacks.onChangeTitle && this.props.currentFile.title != event.target.value)
      this.props.callbacks.onChangeTitle(event, this.props.currentFile)
  }

  componentWillUnmount = () => {
    this.debouncedOnTitleChange.cancel();
  }

  // cause: defaultValue only a initial state, not updated by state or props, so, have to replace element by condition
  // cause: key is very very important, key change will update the whole element. not just replace the attributes
  render() {
    let realForm = (<div key={(this.props.currentFile && this.props.currentFile._id) || 'none'}>
                      <TextField
                        hintText="Untitled"
                        fullWidth={true}
                        style={{height: '50px'}}
                        inputStyle={{'fontSize': '24px', color: '#5d5d5d'}}
                        defaultValue={this.props.currentFile && this.props.currentFile.title}
                        onChange={this.onTitleChange}
                      />
                      <div className='editor-wrapper'>
                        <NoteEditor {...this.props}/>
                      </div>
                    </div>);
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
