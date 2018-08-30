import React from 'react';
import {
  ScrollView,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import Item from './Item';

class List extends React.Component {

  state = {
    data: this.props.data,
    swiping: false
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  cleanFromScreen(id) {
      const data = this.state.data.filter(item => {
        return item.id !== id;
      });
      this.setState({ data });
  }


  renderItems() {
    return this.state.data.map((item) => {
      return (
        <Item
        key={item.id}
        swipingCheck={(swiping) => this.setState({ swiping })}
        message={item.message}
        id={item.id}
        cleanFromScreen={(id) => this.cleanFromScreen(id)}
        leftButtonPressed={() => console.log('left button pressed')}
        deleteButtonPressed={() => console.log('delete button pressed')}
        editButtonPressed={() => console.log('edit button pressed')}
        />
      );
    });
  }
  render() {
    return (
        <ScrollView
        scrollEnabled={!(this.state.swiping)}
        >
          {this.renderItems()}
      </ScrollView>
    );
  }

}

export default List;
