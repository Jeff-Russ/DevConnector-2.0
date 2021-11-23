import { combineReducers } from 'redux';
import alert from './alert';

// this will be imported as rootReducer:
export default combineReducers({ alert }); 