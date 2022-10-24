import React from 'react';
import 'dracula-ui/styles/dracula-ui.css'
import './App.scss';
import { Divider, Heading } from 'dracula-ui';
import Routes from './Routes';
import Footer from './components/Footer/Footer';
import { FirebaseProvider } from './Firebase';
import Login from './components/Login/Login';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <FirebaseProvider>
        <Navbar />
        <Divider color="purple"/>
        <div className="container">
          <Routes />
        </div>
        <Footer />
        <Login />
      </FirebaseProvider>
    </BrowserRouter>
  );
}

export default App;
