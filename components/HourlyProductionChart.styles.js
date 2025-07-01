import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    zIndex: 10,
  },
});

export default styles;
