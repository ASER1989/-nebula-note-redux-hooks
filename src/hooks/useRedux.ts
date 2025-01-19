import {useEffect, useMemo} from 'react';
import {getStore} from '../configureStore';
import {createSliceInstance} from '../tools/sliceHelper';
import {useDispatch, useSelector} from 'react-redux';

type SliceUpdater<StateType> = (ownState: StateType) => StateType;
export const useRedux = <SliceType>(stateName: string, initialState: SliceType) => {
  const store = getStore();
  const dispatch = useDispatch();
  const reducerInstance = useMemo(
    () => createSliceInstance(stateName, initialState),
    [stateName, initialState],
  );

  if (!store) {
    throw new Error('store is not initialized');
  }

  useEffect(() => {
    store.reducerManager.add(stateName, reducerInstance.reducer);
  }, []);

  const state = useSelector((storeState: Record<string, SliceType>) => {
    if (Object.prototype.hasOwnProperty.call(storeState, stateName)) {
      return storeState[stateName] as SliceType;
    }
    return initialState;
  });

  const take = (actionType: 'setState' | 'updateState') => {
    let resolveHandle: (result: () => void) => void;
    const promiseHandle = new Promise<() => void>((resolve) => {
      resolveHandle = resolve;
    });
    const removeTaker = store.addTaker(`${stateName}/${actionType}`, () => {
      resolveHandle(removeTaker);
    });
    return promiseHandle;
  };
  const takeOnce = (actionType: 'setState' | 'updateState') => {
    let resolveHandle: () => void;
    const promiseHandle = new Promise<void>((resolve) => {
      resolveHandle = resolve;
    });
    const removeTaker = store.addTaker(`${stateName}/${actionType}`, () => {
      resolveHandle();
      removeTaker();
    });
    return promiseHandle;
  };

  const getStateSync = () => {
    return store.getState()[stateName] as SliceType;
  };

  const setState = (payload: SliceType | SliceUpdater<SliceType>) => {
    if (typeof payload === 'function') {
      const ownState = getStateSync();
      const newState = (payload as SliceUpdater<SliceType>)(ownState);
      dispatch(reducerInstance.actions.setState(newState));
      return;
    }
    dispatch(reducerInstance.actions.setState(payload));
  };
  const setStateSync = (payload: SliceType | SliceUpdater<SliceType>) => {
    (async () => {
      const takeHandle = takeOnce('setState');
      setState(payload);
      await takeHandle;
    })();
  };
  const updateState = <T extends typeof initialState>(payload: {
    [K in keyof T]?: Partial<T[K]>;
  }) => {
    dispatch(reducerInstance.actions.updateState(payload));
  };
  const updateStateSync = <T extends typeof initialState>(payload: {
    [K in keyof T]?: Partial<T[K]>;
  }) => {
    (async () => {
      const takeHandle = takeOnce('updateState');
      updateState(payload);
      await takeHandle;
    })();
  };

  return {
    state,
    getStateSync,
    setState,
    setStateSync,
    updateState,
    updateStateSync,
    take,
    takeOnce,
  } as const;
};
