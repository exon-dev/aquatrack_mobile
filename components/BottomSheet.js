import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const BottomSheet = ({ children, onClose }) => {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.y = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.y + event.translationY;
    },
    onEnd: () => {
      if (translateY.value > -300) {
        translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
      } else {
        translateY.value = withSpring(-600, { damping: 50, stiffness: 400 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleOutsidePress = () => {
    translateY.value = withSpring(0, { damping: 50, stiffness: 400 });
    if (onClose) {
      onClose();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Transparent overlay to detect outside clicks */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* BottomSheet content */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
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