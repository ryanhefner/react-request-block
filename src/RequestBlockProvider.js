import React, { Component } from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import RequestBlockCache from './RequestBlockCache';
import RequestBlockContext from './RequestBlockContext';

class RequestBlockProvider extends Component {
  constructor(props) {
    super(props);

    const {
      cache,
      origin,
      renderPromises,
    } = props;

    this.state = {
      cache: cache || (new RequestBlockCache()),
      origin,
      renderPromises,
    };
  }

  render() {
    const Context = this.props.context || RequestBlockContext;

    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }
}

RequestBlockProvider.propTypes = {
  children: PropTypes.any,
  cache: PropTypes.object,
  context: PropTypes.object,
  origin: PropTypes.string,
  renderPromises: PropTypes.object,
};

export default RequestBlockProvider;
