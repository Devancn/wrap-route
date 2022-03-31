import * as React from 'react';
import matchPath, { matchPathValues } from './matchPath';

enum Phase {
  NORMAL,
  SHOW,
  HIDE
}

interface ShouldKeepParams {
  root: HTMLElement;
  match: (pathname: string) => matchPathValues;
}

interface Location {
  state: unknown;
  key: string;
  pathname: string;
  search: string;
  hash: string;
}

interface KeepRouteProps {
  location: Location;
  containerStyle?: React.CSSProperties;
  shouldKeep?: (params: ShouldKeepParams) => boolean;
  [key: string]: any;
}

interface KeepRouteState {
  matched: null | matchPathValues;
  pageRoot: null | HTMLElement;
}

type lifeCycleType = (callback: () => void) => void;
export interface KeepContextState extends KeepRouteState {
  onPageShow: lifeCycleType;
  onPageHide: lifeCycleType;
}

export const KeepContext = React.createContext<KeepContextState>(null);

export function useOnPageShow(callback: () => void) {
  const { onPageShow } = React.useContext(KeepContext);
  React.useEffect(() => {
    onPageShow(callback);
  }, []);
}

export function useOnPageHide(callback: () => void) {
  const { onPageHide } = React.useContext(KeepContext);
  React.useEffect(() => {
    onPageHide(callback);
  }, []);
}

export default function keep(Route: React.ElementType) {
  return class extends React.Component<KeepRouteProps, KeepRouteState> {
    showPageCallbacks = [];
    hidePageCallbacks = [];
    routePhase: Phase = Phase.NORMAL;
    state = {
      matched: null,
      pageRoot: null
    };
    static getDerivedStateFromProps({ location, ...rest }) {
      return {
        matched: matchPath(location.pathname, rest)
      };
    }
    shouldComponentUpdate(nextProps, nextState) {
      let isKeep = true;
      const { pageRoot } = this.state;
      const { shouldKeep, location, ...rest } = nextProps;
      if (typeof shouldKeep === 'function') {
        isKeep = shouldKeep({
          root: pageRoot,
          match: pathname => matchPath(pathname, rest),
          path: nextProps.path
        });
      }
      if (!isKeep) {
        return true;
      }
      let shouldUpdate = Boolean(nextState.matched);
      if (pageRoot) {
        if (
          this.routePhase === Phase.NORMAL ||
          (!this.state.matched && shouldUpdate && this.routePhase === Phase.HIDE)
        ) {
          this.routePhase = Phase.SHOW;
          pageRoot.style.display = 'block';
          shouldUpdate = false;
          this.showPageCallbacks.forEach(callback => callback.call(null));
        } else if (this.state.matched && !shouldUpdate && this.routePhase === Phase.SHOW) {
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
    onPageShow = callback => {
      if (typeof callback === 'function' && this.showPageCallbacks.indexOf(callback) === -1) {
        this.showPageCallbacks.push(callback);
      }
      if (this.routePhase === Phase.SHOW) {
        this.showPageCallbacks.forEach(cb => cb.call(null));
      }
    };
    onPageHide = callback => {
      if (typeof callback === 'function' && this.hidePageCallbacks.indexOf(callback) === -1) {
        this.hidePageCallbacks.push(callback);
      }
    };
    render() {
      const { matched, pageRoot } = this.state;
      const { containerStyle = {} } = this.props;
      return matched ? (
        <div className={this.props.path} ref={this.savePageRoot} style={{ height: '100%', ...containerStyle }}>
          <KeepContext.Provider
            value={{
              matched,
              pageRoot,
              onPageShow: this.onPageShow,
              onPageHide: this.onPageHide
            }}
          >
            {<Route {...this.props} />}
          </KeepContext.Provider>
        </div>
      ) : null;
    }
  };
}
