import React from 'react';
import 'dracula-ui/styles/dracula-ui.css'
import './App.scss';
import { Divider, Heading } from 'dracula-ui';
import Routes from './Routes';
import Footer from './components/Footer/Footer';
import { FirebaseProvider } from './Firebase';
import Login from './components/Login/Login';

function App() {
  return (
    <FirebaseProvider>
      <div className="header drac-m-sm">
        <Heading color="pinkPurple">Scrum Poker</Heading>
        <Heading color="pinkPurple">Room 14 61 70</Heading>
        <Heading color="pinkPurple">Gabriel</Heading>
      </div>
      <Divider color="purple"/>
      <div className="container">
        <Routes />
      </div>
      <Footer />
      <Login />
    </FirebaseProvider>
  );
}

export default App;
