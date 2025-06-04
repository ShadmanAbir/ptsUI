import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function CustomDropdown({ options, selected, onSelect, placeholder }) {
  const [hasSelected, setHasSelected] = useState(!!selected);

  const handleChange = (value) => {
    if (value !== '__placeholder__') {
      setHasSelected(true);
      onSelect(value);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{placeholder}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={hasSelected ? selected : '__placeholder__'}
          onValueChange={handleChange}
          style={styles.picker}
          dropdownIconColor="#007AFF"
        >
          {!hasSelected && (
            <Picker.Item label="-- Select --" value="__placeholder__" enabled={false} />
          )}
          {options.map((option, idx) => (
            <Picker.Item key={idx} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

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
