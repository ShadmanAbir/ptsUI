import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, TextInput } from 'react-native';

type FormKeys = 'productionDate' | 'style' | 'orderNo' | 'buyer' | 'fabricType' | 'hourSlot' | 'targetQuantity' | 'actualQuantity' | 'remarks';

export default function ProductionEntry() {
  //const { pmId } = useAuth();
  const [lineId, setLineId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<FormKeys, string>>({
    productionDate: new Date().toISOString(),
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

      // Prompt for line selection (hardcoded for demo)
      const newLineId = 5; // ← get this dynamically (e.g. from a picker)
      setLineId(newLineId);
      await AsyncStorage.setItem('lineEntry', JSON.stringify({ date: today, lineId: newLineId }));
    };

    checkLineEntry();
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    //if (!pmId || !lineId) return Alert.alert('Missing', 'Line or PM not set');

    const payload = {
      ...form,
      //pmId,
      lineId,
      targetQuantity: parseInt(form.targetQuantity),
      actualQuantity: parseInt(form.actualQuantity),
    };

    console.log('✅ Submitted:', payload);
    Alert.alert('Success', 'Production entry submitted!');
    // Send this to your API here
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {Object.entries({
          style: 'Style',
          orderNo: 'Order No',
          buyer: 'Buyer',
          fabricType: 'Fabric Type',
          hourSlot: 'Hour Slot (e.g. 9-10)',
          targetQuantity: 'Target Quantity',
          actualQuantity: 'Actual Quantity',
          remarks: 'Remarks',
        }).map(([key, label]) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            value={form[key as FormKeys]}
            onChangeText={(value) => handleChange(key, value)}
          />
        ))}
          

        <Button title="Submit Entry" onPress={handleSubmit} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
});
