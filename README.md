
keep 包装后的组件 KeepRoute 必须传一个 location 属性，该属性的值为项目中用到的最外层 router 中的 location 才行，最外层 router 组件 HashRouter 或 BrowserRouter

如果不想使用路由缓存使用无须使用 keep 即可

```jsx
import React from 'react';
import { Route ,withRouter} from 'react-router';
import keep from 'wrapRoute';

// 通过 withRouter 拿到 router 中的 location
const KeepRoute = withRouter(keep(Route))


<KeepRoute  exact path="/test" component={() => {}}/>
```