import React from 'react';
import matchPath from './match-path';
export const WrapContext = /*#__PURE__*/React.createContext();
export default function wrapRoute(RouteComponent) {
  return class extends React.Component {
    static defaultProps = {
      enableKeep: true
    };

    static getDerivedStateFromProps({
      location,
      ...rest
    }) {
      return {
        isMatched: !!matchPath(rest, location.pathname)
      };
    }

    rootDOM = null;
    state = {
      isMatched: false
    };

    shouldComponentUpdate(nextProps, nextState) {
      if (!nextProps.enableKeep) return true;
      this.switchRoute();
      return nextState.isMatched;
    }

    switchRoute() {
      if (this.rootDOM) {
        if (this.state.isMatched) {
          const display = this.rootDOM.style.display;

          if (display === 'none') {
            this.rootDOM.style.display = 'block';
          }
        } else {
          this.rootDOM.style.display = 'none';
        }
      }
    }

    saveDOM(element) {
      this.rootDOM = element;
    }

    render() {
      return this.state.isMatched ? /*#__PURE__*/React.createElement("div", {
        ref: this.saveDOM
      }, /*#__PURE__*/React.createElement(WrapContext.Provider, {
        value: {
          isMatched: this.state.isMatched,
          pageRoot: this.rootDOM
        }
      }, /*#__PURE__*/React.createElement(RouteComponent, this.props))) : null;
    }

    componentWillUnmount() {
      if (this.rootDOM) {
        this.rootDOM = null;
      }
    }

  };
}