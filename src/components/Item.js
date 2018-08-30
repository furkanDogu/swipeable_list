import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Easing,
  StyleSheet
} from 'react-native';
import { Icon } from 'react-native-elements';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RIGHT_BUTTON_THRESHOLD = SCREEN_WIDTH / 15;
const FORCE_TO_OPEN_THRESHOLD = SCREEN_WIDTH / 3.5;
const FORCING_DURATION = 350;
const SCROLL_THRESHOLD = SCREEN_WIDTH / 15;
const LEFT_BUTTONS_THRESHOLD = SCREEN_WIDTH / 7;

class Item extends React.Component {

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY(0, 0);
    this.scrollStopped = false;

        const panResponder = PanResponder.create({
          onStartShouldSetPanResponder: () => false, // we don't want the item to be animated with a touch
          onMoveShouldSetPanResponder: () => true, // we want to animate the item with a movement
          onResponderTerminationRequest: () => false,
          onPanResponderGrant: () => {
            this.position.setOffset({ x: this.position.x._value, y: 0 }); // we specify the offset to continue swiping from the place where user left.
            this.position.setValue({ x: 0, y: 0 }); // clearing the position
          },
          onPanResponderMove: (event, gesture) => {
              if (gesture.dx >= SCROLL_THRESHOLD) {
                  this.enableScrollView(true);
                  const x = gesture.dx - SCROLL_THRESHOLD;
                  this.position.setValue({ x, y: 0 });
              } else if (gesture.dx <= -SCROLL_THRESHOLD) {
                  this.enableScrollView(true);
                  const x = gesture.dx + SCROLL_THRESHOLD;
                  this.position.setValue({ x, y: 0 });
              }
          },
          onPanResponderRelease: (event, gesture) => {
            this.position.flattenOffset(); // adding animated value to the offset value then it reset the offset to 0.
              if (gesture.dx > 0) {
                this.userSwipedRight(gesture);
              } else {
                 this.userSwipedLeft(gesture);
              }
          },
          onPanResponderTerminate: () => {
            Animated.spring(this.position, {
              toValue: { x: 0, y: 0 }
            }).start();
          }
    });

    this.position = position;
    this.panResponder = panResponder;
  }

  getRightButtonProps() {
      const opacity = this.position.x.interpolate({
        inputRange: [-SCREEN_WIDTH, -120, -35],
        outputRange: [0, 1, 0]
      });
      return {
         opacity,
      };
  }

  getLeftButtonProps() {
    const opacity = this.position.x.interpolate({
      inputRange: [35, 75, 320],
      outputRange: [0, 1, 0.25]
    });
    const width = this.position.x.interpolate({
      inputRange: [0, 70],
      outputRange: [0, 70]
    });
    return {
      opacity,
      width
    };
  }

  resetPosition() {
    Animated.timing(this.position, {
      toValue: { x: 0, y: 0 },
      duration: 200
    }).start();
  }

  completeSwipe(dimension, callback) {
    const x = dimension === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: FORCING_DURATION
    }).start(() => this.props.cleanFromScreen(this.props.id));
    callback();
  }

  enableScrollView(isEnabled) {
      if (this.scrollView !== isEnabled) {
          this.props.swipingCheck(isEnabled);
          this.scrollView = isEnabled;
        }
  }

  userSwipedLeft(gesture) {
    if (gesture.dx <= -(RIGHT_BUTTON_THRESHOLD)) {
      this.showButton('left');
    } else {
      this.resetPosition();
    }
  }

  userSwipedRight(gesture) {
    if (gesture.dx >= FORCE_TO_OPEN_THRESHOLD) {
      this.completeSwipe('right', this.props.leftButtonPressed.bind(this));
    } else if (gesture.dx >= LEFT_BUTTONS_THRESHOLD && gesture.dx < FORCE_TO_OPEN_THRESHOLD) {
        this.showButton('right');
    } else {
      this.resetPosition();
    }
  }

  showButton(side) {
    const x = side === 'right' ? SCREEN_WIDTH / 4 : -SCREEN_WIDTH / 2.5; // 4 from 4.5 // BURASI DEĞİŞTİRİLECEK
    Animated.timing(this.position, {
      toValue: { x, y: 0 },
      duration: 400,
      easing: Easing.out(Easing.quad)
    }).start(() => this.enableScrollView(false));
  }

  render() {
    const { containerStyle, leftButtonContainer, textContainer, rightButtonContainer } = styles;
    return (

        <View style={containerStyle}>

            <Animated.View // LEFT BUTTON
            style={[leftButtonContainer, this.getLeftButtonProps()]}
            >

              <TouchableOpacity onPress={() => this.completeSwipe('right', () => this.props.leftButtonPressed())}>
                <Icon
                type="font-awesome"
                name="check"
                />
                <Text
                style={styles.textStyle}
                numberOfLines={1} // to keep the text in one line when it the container gets narrow
                //ellipsizeMode='clip' // to show the text without three dot but doesnt work on android

                >
                  Accept
                </Text>
                </TouchableOpacity>

            </Animated.View>

            <Animated.View // THE CONTENT OF ITEM
              style={[textContainer, this.position.getLayout()]}
              {...this.panResponder.panHandlers}
            >
              <Text style={styles.textStyle}>{this.props.message}</Text>
            </Animated.View>

            <Animated.View
              style={[rightButtonContainer, { left: SCREEN_WIDTH / 1.7 }, this.getRightButtonProps()]}
            >
                <TouchableOpacity onPress={() => this.completeSwipe('left', () => this.props.deleteButtonPressed())}>
                  <Icon
                  type="font-awesome"
                  name="trash"
                  />
                 <Text style={styles.textStyle}>Delete</Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[rightButtonContainer, { backgroundColor: '#FFC400' }, this.getRightButtonProps()]}
            >
                <TouchableOpacity onPress={() => this.props.editButtonPressed()}>
                  <Icon
                  type="font-awesome"
                  name="edit"
                  />
                  <Text style={styles.textStyle}>Edit</Text>
                </TouchableOpacity>
            </Animated.View>

        </View>

    );
  }
}

const styles = StyleSheet.create({
  leftButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 23,
    backgroundColor: '#50f442',
    position: 'absolute',
    elevation: 3,
  },
  containerStyle: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 5,
    marginHorizontal: 5,
    marginTop: 30,
    elevation: 3
  },
  textContainer: {
    paddingHorizontal: 30,
    paddingVertical: 35,
    width: SCREEN_WIDTH / 1.03,
    borderRadius: 7,
    backgroundColor: '#CFD8DC',
    elevation: 3,
    zIndex: 2
  },
  textStyle: {
    fontSize: 17
  },
  rightButtonContainer: {
    position: 'absolute',
    left: SCREEN_WIDTH / 1.24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderRadius: 7,
    paddingHorizontal: 18,
    paddingVertical: 23,
    elevation: 3,
    backgroundColor: '#D50000',
    zIndex: 1
  }
});

export default Item;
