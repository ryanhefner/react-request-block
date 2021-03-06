import React, { Component } from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import merge from 'deepmerge';
import withRequestBlock from './withRequestBlock';

const fetch = require('node-fetch');

class RequestBlock extends Component {
  constructor(props) {
    super(props);

    const data = this.checkCache(props);

    this.state = {
      fetched: !!data,
      loading: false,
      error: null,
      data,
    };

    if (data) {
      props.onLoad(this.state);
    }
  }

  componentDidMount() {
    if (!this.state.data) {
      this.requestData();
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
      this.setState({
        fetched: false,
      }, () => {
        this.requestData();
      });
    }
  }

  async validateRequestRequirements() {
    return new Promise((resolve, reject) => {
      const {
        url,
        requestBlock,
      } = this.props;

      // Check for contentful context
      warning(requestBlock, 'No requestBlock context passed to <RequestBlock />');

      if (!requestBlock) {
        return reject('No requestBlock context passed to <RequestBlock />');
      }

      warning(url, 'url prop not set on <RequestBlock />');

      if (!url) {
        return reject('url prop not set on <RequestBlock />');
      }

      return resolve(true);
    });
  }

  checkCache(props) {
    const {
      requestBlock,
      parser,
    } = props;

    if (!requestBlock) {
      return null;
    }

    if (!requestBlock.cache) {
      return null;
    }

    const cacheKey = this.generateCacheKey(props);
    const cache = requestBlock.cache.has(cacheKey) && requestBlock.cache.read(cacheKey);

    return cache ? parser(cache, props) : null;
  }

  requestOptions(props) {
    const {
      ignoreContextOptions,
      requestBlock,
      options,
    } = props;

    if (requestBlock && !ignoreContextOptions) {
      const { options: contextOptions } = requestBlock;

      return merge(contextOptions || {}, options || {});
    }

    return options;
  }

  generateCacheKey(props) {
    const {
      requestBlock,
      url,
    } = props;

    if (!requestBlock) {
      return null;
    }

    return JSON.stringify({url, options: this.requestOptions(props)});
  }

  async fetchData() {
    if (this.props.skip) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const {
        requestBlock,
        url,
      } = this.props;

      this.validateRequestRequirements().then(async () => {
        const {
          cache,
          origin,
          renderPromises,
        } = requestBlock;

        const cacheKey = this.generateCacheKey(this.props);
        const cacheEntry = cache.has(cacheKey) && cache.read(cacheKey);

        if (cacheEntry) {
          return cacheEntry;
        }

        const options = this.requestOptions(this.props);

        function makeRequest(url, options) {
          return fetch(url, options)
            .then(async response => {

              const json = await response.json();
              cache.write(cacheKey, json);

              return json;
            });
        }

        const originRegex = /^((http)?(s)?(:)?)\/\//;
        const request = makeRequest(`${originRegex.test(url) ? '' : (origin || '')}${url}`, options);

        if (!cache.ssrMode) {
          cache.write(cacheKey, request);
        }

        const response = await request;

        if (renderPromises) {
          renderPromises.registerSSRObservable(this, response);
        }

        return response;
      })
      .then(resolve)
      .catch(reject);
    });
  }

  requestData() {
    const {
      parser,
      onRequest,
      onLoad,
      onError,
    } = this.props;

    this.validateRequestRequirements().then(() => {
      this.setState({
        error: null,
        loading: true,
      }, async () => {
        onRequest(this.state);

        this.fetchData().then(response => {
          this.setState({
            data: parser(response, this.props),
            fetched: true,
            loading: false,
          }, () => {
            onLoad(this.state);
          });
        });
      });
    })
    .catch(error => {
      this.setState({
        error,
        fetched: true,
        loading: false,
      }, () => {
        onError(this.state);
      });
    });
  }

  getResult() {
    return this.state;
  }

  render() {
    const {
      children,
      requestBlock,
    } = this.props;

    const finish = () => children(this.getResult());

    if (requestBlock && requestBlock.renderPromises) {
      return requestBlock.renderPromises.addPromise(this, finish);
    }

    return finish();
  }
}

RequestBlock.propTypes = {
  children: PropTypes.func,
  ignoreContextOptions: PropTypes.bool,
  url: PropTypes.string,
  options: PropTypes.object,
  parser: PropTypes.func,
  skip: PropTypes.bool,
  onError: PropTypes.func,
  onLoad: PropTypes.func,
  onRequest: PropTypes.func,
};

RequestBlock.defaultProps = {
  children: ({data, error, fetched, loading}) => null,
  ignoreContextOptions: false,
  skip: false,
  parser: (data, props) => data,
  onError: ({ data, error, fetched, loading }) => {},
  onLoad: ({ data, error, fetched, loading }) => {},
  onRequest: ({ data, error, fetched, loading }) => {},
};

export default withRequestBlock(RequestBlock);
