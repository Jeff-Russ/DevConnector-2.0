import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';

// this will be imported as rootReducer:
export default combineReducers({
  alert,
  auth
}); 
