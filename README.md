---
nav:
  title: '通用组件'
  path: /components
group:
  path: /
---

## RouteSwitch

keep 包装后的组件 KeepRoute 必须传一个 location 属性，该属性的值为项目中用到的最外层 router 中的 location 才行，最外层 router 组件 HashRouter 或 BrowserRouter

如果不想使用路由缓存使用无须使用 keep 即可

### 生命周期函数

`onPageShow`与`onPageHide`函数一定要在 `useEffect`中使用或类组件的`componentDidMount`中使用，避免组件重复渲染时`onPageShow`与`onPageHide`被重复调用

例如

```jsx
useEffect(() => {
  function preventDefaultListener(event) {
    event.preventDefault();
  }
  onPageShow(() => {
    window.addEventListener('contextmenu', preventDefaultListener);
  });
  onPageHide(() => {
    window.removeEventListener('contextmenu', preventDefaultListener);
  });
}, []);
```

或

```jsx
componentDidMount() {
   onPageShow(() => {
    window.addEventListener('contextmenu', preventDefaultListener)
  })
  onPageHide(() => {
    window.removeEventListener('contextmenu', preventDefaultListener)
  })
}
```

### 使用方式

```jsx
import React from 'react';
import { Route ,withRouter} from 'react-router';
import { keep } from '@b1/components';

// 通过 withRouter 拿到 router 中的 location
const KeepRoute = withRouter(keep(Route))


<KeepRoute  exact path="/test" component={() => {}}/>
```

### 缓存控制

如果不想缓存某个组件时，比如项目中访问历史菜单被关闭时应取消对应 DOM 的缓存，此时可以传递一个 shouldKeep 函数来控制
