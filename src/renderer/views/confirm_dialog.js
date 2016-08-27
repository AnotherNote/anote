import React, {
  Component,
  PropTypes
} from 'react';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

export default class ConfirmDialog extends Component {
  render () {
    const actions = [
      <FlatButton
        primary={true}
        label={this.props.cancelString}
        onTouchTap={this.props.onCancel}
      />,
      <FlatButton
        label={this.props.okString}
        onTouchTap={(event) => { this.props.onOk(event, this.props.tmpData) }}
      />
    ];

    return (
      <div>
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={true}
          open={this.props.open}
        >
          {this.props.confirmString}
        </Dialog>
      </div>
    );
  }
}

ConfirmDialog.propTypes = {
  cancelString: PropTypes.string,
  okString: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  title: PropTypes.string,
  open: PropTypes.bool,
  confirmString: PropTypes.string,
  // the data is used for tmp data persistence
  tmpData: PropTypes.object
}
