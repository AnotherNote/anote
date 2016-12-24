/* global $ */
import React, {
    Component,
    PropTypes,
} from 'react';
import autobind from 'autobind-decorator';
import ReactDom from 'react-dom';

@autobind
class NoteTitle extends Component {
  componentDidMount() {
    if (this.props.autoFocus) { $(ReactDom.findDOMNode(this.refs.input)).focus(); }
  }

  onChange(event) {
    if (this.props.onChange) {
      this.props.onChange(event);
    }
  }

  setValue(value) {
    $(ReactDom.findDOMNode(this.refs.input)).val(value);
  }

  focus() {
    // a chrome focus bug
    setTimeout(() => {
      if (this.refs.input) {
        this.refs.input.focus();
      }
    }, 1);
  }

  render() {
    return (
      <div>
        <input
          defaultValue={this.props.defaultValue}
          onChange={this.onChange}
          ref='input'
          placeholder='Untitled'
          style={this.props.style}
        />
      </div>
    );
  }
}

NoteTitle.propTypes = {
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};

export default NoteTitle;
