# @nebula-note/redux-hooks

[【中文】](./README_CN.md)

@nebula-note/redux-hooks is a tool that manages state entirely through hooks. no actions, no reducers, only hooks.

## Guide

### install

``` 
npm i @nebula-note/redux-hooks 
```

or

```
 yarn add @nebula-note/redux-hooks
 ```

### configureStore

The parameters accepted by configureStore are the same as those in @reduxjs/toolkit configureStore. If your project is
already using @reduxjs/toolkit, it can be easily switched over.

``` typescript
import { configureStore } from '@nebula-note/redux-hooks';
const store = configureStore();
```

### useRedux

The usage of useRedux is similar to React’s useState, with the addition of a state name parameter. In the following
code, REDUX_KEY corresponds to the state name in the Redux state, which is equivalent to the name parameter in
createSlice from @reduxjs/toolkit.

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

Here are the methods and properties provided by useRedux:

### state

State data

### getStateSync: () => SliceType

Return the latest state value in Redux

### setState: (payload: SliceType) => void

Set the state value in Redux

### setStateSync: (payload: SliceType) => void

Set the state value in Redux synchronously, which is equivalent to setState.The difference is that after using
setStateSync, you can use getStateSync to get the latest state.

### updateState(payload: Partial\<SliceType\>)=> void

Update the state value in Redux, and the state value will be merged with the previous state value.The parameter is
partial state content. It is particularly important to note that for Array properties, updateState will not merge the
Array properties but will directly overwrite the corresponding properties in Redux with the provided data.

### updateStateSync(payload: Partial\<SliceType\>)=> void

Like updateState, after the call is completed, you can use getStateSync to retrieve the latest state
data.

### take:(actionType: "setState" | "updateState") => Promise<() => void>

This method is used to listen for changes in the submission state of an action. It returns a promise, which is
resolved after the action is executed, and it returns a function to cancel the listener.

```typescript

const takeHandle = take('setState');
takeHandle.then((offTake) => {
  console.log('State updated');
  offTake();
})

updateState({dataList: resp.data, fetchStatus: 'Success'});

```

### takeOnce: (actionType: "setState" | "updateState") => Promise<void>

Similar to the take function, but it only executes once. After calling, it returns a promise object, and
when resolved, the returned content is empty.


