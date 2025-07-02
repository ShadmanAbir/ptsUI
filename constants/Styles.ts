import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
import Layout from './Layout';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  darkContainer: {
    backgroundColor: Colors.dark.background,
  },
  // Add more common styles here
});
