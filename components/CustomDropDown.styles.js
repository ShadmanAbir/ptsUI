import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        paddingHorizontal: 10,
      },
    }),
  },
  picker: {
    height: 50,
    color: '#007AFF',
  },
});

export default styles;
