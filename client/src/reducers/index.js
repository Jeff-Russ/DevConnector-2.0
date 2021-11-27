import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';

// this will be imported as rootReducer:
export default combineReducers({
  alert,
  auth,
  profile
}); 
