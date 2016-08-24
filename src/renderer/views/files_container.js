import React, { Component } from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import { listFiles, addFile, delFile, concatFiles, updateFile, activeFile } from '../actions';
import { files, books, tags } from '../../main/set_db';
import FilesList from './files_list';

const mapStateToProps = (state) => {
  return {
    files: state.files,
    currentFile: state.activeFile
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addFile: (file) => {
      dispatch(addFile(file));
    },
    listFiles: (files) => {
      dispatch(listFiles(files));
    },
    delFile: (file) => {
      dispatch(delFile(file));
    },
    concatFiles: (files) => {
      dispatch(concatFiles(files));
    },
    updateFile: (file) => {
      dispatch(updateFile(file));
    },
    activeFile: (file) => {
      dispatch(activeFile(file));
    }
  }
}

class FilesContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let that = this;
    let searchConditions = null;
    let sortConditions = { 'updatedAt': -1 };
    if(this.props.location.query.bookId) {
      searchConditions = { bookId: this.props.location.query.bookId };
    }else if(this.props.location.query.searchFileText) {
      searchConditions = { $or: [ { title: { $regex: new RegExp(this.props.location.query.searchFileText, 'i') } }, { content: { $regex: new RegExp(this.props.location.query.searchFileText, 'i') } } ] };
    }else {
      searchConditions = {};
    }
    files.find(searchConditions).sort(sortConditions).exec( (err, fls) => {
      if(err)
        throw new Error('search file error');
      that.props.listFiles(fls);
      console.log(fls);
    });
  }

  render() {
    return (
      <div className='work-wrapper'>
        <div className='sec-sidebar'>
          <FilesList
            files={this.props.files}
          />
        </div>
        <div className='work-pane'>workpane</div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilesContainer);
