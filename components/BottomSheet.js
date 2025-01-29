import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * .8;

const BottomSheet = ({ children, onClose }) => {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  // const gestureHandler = useAnimatedGestureHandler({
  //   onStart: (_, ctx) => {
  //     ctx.y = translateY.value;
  //   },
  //   onActive: (event, ctx) => {
  //     translateY.value = ctx.y + event.translationY;
  //   },
  //   onEnd: () => {
  //     if (translateY.value > -300) {
  //       translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
  //     } else {
  //       translateY.value = withSpring(-600, { damping: 50, stiffness: 400 });
  //     }
  //   },
  // });

  const handleGesture = (event) => {
    const { translationY } = event.nativeEvent;

    if (translationY > 0) {
      translateY.value = withSpring(Math.max(translationY, MAX_TRANSLATE_Y));
    }
  };

  const handleGestureEnd = (event) => {
    const { translationY } = event.nativeEvent;

    if (translationY > SCREEN_HEIGHT * 0.1) {
      handleOutsidePress();
    } else {
      translateY.value = withSpring(MAX_TRANSLATE_Y);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleOutsidePress = () => {
    translateY.value = withSpring(0, { damping: 10, stiffness: 400 });
    if (onClose) {
      setTimeout(() => runOnJS(onClose)(false), 300);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Transparent overlay to detect outside clicks */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* BottomSheet content */}
      <PanGestureHandler 
        onGestureEvent={handleGesture}
        onEnded={handleGestureEnd}>
        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          <View style={styles.line} />
          {children}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  bottomSheet: {
    position: "absolute",
    top: SCREEN_HEIGHT * .2, // Adjust this value as needed
    width: "100%",
    height: SCREEN_HEIGHT * .8, // Adjust this value as needed
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    padding: 16,
    zIndex: 15,
  },
  line: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
});

export default BottomSheet;