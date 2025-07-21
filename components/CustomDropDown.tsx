import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Text, View } from 'react-native';
import styles from './CustomDropDown.styles';

interface CustomDropdownProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function CustomDropdown({ options, selected, onSelect, placeholder, disabled = false }: CustomDropdownProps) {
  const [hasSelected, setHasSelected] = useState(!!selected);

  const handleChange = (value: string) => {
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
          enabled={!disabled}
        >
          {!hasSelected && (
            <Picker.Item label="-- Select --" value="__placeholder__" enabled={false} />
          )}
          {options.map((option: string, idx: number) => (
            <Picker.Item key={idx} label={option} value={option} />
          ))}
        </Picker>
      </View>
    </View>
  );
}