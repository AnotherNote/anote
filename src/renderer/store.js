import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';
let store = createStore(reducers);

export default store;
