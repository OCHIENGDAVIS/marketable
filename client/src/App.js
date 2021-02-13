import React from 'react'
import './App.css'
import Landing from './components/layout/Landing'
import Navbar from './components/layout/Navbar'

function App() {
  return (
    <div className="App">
      <React.Fragment>
        <Navbar />
        <Landing />
      </React.Fragment>
    </div>
  );
}

export default App;
