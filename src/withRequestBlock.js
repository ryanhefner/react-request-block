import React from 'react';
import PropTypes from 'prop-types';
import hoistStatics from 'hoist-non-react-statics';
import { getDisplayName } from './hoc-utils';
import RequestBlockContext from './RequestBlockContext';

/**
 * A public higher-order component to access the imperative API
 */
function withRequestBlock(Component) {
  const C = props => {
    const { wrappedComponentRef, ...remainingProps } = props;

    return (
      <RequestBlockContext.Consumer>
        {context => {
          return (
            <Component
              {...remainingProps}
              requestBlock={context}
              ref={wrappedComponentRef}
            />
          );
        }}
      </RequestBlockContext.Consumer>
    );
  };

  C.context = RequestBlockContext;
  C.displayName = `withRequestBlock(${getDisplayName(Component)})`;
  C.WrappedComponent = Component;

  return hoistStatics(C, Component);
}

export default withRequestBlock;
