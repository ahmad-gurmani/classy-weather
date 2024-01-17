import React, { Component } from 'react'

class Counter extends Component {
  constructor(props) {
    super(props);

    this.state = { count: 5 }
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  handleDecrement() {
    this.setState(curState => {
      return { count: curState.count - 1 }
    })
  };

  handleIncrement() {
    this.setState(curState => {
      return { count: curState.count + 1 }
    })
  }

  render() {
    const date = new Date("jan 21 2024");
    date.setDate(date.getDate() + this.state.count);

    return (
      <>
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()}
        </span>
        <button onClick={this.handleIncrement}>+</button>
      </>
    )
  }
}

export default Counter;