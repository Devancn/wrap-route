import React from 'react'
import PropTypes from 'prop-types'
import matchPath from './matchPath'



export const KeepContext = React.createContext(null)

export default function keep(Route) {
  return class extends React.Component {
    state = {
      match: null,
      pageRoot: null
    }
    static propTypes = {
      location: PropTypes.object.isRequired,
      shouldKeep: PropTypes.func
    }
    static getDerivedStateFromProps({ location, ...rest }) {
      return {
        match: matchPath(location.pathname, rest)
      }
    }
    shouldComponentUpdate(nextProps, nextState) {
      let isKeep = true;
      const { shouldKeep, location, ...rest } = nextProps;
      if (typeof shouldKeep === 'function') {
        isKeep = shouldKeep({
          root: this.state.pageRoot,
          matcher: function (pathname) {
            return matchPath(pathname, rest)
          }, path: nextProps.path
        })
      }
      if (!isKeep) {
        return true;
      }
      const shouldUpdate = Boolean(nextState.match);
      this.rootSwitch(shouldUpdate);
      if (shouldUpdate) {
        const pageRoot = this.state.pageRoot;
        if (pageRoot && pageRoot.style.display === 'none') {
          return false;
        }
      }
      return shouldUpdate
    }
    rootSwitch(shouldUpdate) {
      const dom = this.state.pageRoot
      if (dom) {
        if (shouldUpdate) {
          const display = dom.style.display;
          if (display === 'none') {
            dom.style.display = 'block'
          }
        } else {
          dom.style.display = 'none'
        }
      }
    }
    savePageRoot = (pageRoot) => {
      if (pageRoot) {
        this.setState({ pageRoot })
      }
    }
    render() {
      const { match, pageRoot } = this.state;
      return match ? <div ref={this.savePageRoot} style={{ height: '100%' }}>
        <KeepContext.Provider value={{ match, pageRoot }}>
          {<Route {...this.props} />}
        </KeepContext.Provider>
      </div> : null
    }
  }
}