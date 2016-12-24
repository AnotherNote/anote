import React, {
    Component,
    PropTypes
} from 'react';
import {
    Card,
    CardHeader,
    CardText
} from 'material-ui/Card';
import {
    Link,
    IndexLink
} from 'react-router';
import {
  ppDate,
  chineseDate,
  debounce
} from '../../util';
import {
    hashHistory
} from 'react-router';

class FilesList extends Component {
  constructor(props) {
    super(props);
    // this.debouncedLinkClick = debounce(this.linkClick, 200);
    this.debouncedLinkClick = this.linkClick;
  }

  componentWillUnmount() {
    if(this.debouncedLinkClick.cancel)
      this.debouncedLinkClick.cancel();
  }

  linkClick(pathname) {
    hashHistory.push({pathname: pathname, query: this.props.query})
  }

  render () {
    return (
      <div
        style={{marginTop: '95px'}}
      >
        {this.props.files.map((file, index) => {
          return (
            <Link
              to={{pathname: `/notes/${file._id}/edit`, query: this.props.query}}
              key={file._id}
              activeClassName='active'
              className='file-item'
              onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  this.debouncedLinkClick(`/notes/${file._id}/edit`);
                }}
            >
              <Card
                style={{
                  boxShadow: 'none',
                  border: '1px solid #eee',
                  marginTop: '1px',
                  marginBottom: '1px'
                }}
                onContextMenu={(event) => {event.stopPropagation();this.props.onContextMenu(file, index);}}
              >
                <CardHeader
                  title={file.title || 'Untitled'}
                  subtitle={ppDate(chineseDate(file.updatedAt || file.createdAt))}
                  showExpandableButton={true}
                  style={{
                    lineHeight: '18px',
                    fontSize: '16px'
                  }}
                />
                <CardText
                  expandable={true}
                  style={{
                    maxHeight: '50px',
                    overflow: 'hidden',
                    fontSize: '14px',
                    lineHeight: '16px'
                  }}
                >
                  {file.content || 'Enjoy Markdown! coding now'}
                </CardText>
              </Card>
            </Link>
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
