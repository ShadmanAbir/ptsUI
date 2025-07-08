import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type FormKeys =
  | 'productionDate'
  | 'style'
  | 'orderNo'
  | 'buyer'
  | 'fabricType'
  | 'hourSlot'
  | 'targetQuantity'
  | 'actualQuantity'
  | 'remarks';

export default function ProductionEntry() {
  const [lineId, setLineId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<FormKeys, string>>({
    productionDate: new Date().toISOString().split('T')[0],
    style: '',
    orderNo: '',
    buyer: '',
    fabricType: '',
    hourSlot: '',
    targetQuantity: '',
    actualQuantity: '',
    remarks: '',
  });

  useEffect(() => {
    const checkLineEntry = async () => {
      const today = new Date().toISOString().split('T')[0];
      const stored = await AsyncStorage.getItem('lineEntry');
      if (stored) {
        const { date, lineId } = JSON.parse(stored);
        if (date === today) {
          setLineId(lineId);
          return;
        }
      }

      const newLineId = 5; // Replace with Picker if needed
      setLineId(newLineId);
      await AsyncStorage.setItem('lineEntry', JSON.stringify({ date: today, lineId: newLineId }));
    };

    checkLineEntry();
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      lineId,
      targetQuantity: parseInt(form.targetQuantity),
      actualQuantity: parseInt(form.actualQuantity),
    };

    console.log('✅ Submitted:', payload);
    Alert.alert('✅ Success', 'Production entry submitted!');
  };

  const renderInput = (label: string, key: FormKeys, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={label}
        value={form[key]}
        onChangeText={(value) => handleChange(key, value)}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.heading}>Production Entry</Text>

        {renderInput('Style', 'style')}
        {renderInput('Order No', 'orderNo')}
        {renderInput('Buyer', 'buyer')}
        {renderInput('Fabric Type', 'fabricType')}
        {renderInput('Hour Slot (e.g. 9-10)', 'hourSlot')}
        {renderInput('Target Quantity', 'targetQuantity', 'numeric')}
        {renderInput('Actual Quantity', 'actualQuantity', 'numeric')}
        {renderInput('Remarks', 'remarks')}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Entry</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#f2f4f7',
  },
  form: {
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#007AFF',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
