import React from 'react';
import Todos from '../todos';
import Footer from '../footer';

export default class MainSection extends React.Component {
  render() {
    return (
      <section className={'main'}>
        <Todos />
        <Footer />
      </section>
    );
  }
}