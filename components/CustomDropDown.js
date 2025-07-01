import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Text, View } from 'react-native';
import styles from './CustomDropDown.styles';

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
