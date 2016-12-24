import React, {
    Component,
    PropTypes
} from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import {
    GridList,
    GridTile
} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import Settings from 'material-ui/svg-icons/action/settings';
import IconMenu from 'material-ui/IconMenu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import constants from '../../constants';
import {
    key2path,
    throttle
} from '../../util';
import {
    Link
} from 'react-router';
const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: '20px'
  },
  gridList: {
    width: '90%',
    overflowY: 'auto',
    marginBottom: 24
  },
};

// props {callbacks, books}
class BooksList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridCols: 4
    }
    this.throttledGridCols = throttle(this.gridCols, 10);
  }

  componentDidMount() {
    // add a throttle process
    window.addEventListener('resize', this.gridCols);
  }

  componentWillUnmount() {
    if(this.throttledGridCols)
      this.throttledGridCols.cancel();
  }

  // for better performance
  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  gridCols() {
    if(!this.refs.listRoot)
      return
    let width = this.refs.listRoot.getBoundingClientRect().width;
    // js switch add true when in case use less or greater than
    switch (true) {
      case width > 800:
        this.setState({
          gridCols: 4
        });
        break;
      case width > 600:
        this.setState({
          gridCols: 3
        });
        break;
      case width > 400:
        this.setState({
          gridCols: 2
        });
        break;
      default:
        this.setState({
          gridCols: 1
        });
    }
  }

  handleMenuChange(event, value, book) {
    // edit
    if(parseInt(value) == 1){
      console.log('edit book');
      this.props.callbacks.editBook(book);
    // delete
    }else if (parseInt(value) == 2){
      this.props.callbacks.delBook(book);
    }
  }

  render() {
    return (
      <div style={styles.root} ref='listRoot'>
        <GridList
          cellHeight={200}
          style={styles.gridList}
          cols={this.state.gridCols}
          padding={20}
        >
          {this.props.books.map((book) => {
            return (
                      <GridTile
                          key={book._id}
                          title={book.name}
                          subtitle={<span><b>{book.filesCount} Notes</b></span>}
                          actionIcon={
                            <IconMenu
                              iconButtonElement={<IconButton><Settings color="white" /></IconButton>}
                              onChange={(event, value) => { event.stopPropagation(); this.handleMenuChange(event, value, book)}}
                              value={0}
                            >
                              <MenuItem value="1" primaryText="Edit..." />
                              <MenuItem value="2" primaryText="Move To Trash..." />
                            </IconMenu> }
                          cols={1}
                          className='book-item'
                          onContextMenu={(event) => {event.stopPropagation();this.props.callbacks.onContextMenu(event, book);}}
                        >
                        <img
                          onClick={(event) => {this.props.callbacks.jumpToNotes({pathname: '/notes', query: {bookId: book._id, bookName: book.name, available: true}})}}
                          src={book.imagePath != '' ? key2path(book.imagePath) : constants.TMP_IMAGE_PATH}
                        />
                      </GridTile>
                    )
          })}
        </GridList>
      </div>
    );
  }
}

BooksList.propTypes = {
  books: PropTypes.array,
  callbacks: PropTypes.object
};

export default BooksList;
