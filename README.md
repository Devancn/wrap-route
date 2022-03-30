### 介绍

KeepRoute 是一个传递一个 Route 组件返回新的组件的高阶组件函数，由于 React Router v6 与 v5 版本差异较大，使用方式也不同，目前不支持 v6 的使用。 React Router 只会渲染与当前路由匹配的组件，KeepRoute 可以控制路由组件渲染过后路由切换时是否不卸载对应的路由组件，通过 `display: none` 隐藏已渲染的路由组价

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

如果不想缓存某个路由组件时，比如项目中访问历史菜单被关闭时应取消对应 DOM 的缓存，此时可以传递一个 shouldKeep 函数来控制

```js
const shouldKeep = useCallback(({ match }) => {
    const tagList = sessionStorage.getItem('tagNavList');
    if (typeof tagList === 'string' && tagList !== '') {
      const list = JSON.parse(tagList) || [];
      return list.some(item => match(item.pathname))
    }
    return true;
  }, [])

  <KeepRoute  exact path="/test" component={() => {}} shouldKeep={({match}) => {
      // tagList 用来存储访问的历史菜单
      return tagList.some(item => match(item.pathname))
  }}/>
```

### API 属性

| 参数           | 说明                            | 类型                                    | 默认值 |
| -------------- | ------------------------------- | --------------------------------------- | ------ |
| location       | React Router 中的 location 对象 | Location                                | -      |
| containerStyle | 路由组件根元素的样式            | CSSProperties                           | -      |
| shouldKeep     | 控制路由组件是否缓存            | (_params_: ShouldKeepParams) => boolean | -      |

> 注意： location 一定要是 React Router 中提供的 location 对象，不要使用 window.location, 不然路由缓存失效。
>
> 其余属性与 React Router v5 中的 Route 组件一致
