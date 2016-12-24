import React, {
  Component,
  PropTypes
} from 'react';
const marked = require('marked');
import renderFactory from '../../render_factory'

const defaultStyle = {
  backgroundColor: '#fff',
  overflowY: 'scroll'
}

class ANotePreview extends Component {
  constructor(props) {
    super(props);
    this.markedRenderer = renderFactory(this.props.rendererOptions);
    this.state = {
      style: Object.assign({}, defaultStyle, this.props.style || {})
    }
  }

  renderMarkdown() {
    return {
      __html: marked(this.props.value || '', {
        renderer: this.markedRenderer
      })
    }
  }

  setSize(width, height) {
    let newStyle = {};
    if(width)
      newStyle['width'] = width;
    if(height)
      newStyle['height'] = height;
    let style = Object.assign({}, this.state.style, newStyle);
    this.setState({
      style
    });
  }

  render() {
    return (
      <div
        style={this.state.style}
        className='anote-preview'
      >
        <div
          className='markdown-body editormd-preview-container'
          dangerouslySetInnerHTML={this.renderMarkdown()}
        ></div>
      </div>
    );
  }
}

ANotePreview.propTypes = {
  value: PropTypes.string,
  style: PropTypes.object,
  rendererOptions: PropTypes.object
}

export default ANotePreview;
