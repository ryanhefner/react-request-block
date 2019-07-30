# react-request-block

React component to compose requests within your components, with support for server-side rendered requests.

## Install

Via [npm](https://npmjs.com/package/react-request-block):

```sh
npm install -S react-request-block
```

Via [Yarn](https://yarn.fyi/react-request-block):

```sh
yarn add react-request-block
```

## How to use

`react-request-block` was built with a focus on simplicity and flexibility, and
with out-of-the-box support for use within server-side rendering frameworks
(more on that [below](#Using-Next-js)).

### `RequestBlockProvider`

The basic wrapper that provides caching for the nested `RequestBlock` instances and
the ability to provide a default `origin` to prepend onto the `RequestBlock` urls.

#### Properties

| Property         | Default                 | Description |
| ---------------- | ----------------------- | ----------- |
| `cache`          | `new RequestBlockCache` | `RequestBlockCache` instance for caching request made per provider. By default, a fresh cache instance is created if one is not supplied. |
| `options`        | `null`                  | Default options to be included with each request made by a `RequestBlock`. Can be ignored by adding `ignoreContextOptions` to `RequestBlock` instances. |
| `origin`         | `''`                    | Default origin to prepend to `RequestBlock` requests. Defaults to the current site’s protocol/host. |
| `renderPromises` | `null`                  | This is used strictly for server-side rendering instances. In most cases you shouldn’t worry about setting this, unless you need to. In which case, it accepts a `RenderPromises` instance. |

### `RequestBlock`

The `RequestBlock` is what you will be interacting with most. It makes it really
easy to compose requests into your pages and components and handles all the caching
for you behind the scenes. A simple alternative to achieving a similar thing
with `redux`/`react-redux`.

#### Properties

| Property               | Default                                     | Description  |
| ---------------------- | ------------------------------------------- | ------------ |
| `url`                  | `null`                                      | URL to make request to. If `origin` specified on `RequestBlockProvider`, `url` will be appended to it. |
| `options`              | `null`                                      | Options to include with `fetch` request made. All normal `fetch` options accepted. |
| `parser`               | `(data, props) => data`                     | Method for manipulating the response payload before it is applied to the `data` value. Handy for stripping out unwanted stuff, or making it more useable for your page or component. |
| `skip`                 | `false`                                     | Whether or not the request should be skipped during server-side rendering. |
| `ignoreContextOptions` | `false`                                     | Flag to ignore options set on the `RequestBlockProvider` for requests being made by `RequestBlock`. |
| `onRequest`            | `({ data, error, fetched, loading }) => {}` | Callback made when a request is initiated. |
| `onLoad`               | `({ data, error, fetched, loading }) => {}` | Callback made when request has successfull completed. |
| `onError`              | `({ data, error, fetched, loading }) => {}` | Callback made when a request encounters an error. |

### `withRequestBlock` (HOC)

Provides access to the current context of the `ReactRequestBlock`. Context passed to the wrapped component includes:

#### Properties

| Property         | Type                | Description |
| ---------------- | ------------------- | ----------- |
| `cache`          | `RequestBlockCache` | The current `RequestBlockCache` instance being used by the provider. |
| `options`        | `object` | `null`   | Default request options that have been set on the `RequestBlockProvider`. |
| `origin`         | `string`            | Origin to prepend to urls being requested by `RequestBlock` instances. |
| `renderPromises` | `RenderPromises`    | `RenderPromises` instance set for use during server-side rendering. |

## Examples

Below are a few examples of using the `RequestBlockProvider` and two ways you can
use the `RequestBlock`.

### `RequestBlockProvider`

```js
import React from 'react';
import { RequestBlockCache, RequestBlockProvider } from 'react-request-block';
import Page from './Page';  // @see Page component defined in `RequestBlock` example below

const App = () => (
  <RequestBlockProvider>
    <Router>
      <Switch>
        <Route path="/:slug*" component={Page} />
      </Switch>
    </Router>
  </RequestBlockProvider>
);

export default App;
```

### `RequestBlock` (wrapping content)

In this example, the `RequestBlock` components allows you to structure requests
right into your pages or components.

```js
import React from 'react';
import { RequestBlock } from 'react-request-block';

const Page = (props) => (
  <RequestBlock url="[your endpoint here]">
    {({data, error, fetched, loading}) => {
      if (loading || !fetched) {
        return null;
      }

      if (error) {
        console.error(error);
        return null;
      }

      if (!data) {
        return <p>Page does not exist.</p>;
      }

      // See the Contentful query response
      console.debug(data);

      // Process and pass in the loaded `data` necessary for your page or child components.
      return (
        ...
      );
    }}
  </RequestBlock>
);

export default Page;
```

### `RequestBlock` (w/ callbacks)

```js
import React, { Component } from 'react';
import { RequestBlock } from 'react-request-block';

class Page extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: null,
      error: null,
    };

    this.onRequest = this.onRequest.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onError = this.onError.bind(this);
  }

  onRequest() {
    this.setState({
      loading: true,
    });
  }

  onLoad({ data }) {
    this.setState({
      loading: false,
      data,
    });
  }

  onError({ error }) {
    this.setState({
      loading: false,
      error,
    });
  }

  render() {
    return (
      <React.Fragment>
        <RequestBlock
          url="[your endpoint here]"
          onRequest={this.onRequest}
          onLoad={this.onLoad}
          onError={this.onError}
        />
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {data && [something that uses data]}
      </React.Fragment>
    );
  }
}

export default Page;
```

## Using Next.js?

If you like what you see above, you might like [next-request-block](https://github.com/ryanhefner/next-request-block),
which lets you easily add `react-request-block` to your Next.js app. Making it easy
to ensure that all your `RequestBlock` instances render awesomely server-side.

## License

[MIT](LICENSE) © [Ryan Hefner](https://www.ryanhefner.com)
