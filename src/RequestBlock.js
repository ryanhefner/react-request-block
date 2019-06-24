import React, { Component } from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import withRequestBlock from './withRequestBlock';

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
      warning(requestBlock, 'No requestBlock context passed to <Request />');

      if (!requestBlock) {
        return reject('No requestBlock context passed to <Request />');
      }

      warning(url, 'url prop not set on <Request />');

      if (!url) {
        return reject('url prop not set on <Request />');
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

  generateCacheKey(props) {
    const {
      requestBlock,
      url,
      options,
    } = props;

    if (!requestBlock) {
      return null;
    }

    return JSON.stringify({url, options});
  }

  async fetchData() {
    if (this.props.skip) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const {
        requestBlock,
        url,
        options,
      } = this.props;

      this.validateRequestRequirements().then(() => {
        const {
          cache,
          renderPromises,
        } = requestBlock;

        const cacheKey = this.generateCacheKey(this.props);
        const cacheEntry = cache.has(cacheKey) && cache.read(cacheKey);

        if (cacheEntry) {
          return cacheEntry;
        }

        const request = fetch(url, options)
          .then(async response => {
            cache.write(cacheKey, response);

            return await response.json();
          });

        if (!cache.ssrMode) {
          cache.write(cacheKey, request);
        }

        if (renderPromises) {
          renderPromises.registerSSRObservable(this, request);
        }

        return request;
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

  getQueryResult() {
    return this.state;
  }

  render() {
    const {
      children,
      requestBlock,
    } = this.props;

    const finish = () => children(this.getQueryResult());

    if (requestBlock && requestBlock.renderPromises) {
      return requestBlock.renderPromises.addQueryPromise(this, finish);
    }

    return finish();
  }
}

RequestBlock.propTypes = {
  children: PropTypes.func,
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
  skip: false,
  parser: (data, props) => data,
  onError: () => {},
  onLoad: () => {},
  onRequest: () => {},
};

export default withRequestBlock(RequestBlock);
