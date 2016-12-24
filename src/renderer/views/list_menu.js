import React, {
  Component,
  PropTypes,
} from 'react';
import autobind from 'autobind-decorator';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';
import DoneIcon from 'material-ui/svg-icons/action/done';

@autobind
export default class ListMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedId: null,
    };
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      checkedId: null,
    });
  }

  selectDataItem(event, checkedId) {
    console.log('selectDataItem');
    console.log(checkedId);
    this.setState({
      checkedId,
    });
  }

  borderStyle(dataItem) {
    if (dataItem.id === this.state.checkedId) {
      return '1.5px #d1c091 solid';
    }
    return 'none';
  }

  render() {
    const actions = [
      <FlatButton
        primary={true}
        label={this.props.cancelString}
        onTouchTap={this.props.onCancel}
      />,
      <FlatButton
        label={this.props.okString}
        onTouchTap={(event) => { this.props.onOk(event, this.state.checkedId, this.props.tmpData); }}
        disabled={this.state.checkedId === null}
      />,
    ];

    return (
      <div>
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={true}
          open={this.props.open}
          autoScrollBodyContent={true}
        >
          <List>
            {
              this.props.dataList.map((dataItem, index) => (
                  this.props.filterFunc(dataItem, this.props.dataItem) ?
                    <ListItem
                      key={dataItem.id}
                      primaryText={dataItem.name}
                      leftIcon={<DoneIcon/>}
                    /> :
                    <ListItem
                      style={{
                        border: this.borderStyle(dataItem),
                      }}
                      key={dataItem.id}
                      primaryText={dataItem.name}
                      insetChildren={true}
                      onTouchTap={(event) => { this.selectDataItem(event, dataItem.id); }}
                    />
                ))
            }
          </List>
        </Dialog>
      </div>
    );
  }
}

ListMenu.propTypes = {
  cancelString: PropTypes.string,
  okString: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  title: PropTypes.string,
  open: PropTypes.bool,
  dataList: PropTypes.array,
  dataItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  filterFunc: PropTypes.func,
};
