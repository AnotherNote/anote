// only preview
import React, {
    Component,
    PropTypes
} from 'react';
import TextField from 'material-ui/TextField';
import ANotePreview from './anote_preview';

class NotePreview extends Component {
  render() {
    return (
      <div>
        <div
          style={{
            fontSize: '18px',
            color: '#5d5d5d',
            height: '45px',
            verticalAlign: 'middle',
            lineHeight: '45px',
            padding: '0px 18px 0px 18px',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            width: '100%',
            overflowX: 'none'
          }}
        >
          {(this.props.currentFile && this.props.currentFile.title )||'Untitled'}
        </div>
        <div
          className='editor-wrapper'
          ref='previewPanel'
          id='previewPanel'
        >
          <ANotePreview
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              left: '0px',
              bottom: '0px'
            }}
            value={this.props.currentFile.content || ''}
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
