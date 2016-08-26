import React, { Component, PropTypes } from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import { Link, IndexLink } from 'react-router';


class FilesList extends Component {
  render () {
    return (
      <div style={{marginTop: '43px'}}>
        {this.props.files.map((file) => {
          return (
            <Link
              to={{pathname: `/notes/${file._id}/edit`, query: this.props.query}}
              key={file._id}
              activeClassName='active'
            >
              <Card
                style={{boxShadow: 'none', border: '1px solid #eee', marginTop: '1px', marginBottom: '1px'}}
              >
                <CardHeader
                  title={file.title || 'Untitled'}
                  subtitle="Subtitle"
                  showExpandableButton={true}
                />
                <CardText expandable={true} style={{maxHeight: '50px', overflow: 'hidden'}}>
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
