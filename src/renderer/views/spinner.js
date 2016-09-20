import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';

const style = {
  container: {
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: '0px',
    bottom: '0px',
    background: '#fff',
    zIndex: 900
  },
  center: {
    margin: 'auto',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '60px',
    height: '60px'
  },
  refresh: {
    display: 'inline-block',
    position: 'relative',
    zIndex: 1000
  },
};

const Spinner = (props) => (
  props.show ?
    <div style={style.container}>
      <div style={style.center}>
        <RefreshIndicator
          size={60}
          left={0}
          top={0}
          status="loading"
          style={style.refresh}
        />
      </div>
    </div>
  :
    <div/>
);

export default Spinner;
