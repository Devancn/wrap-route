import React from 'react'
import PropTypes from 'prop-types'
import matchPath from './matchPath'



const NORMAL = Symbol('NORMAL')
const SHOW = Symbol('SHOW')
const HIDE = Symbol('HIDE')
export const KeepContext = React.createContext(null)

export default function keep(Route) {

  return class extends React.Component {
    showPageCallbacks = []
    hidePageCallbacks = []
    routePhase = NORMAL
    state = {
      matched: null,
      pageRoot: null
    }
    static propTypes = {
      location: PropTypes.object.isRequired,
      shouldKeep: PropTypes.func
    }
    static getDerivedStateFromProps({ location, ...rest }) {
      return {
        matched: matchPath(location.pathname, rest)
      }
    }
    shouldComponentUpdate(nextProps, nextState) {
      let isKeep = true;
      const pageRoot = this.state.pageRoot;
      const { shouldKeep, location, ...rest } = nextProps;
      if (typeof shouldKeep === 'function') {
        isKeep = shouldKeep({
          root: pageRoot,
          match: function (pathname) {
            return matchPath(pathname, rest)
          }, path: nextProps.path
        })
      }
      if (!isKeep) {
        return true;
      }
      let shouldUpdate = Boolean(nextState.matched);
      if (pageRoot) {
        if (this.routePhase === NORMAL || !this.state.matched && shouldUpdate && this.routePhase === HIDE) {
          this.routePhase = SHOW
          pageRoot.style.display = 'block'
          shouldUpdate = false
          this.showPageCallbacks.forEach(callback => callback.call(null))
        } else if (this.state.matched && !shouldUpdate && this.routePhase === SHOW) {
          this.routePhase = HIDE
          pageRoot.style.display = 'none'
          this.hidePageCallbacks.forEach(callback => callback.call(null))
        }
      }
      return shouldUpdate
    }
    savePageRoot = (pageRoot) => {
      if (pageRoot) {
        this.setState({ pageRoot })
      }
    }
    onPageShow = (callback, isImmediate = true) => {
      if (typeof callback === 'function' && this.showPageCallbacks.indexOf(callback) === -1) {
        this.showPageCallbacks.push(callback)
      }
      if (isImmediate && this.routePhase === SHOW) {
        this.showPageCallbacks.forEach(callback => callback.call(null))
      }
    }
    onPageHide = (callback) => {
      if (typeof callback === 'function') {
        this.hidePageCallbacks.push(callback)
      }
    }
    render() {
      const { matched, pageRoot } = this.state;
      return matched ? <div className={this.props.path} ref={this.savePageRoot} style={{ height: '100%' }}>
        <KeepContext.Provider value={{ matched, pageRoot, onPageShow: this.onPageShow, onPageHide: this.onPageHide }}>
          {<Route {...this.props} />}
        </KeepContext.Provider>
      </div> : null
    }
  }
}