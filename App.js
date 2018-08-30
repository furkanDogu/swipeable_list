import React from 'react';
import List from './src/components/List';

const DATA = [
  { id: 1, message: 'Message #1' },
  { id: 2, message: 'Message #2' },
  { id: 3, message: 'Message #3' },
  { id: 4, message: 'Message #4' },
  { id: 5, message: 'Message #5' },
  { id: 6, message: 'Message #6' },
  { id: 7, message: 'Message #7' },
  { id: 8, message: 'Message #8' },
];

export default class App extends React.Component {


  render() {
    return (
        <List data={DATA} />
    );
  }
}
