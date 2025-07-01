import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  tabBarStyle: Platform.select({
    ios: {
      position: 'absolute',
    },
    default: {},
  }),
});

export default styles;
