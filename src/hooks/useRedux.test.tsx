import React from 'react';
import {render, act} from '@testing-library/react';
import {Provider} from 'react-redux';
import {useRedux} from './useRedux';
import {configureStore} from '../configureStore';
import {useDispatch} from 'react-redux';
import SpyInstance = jest.SpyInstance;

jest.mock('react-redux', () => {
  const actualRedux = jest.requireActual('react-redux');
  return {
    ...actualRedux,
    useDispatch: jest.fn(),
  };
});

const TestComponent = ({stateName, initialState, onResult}: any) => {
  const reduxHook = useRedux(stateName, initialState);
  onResult(reduxHook);
  return null;
};

const originalCreateSliceInstance = jest.requireActual('../tools/sliceHelper').createSliceInstance;
const sypCreateSliceInstance = jest.spyOn(require('../tools/sliceHelper'), 'createSliceInstance');
describe('useRedux Hook', () => {
  let mockStore: any;
  let mockDispatch: jest.Mock;
  let mockReducerInstance: any;
  let mockAddTaker: SpyInstance<any, unknown[], any>;

  beforeEach(() => {
    sypCreateSliceInstance.mockImplementation((stateName: unknown, initialState: unknown) => {
      mockReducerInstance = originalCreateSliceInstance(stateName, initialState);
      return mockReducerInstance;
    });

    mockDispatch = jest.fn();
    mockStore = configureStore();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    mockAddTaker = jest.spyOn(mockStore, 'addTaker')
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize state and add reducer to the store', () => {
    let hookResult: any;
    render(
      <Provider store={mockStore}>
        <TestComponent
          stateName="testState"
          initialState={{value: 0}}
          onResult={(result: any) => (hookResult = result)}
        />
      </Provider>
    );

    expect(hookResult.state).toEqual({value: 0});
  });

  test('should dispatch setState action', () => {
    let hookResult: any;
    render(
      <Provider store={mockStore}>
        <TestComponent
          stateName="testState"
          initialState={{value: 0}}
          onResult={(result: any) => (hookResult = result)}
        />
      </Provider>
    );

    act(() => {
      hookResult.setState({value: 100});
    });

    expect(mockDispatch).toHaveBeenCalledWith(mockReducerInstance.actions.setState({value: 100}));
  });

  test('should dispatch setStateSync action and wait for taker', async () => {
    const resolveTaker = jest.fn();
    mockAddTaker.mockImplementation((_actionType, callback) => {
      return resolveTaker;
    });

    let hookResult: any;
    render(
      <Provider store={mockStore}>
        <TestComponent
          stateName="testState"
          initialState={{value: 0}}
          onResult={(result: any) => (hookResult = result)}
        />
      </Provider>
    );

    await act(async () => {
      hookResult.setStateSync({value: 200});
      resolveTaker();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      mockReducerInstance.actions.setState({value: 200})
    );
    expect(mockAddTaker).toHaveBeenCalledWith(
      'testState/setState',
      expect.any(Function)
    );
  });

  test('should dispatch updateState action', () => {
    let hookResult: any;
    render(
      <Provider store={mockStore}>
        <TestComponent
          stateName="testState"
          initialState={{value: 0}}
          onResult={(result: any) => (hookResult = result)}
        />
      </Provider>
    );

    act(() => {
      hookResult.updateState({value: 300});
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      mockReducerInstance.actions.updateState({value: 300})
    );
  });

  test('should update provider attribute', () => {
    const mockState = {value: 0, testId: 0, testKey: "0"};
    const newState = mockReducerInstance.actions.updateState({value: 300});
    const result = mockReducerInstance.caseReducers.updateState(mockState, newState);

    expect(result).toEqual({value: 300, testId: 0, testKey: "0"});
  });

  test('should replace array attribute', () => {
    const mockState = {value: [1, 0, 0, 1], testId: 0};
    const newState = mockReducerInstance.actions.updateState({value: [0]});
    const result = mockReducerInstance.caseReducers.updateState(mockState, newState);

    expect(result).toEqual({value: [0], testId: 0});
  });

  test('should dispatch updateStateSync action and wait for taker', async () => {
    const resolveTaker = jest.fn();
    mockAddTaker.mockImplementation((_actionType, callback) => {
      return resolveTaker;
    });

    let hookResult: any;
    render(
      <Provider store={mockStore}>
        <TestComponent
          stateName="testState"
          initialState={{value: 0}}
          onResult={(result: any) => (hookResult = result)}
        />
      </Provider>
    );

    await act(async () => {
      hookResult.updateStateSync({value: 400});
      resolveTaker();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      mockReducerInstance.actions.updateState({value: 400})
    );
    expect(mockAddTaker).toHaveBeenCalledWith(
      'testState/updateState',
      expect.any(Function)
    );
  });

  test('should throw an error if store is not initialized', () => {
    const mockGetStore = jest.spyOn(require('../configureStore'), 'getStore');
    mockGetStore.mockReturnValue(null);

    expect(() => {
      render(
        <Provider store={mockStore}>
          <TestComponent
            stateName="testState"
            initialState={{value: 0}}
            onResult={jest.fn()}
          />
        </Provider>
      );
    }).toThrow('store is not initialized');
  });
});
