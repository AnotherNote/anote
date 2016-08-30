import React, {
    Component,
    PropTypes
} from 'react';
import TextField from 'material-ui/TextField';

class NotePreview extends Component {
  componentDidMount() {
    editormd.markdownToHTML("previewPanel", {
                          htmlDecode: "style,script,iframe",
                          tocm: true
                        });
  }

  render() {
    return (
      <div>
        <TextField
          hintText="Untitled"
          fullWidth={true}
          style={{height: '50px'}}
          inputStyle={{'fontSize': '16px', color: '#5d5d5d'}}
          defaultValue={this.props.currentFile && this.props.currentFile.title}
          disabled={true}
          ref='fileTitle'
        />
        <div
          className='editor-wrapper'
          ref='previewPanel'
          id='previewPanel'
        >
          <textarea
            value={this.props.currentFile && this.props.currentFile.content}
            style={{display: 'none'}}
            readOnly
          />
        </div>
      </div>
    )
  }
}

NotePreview.propTypes = {
  currentFile: PropTypes.object
}

export default NotePreview;
