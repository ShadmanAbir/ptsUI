import ApiClientInstance from '@/api/ApiClient';
import CustomDropDown from '@/components/CustomDropDown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { Buyer, ProductionEntry, ProductionLine, Style } from '@/types/production';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface ProductionEntryForm {
  productionDate: Date;
  lineId: number;
  style: string;
  orderNo: string;
  buyer: string;
  fabricType: string;
  pmId: number;
  hourSlot: string;
  targetQuantity: string;
  actualQuantity: string;
  remarks: string;
}

export default function ProductionEntry() {
  // Data states
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [styleItems, setStyleItems] = useState<Style[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [orders, setOrders] = useState<{ id: number, orderNo: string }[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Selection states
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');

  // Form state
  const [form, setForm] = useState<ProductionEntryForm>({
    productionDate: new Date(),
    lineId: 0,
    style: '',
    orderNo: '',
    buyer: '',
    fabricType: '',
    pmId: 0,
    hourSlot: '',
    targetQuantity: '',
    actualQuantity: '',
    remarks: '',
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load production lines, buyers, styles, and orders
        const [linesData, buyersData, stylesData, ordersData] = await Promise.all([
          ProductionService.getProductionLines(),
          ProductionService.getBuyers(),
          ProductionService.getStyles(),
          ProductionService.getProductionOrders('In Progress'),
        ]);

        setLines(linesData);
        setBuyers(buyersData);
        setStyleItems(stylesData);

        // Format orders for dropdown
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          orderNo: order.orderNo
        }));
        setOrders(formattedOrders);

        // Set default line from settings if available
        const settings = await AsyncStorage.getItem('appSettings');
        if (settings) {
          const { defaultLine } = JSON.parse(settings);
          if (defaultLine) {
            const defaultLineObj = linesData.find(l => l.id === defaultLine);
            if (defaultLineObj) {
              setSelectedLine(defaultLineObj.name);
              setForm(prev => ({ ...prev, lineId: defaultLine }));
            }
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle buyer selection
  const handleBuyerChange = async (value: string) => {
    setSelectedBuyer(value);
    const buyer = buyers.find(b => b.name === value);

    if (buyer) {
      setForm(prev => ({ ...prev, buyer: value }));

      // Load styles for this buyer
      try {
        const buyerStyles = await ProductionService.getStyles(buyer.id);
        setStyleItems(buyerStyles);
        setSelectedStyle('');
      } catch (error) {
        Alert.alert('Error', 'Failed to load styles for this buyer');
      }
    }
  };

  // Handle style selection
  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    const style = styleItems.find(s => s.styleNo === value);
    if (style) {
      setForm(prev => ({
        ...prev,
        style: value,
        fabricType: style.fabricType || ''
      }));
    }
  };

  // Handle line selection
  const handleLineChange = (value: string) => {
    setSelectedLine(value);
    const line = lines.find(l => l.name === value);
    if (line) {
      setForm(prev => ({ ...prev, lineId: line.id }));
    }
  };

  // Handle order selection
  const handleOrderChange = (value: string) => {
    setSelectedOrder(value);
    setForm(prev => ({ ...prev, orderNo: value }));
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.lineId) {
      Alert.alert('Validation Error', 'Please select a production line');
      return false;
    }

    if (!form.buyer) {
      Alert.alert('Validation Error', 'Please select a buyer');
      return false;
    }

    if (!form.style) {
      Alert.alert('Validation Error', 'Please select a style');
      return false;
    }

    if (!form.orderNo) {
      Alert.alert('Validation Error', 'Please select an order number');
      return false;
    }

    if (!form.hourSlot) {
      Alert.alert('Validation Error', 'Please enter an hour slot');
      return false;
    }

    if (!form.targetQuantity || parseInt(form.targetQuantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target quantity');
      return false;
    }

    if (!form.actualQuantity || parseInt(form.actualQuantity) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid actual quantity');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const productionEntryData: ProductionEntry = {
        lineId: form.lineId,
        productionDate: form.productionDate.toISOString(),
        style: form.style,
        orderNo: form.orderNo,
        buyer: form.buyer,
        fabricType: form.fabricType,
        pmId: form.pmId || 0,
        hourSlot: form.hourSlot,
        targetQuantity: parseInt(form.targetQuantity),
        actualQuantity: parseInt(form.actualQuantity),
        remarks: form.remarks || '',
      };

      await ApiClientInstance.submitProductionEntry(productionEntryData);

      Alert.alert('Success', 'Production entry submitted successfully!');

      // Reset form fields except line and date
      setForm(prev => ({
        ...prev,
        hourSlot: '',
        targetQuantity: '',
        actualQuantity: '',
        remarks: '',
      }));

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit production entry');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (label: string, key: keyof ProductionEntryForm, keyboardType: 'default' | 'numeric' = 'default') => (
    <View style={styles.inputWrapper}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={styles.input}
        placeholder={label}
        value={key === 'pmId' ? form[key].toString() : form[key] as string}
        onChangeText={(value) => {
          if (key === 'pmId') {
            handleChange(key, value ? value : '0');
          } else {
            handleChange(key, value);
          }
        }}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.form}>
          <ThemedText type="title" style={styles.heading}>Production Entry</ThemedText>

          {/* Date Picker */}
          <View style={styles.dateContainer}>
            <ThemedText style={styles.label}>Production Date</ThemedText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText style={styles.dateText}>
                {form.productionDate.toDateString()}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={form.productionDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setForm(prev => ({ ...prev, productionDate: selectedDate }));
                }
              }}
            />
          )}

          {/* Line Selection */}
          <View style={styles.dropdownContainer}>
            <ThemedText style={styles.label}>Production Line</ThemedText>
            <CustomDropDown
              options={lines.map(line => line.name)}
              selected={selectedLine}
              onSelect={handleLineChange}
              placeholder="Select Production Line"
            />
          </View>

          {/* Buyer Selection */}
          <View style={styles.dropdownContainer}>
            <ThemedText style={styles.label}>Buyer</ThemedText>
            <CustomDropDown
              options={buyers.map(buyer => buyer.name)}
              selected={selectedBuyer}
              onSelect={handleBuyerChange}
              placeholder="Select Buyer"
            />
          </View>

          {/* Style Selection */}
          <View style={styles.dropdownContainer}>
            <ThemedText style={styles.label}>Style</ThemedText>
            <CustomDropDown
              options={styleItems.map(style => style.styleNo)}
              selected={selectedStyle}
              onSelect={handleStyleChange}
              placeholder="Select Style"
              disabled={!selectedBuyer}
            />
          </View>

          {/* Order Selection */}
          <View style={styles.dropdownContainer}>
            <ThemedText style={styles.label}>Order Number</ThemedText>
            <CustomDropDown
              options={orders.map(order => order.orderNo)}
              selected={selectedOrder}
              onSelect={handleOrderChange}
              placeholder="Select Order"
            />
          </View>

          {/* Hour Slot */}
          {renderInput('Hour Slot (e.g. 9-10)', 'hourSlot')}

          {/* Production Quantities */}
          <View style={styles.quantityRow}>
            <View style={styles.halfInput}>
              {renderInput('Target Quantity', 'targetQuantity', 'numeric')}
            </View>
            <View style={styles.halfInput}>
              {renderInput('Actual Quantity', 'actualQuantity', 'numeric')}
            </View>
          </View>

          {/* PM ID */}
          {renderInput('PM ID', 'pmId', 'numeric')}

          {/* Fabric Type */}
          {renderInput('Fabric Type', 'fabricType')}

          {/* Remarks */}
          <View style={styles.inputWrapper}>
            <ThemedText style={styles.label}>Remarks</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter any remarks or issues"
              value={form.remarks}
              onChangeText={(value) => handleChange('remarks', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Submit Entry</ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
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
    marginBottom: 24,
    textAlign: 'center',
    color: '#007AFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 16,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfInput: {
    width: '48%',
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
