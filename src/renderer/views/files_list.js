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
  chineseDate
} from '../../util';

class FilesList extends Component {
  render () {
    return (
      <div
        style={{marginTop: '43px'}}
      >
        {this.props.files.map((file) => {
          return (
            <Link
              to={{pathname: `/notes/${file._id}/edit`, query: this.props.query}}
              key={file._id}
              activeClassName='active'
              className='file-item'
            >
              <Card
                style={{
                  boxShadow: 'none',
                  border: '1px solid #eee',
                  marginTop: '1px',
                  marginBottom: '1px'
                }}
                onContextMenu={(event) => {event.stopPropagation();this.props.onContextMenu(file);}}
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
                  {file.content || 'Enjoy Markdonw! coding now'}
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
