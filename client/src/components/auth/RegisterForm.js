import React from 'react'
import {reduxForm, Field} from 'redux-form' 
class RegisterForm extends React.Component{
    renderFields = ()=>{
        return(
            <div>
                <Field  />
            </div>
        )
    }
    render(){
        return (
            <div>
                {this.renderFields()}
            </div>
        )
    }
}
export default reduxForm({
    form: 'RegisterForm'
})(RegisterForm)