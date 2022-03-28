import * as React from 'react';
import matchPath, { matchPathValues } from './matchPath';

enum Phase {
  NORMAL,
  SHOW,
  HIDE,
}

interface ShouldKeepParams {
  root: HTMLElement;
  match: (pathname: string) => matchPathValues;
}

interface KeepRouteProps {
  path: string;
  shouldKeep: (params: ShouldKeepParams) => boolean;
  [key: string]: any;
}

interface KeepRouteState {
  matched: null | matchPathValues;
  pageRoot: null | HTMLElement;
}

export interface KeepContextState extends KeepRouteState {
  onPageShow: (callback: () => void, isImmediate: boolean) => void;
  onPageHide: (callback: () => void) => void;
}

export const KeepContext = React.createContext < KeepContextState > (null);

export default function keep(Route: React.ElementType) {
  return class extends React.Component<KeepRouteProps, KeepRouteState> {
    showPageCallbacks = [];
    hidePageCallbacks = [];
    routePhase: Phase = Phase.NORMAL;
    state = {
      matched: null,
      pageRoot: null,
    };
    static getDerivedStateFromProps({ location, ...rest }) {
      return {
        matched: matchPath(location.pathname, rest),
      };
    }
    shouldComponentUpdate(nextProps, nextState) {
      let isKeep = true;
      const pageRoot = this.state.pageRoot;
      const { shouldKeep, location, ...rest } = nextProps;
      if (typeof shouldKeep === 'function') {
        isKeep = shouldKeep({
          root: pageRoot,
          match: function (pathname) {
            return matchPath(pathname, rest);
          },
          path: nextProps.path,
        });
      }
      if (!isKeep) {
        return true;
      }
      let shouldUpdate = Boolean(nextState.matched);
      if (pageRoot) {
        if (
          this.routePhase === Phase.NORMAL ||
          (!this.state.matched &&
            shouldUpdate &&
            this.routePhase === Phase.HIDE)
        ) {
          this.routePhase = Phase.SHOW;
          pageRoot.style.display = 'block';
          shouldUpdate = false;
          this.showPageCallbacks.forEach(callback => callback.call(null));
        } else if (
          this.state.matched &&
          !shouldUpdate &&
          this.routePhase === Phase.SHOW
        ) {
          this.routePhase = Phase.HIDE;
          pageRoot.style.display = 'none';
          this.hidePageCallbacks.forEach(callback => callback.call(null));
        }
      }
      return shouldUpdate;
    }
    savePageRoot = (pageRoot: HTMLElement) => {
      if (pageRoot) {
        this.setState({ pageRoot });
      }
    };
    onPageShow = (callback, isImmediate = true) => {
      if (
        typeof callback === 'function' &&
        this.showPageCallbacks.indexOf(callback) === -1
      ) {
        this.showPageCallbacks.push(callback);
      }
      if (isImmediate && this.routePhase === Phase.SHOW) {
        this.showPageCallbacks.forEach(callback => callback.call(null));
      }
    };
    onPageHide = callback => {
      if (
        typeof callback === 'function' &&
        this.hidePageCallbacks.indexOf(callback) === -1
      ) {
        this.hidePageCallbacks.push(callback);
      }
    };
    render() {
      const { matched, pageRoot } = this.state;
      return matched ? (
        <div
          className={this.props.path}
          ref={this.savePageRoot}
          style={{ height: '100%' }}
        >
          <KeepContext.Provider
            value={{
              matched,
              pageRoot,
              onPageShow: this.onPageShow,
              onPageHide: this.onPageHide,
            }}
          >
            {<Route {...this.props} />}
          </KeepContext.Provider>
        </div>
      ) : null;
    }
  };
}
