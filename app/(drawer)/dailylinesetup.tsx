import { useAuth } from '@/app/AuthContext';
import CustomDropDown from '@/components/CustomDropDown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { Buyer, DailyLineSetup, ProductionLine, Style } from '@/types/production';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
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

interface DailyLineSetupForm {
  productionDate: Date;
  lineId: number;
  style: string;
  orderNo: string;
  buyer: string;
  fabricType: string;
  pmId: number;
}

export default function DailyLineSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Data states
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [styleItems, setStyleItems] = useState<Style[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [orders, setOrders] = useState<{ id: number, orderNo: string }[]>([]);
  const [existingSetups, setExistingSetups] = useState<DailyLineSetup[]>([]);

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
  const [form, setForm] = useState<DailyLineSetupForm>({
    productionDate: new Date(),
    lineId: 0,
    style: '',
    orderNo: '',
    buyer: '',
    fabricType: '',
    pmId: 0,
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

        // Filter lines based on user's assigned lines
        const userLines = user?.assignedLines || [];
        const filteredLines = linesData.filter(line => 
          user?.role === 'Admin' || userLines.includes(line.id)
        );
        
        setLines(filteredLines);
        setBuyers(buyersData);
        setStyleItems(stylesData);

        // Format orders for dropdown
        const formattedOrders = ordersData.map(order => ({
          id: order.id,
          orderNo: order.orderNo
        }));
        setOrders(formattedOrders);

        // Check for existing setups for today
        const today = new Date().toISOString().split('T')[0];
        const existingSetupsData = await ProductionService.getDailyLineSetups(today);
        setExistingSetups(existingSetupsData);
        
        // If there are existing setups, show them
        if (existingSetupsData.length > 0) {
          Alert.alert(
            'Existing Setups',
            'You already have line setups for today. Do you want to proceed to hourly entry?',
            [
              {
                text: 'Continue Setup',
                style: 'cancel',
              },
              {
                text: 'Go to Hourly Entry',
                onPress: () => router.push('/hourlyentry'),
              },
            ]
          );
        }

      } catch (error) {
        Alert.alert('Error', 'Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

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
      
      // Check if this line already has a setup for today
      const existingSetup = existingSetups.find(setup => setup.lineId === line.id);
      if (existingSetup) {
        // Pre-fill the form with existing setup data
        setSelectedBuyer(existingSetup.buyer);
        setSelectedStyle(existingSetup.style);
        setSelectedOrder(existingSetup.orderNo);
        
        setForm(prev => ({
          ...prev,
          buyer: existingSetup.buyer,
          style: existingSetup.style,
          orderNo: existingSetup.orderNo,
          fabricType: existingSetup.fabricType,
          pmId: existingSetup.pmId,
        }));
      }
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

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const dailyLineSetupData: DailyLineSetup = {
        lineId: form.lineId,
        userId: user?.id || 0,
        productionDate: form.productionDate.toISOString().split('T')[0],
        style: form.style,
        orderNo: form.orderNo,
        buyer: form.buyer,
        fabricType: form.fabricType,
        pmId: form.pmId || 0,
        isActive: true,
      };

      await ProductionService.createDailyLineSetup(dailyLineSetupData);

      Alert.alert(
        'Success', 
        'Line setup created successfully!',
        [
          {
            text: 'Setup Another Line',
            onPress: () => {
              // Reset form for another entry
              setSelectedLine('');
              setSelectedBuyer('');
              setSelectedStyle('');
              setSelectedOrder('');
              setForm({
                productionDate: form.productionDate,
                lineId: 0,
                style: '',
                orderNo: '',
                buyer: '',
                fabricType: '',
                pmId: 0,
              });
            },
            style: 'cancel',
          },
          {
            text: 'Go to Hourly Entry',
            onPress: () => router.push('/hourlyentry'),
          },
        ]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create line setup');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (label: string, key: keyof DailyLineSetupForm, keyboardType: 'default' | 'numeric' = 'default') => (
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
          <ThemedText type="title" style={styles.heading}>Daily Line Setup</ThemedText>

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

          {/* PM ID */}
          {renderInput('PM ID', 'pmId', 'numeric')}

          {/* Fabric Type */}
          {renderInput('Fabric Type', 'fabricType')}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={styles.buttonText}>Save Line Setup</ThemedText>
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