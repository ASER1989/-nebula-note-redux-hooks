# @nebula-note/redux-hooks

[【English】](./README.md)


@nebula-note/redux-hooks是一个基于redux、react-redux、@reduxjs/toolkit实现的完全通过hooks管理状态的轻量级解决方案。没有 actions，没有 reducers，只有hooks.

## 使用指南
### 安装
``` 
npm i @nebula-note/redux-hooks 
```

或
```
 yarn add @nebula-note/redux-hooks
 ```

### configureStore

configureStore 接受的参数与 @reduxjs/toolkit 中的 configureStore 参数相同。如果你的项目已经在使用 @reduxjs/toolkit，可以轻松切换过来。

``` typescript
import { configureStore } from '@nebula-note/redux-hooks';
const store = configureStore();
```

### useRedux

useRedux 的使用方式类似于 React 的 useState，不过多了一个状态名称参数。在下面的代码中，REDUX_KEY 对应 Redux 状态中的状态名称，等同于 @reduxjs/toolkit 中 createSlice 的 name 参数。使用相同REDUX_KEY可以轻松的在不同的页面或组件中共享状态数据。

``` typescript
import { useRedux } from '@nebula-note/redux-hooks';

const REDUX_KEY = 'exampleReduxName';
type ExampleState = {
    count:number
}

export const useExampleRedux = () => {
     const { state, setState } = useRedux<ExampleState>(REDUX_KEY, {count:0});
     
     const handleAdd = () => {
        setState(state.count+1);
     }
     
     const handleReduce = ()=>{
        setState(state.count-1);
     }
        
     return(
        <div style={{display:'flex'}}>
            <button onclick={handleAdd}>+</button>
            <div>{state.count}</div>
            <button onclick={handleReduce}>-</button>
        </div>
     )
}

```

## Methods and Properties

以下是 useRedux 提供的方法和属性：

### state

状态数据

### getStateSync: () => SliceType

返回 Redux 中最新的状态值

### setState: (payload: SliceType) => void

设置 Redux 中的状态值

### setStateSync: (payload: SliceType) => void

同步设置 Redux 中的状态值，这相当于 setState。不同之处在于，使用 setStateSync 后，你可以使用 getStateSync 来获取最新的状态。

### updateState(payload: Partial<SliceType>)=> void

更新 Redux 中的状态值，新的状态值将与之前的状态值合并。参数是部分状态内容。特别需要注意的是，对于数组属性，updateState 不会合并数组属性，而是直接用提供的数据覆盖 Redux 中对应的属性。

### updateStateSync(payload: Partial<SliceType>)=> void

跟 updateState 一样，在调用完成后，你可以使用 getStateSync 来获取最新的状态数据。

### take:(actionType: "setState" | "updateState") => Promise<() => void>

此方法用于监听Action提交状态的变化。它返回一个 promise，动作执行后该 promise 会被 resolved，并返回一个函数用于取消监听。

```typescript

const takeHandle = take('setState');
takeHandle.then((offTake) => {
  console.log('State updated');
  offTake();
})

updateState({dataList: resp.data, fetchStatus: 'Success'});

```

### takeOnce: (actionType: "setState" | "updateState") => Promise<void>

类似于 take 函数，但只执行一次。调用后，它返回一个 promise 对象，当 promise 被 resolved 时，返回的内容为空。


