import React from 'react';
import './App.scss';
import { Divider, Heading } from '@dracula/dracula-ui';
import Routes from './Routes';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div>
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
    </div>
  );
}

export default App;
