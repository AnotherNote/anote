import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/Paper'

class FilesList extends Component {
  render () {
    return (
      <div>
        {this.props.files.map((file) => {
          return (
            <Paper
              style={style}
              zDepth={1}
              rounded={false}
              children={<span>xxxxx</span>}
            />
          );
        })}
      </div>
    );
  }
}


FilesList.propTypes = {
  files: PropTypes.array,
  callbacks: PropTypes.object
}

export default FilesList;
