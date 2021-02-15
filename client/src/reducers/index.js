import {combineReducers} from 'redux'
import {reducer as FormReducer} from 'redux-form'

import postReducer from './post'
import alertReducer from './alert'

const reducers = combineReducers({
    replaceMe: ()=>'I need to be replaced',
    postReducer: postReducer,
    alertReducer: alertReducer,
    form: FormReducer
})

export default reducers


