import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import './App.css'
import Landing from './components/layout/Landing'
import Navbar from './components/layout/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'

function App() {
  return (
   <Router>
      <React.Fragment>
        <Navbar />
        <Route path="/" exact component={Landing} />
        <section className="container">
          <Switch>
            <Router exact path="/register" component={Register} />
            <Router exact path="/login" component={Login} />
          </Switch>
        </section>
      </React.Fragment>
    </Router>
    
  );
}

export default App;
