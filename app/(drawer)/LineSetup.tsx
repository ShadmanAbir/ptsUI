import { useAuth } from '@/app/AuthContext';
import CustomDropDown from '@/components/CustomDropDown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { LineSetup, ProductionLine, ProductionOrder, Style } from '@/types/production';
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
    View,
} from 'react-native';

export default function LineSetupScreen() {
  const { permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Data states
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  
  // Selection states
  const [selectedLine, setSelectedLine] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  
  // Form state
  const [form, setForm] = useState({
    lineId: 0,
    orderId: 0,
    productionDate: new Date(),
    targetQuantity: '',
    setupTime: '',
  });

  // Check permissions
  const checkPermissions = () => {
    if (!permissions.includes('LineSetup')) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>
            You don't have permission to access Line Setup
          </ThemedText>
        </ThemedView>
      );
    }
    return null;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [linesData, ordersData] = await Promise.all([
          ProductionService.getProductionLines(),
          ProductionService.getProductionOrders('Pending'),
        ]);
        
        setLines(linesData);
        setOrders(ordersData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleLineChange = (value: string) => {
    setSelectedLine(value);
    const line = lines.find(l => l.name === value);
    if (line) {
      setForm(prev => ({ ...prev, lineId: line.id }));
    }
  };

  const handleOrderChange = (value: string) => {
    setSelectedOrder(value);
    const order = orders.find(o => o.orderNo === value);
    if (order) {
      setForm(prev => ({ ...prev, orderId: order.id }));
      
      // Find style for this order
      const style = styles.find(s => s.id === order.styleId);
      if (style) {
        // You could set style-related information here
      }
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.lineId) {
      Alert.alert('Validation Error', 'Please select a production line');
      return false;
    }
    
    if (!form.orderId) {
      Alert.alert('Validation Error', 'Please select an order');
      return false;
    }
    
    if (!form.targetQuantity || parseInt(form.targetQuantity) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target quantity');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const lineSetup: Omit<LineSetup, 'id'> = {
        lineId: form.lineId,
        orderId: form.orderId,
        productionDate: form.productionDate.toISOString().split('T')[0],
        targetQuantity: parseInt(form.targetQuantity),
        setupTime: form.setupTime || new Date().toISOString(),
        isActive: true,
      };
      
      await ProductionService.createLineSetup(lineSetup);
      
      Alert.alert('Success', 'Line setup created successfully!');
      
      // Reset form
      setForm({
        lineId: 0,
        orderId: 0,
        productionDate: new Date(),
        targetQuantity: '',
        setupTime: '',
      });
      setSelectedLine('');
      setSelectedOrder('');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create line setup');
    } finally {
      setSubmitting(false);
    }
  };

  const permissionCheck = checkPermissions();
  if (permissionCheck) return permissionCheck;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Line Setup</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Configure Production Line</ThemedText>
            
            {/* Line Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Production Line</ThemedText>
              <CustomDropDown
                options={lines.map(line => line.name)}
                selected={selectedLine}
                onSelect={handleLineChange}
                placeholder="Select Production Line"
              />
            </View>
            
            {/* Order Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Production Order</ThemedText>
              <CustomDropDown
                options={orders.map(order => order.orderNo)}
                selected={selectedOrder}
                onSelect={handleOrderChange}
                placeholder="Select Order"
              />
            </View>
            
            {/* Production Date */}
            <View style={styles.formGroup}>
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
            
            {/* Target Quantity */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Target Quantity</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter target quantity"
                value={form.targetQuantity}
                onChangeText={(value) => handleChange('targetQuantity', value)}
                keyboardType="numeric"
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
                <ThemedText style={styles.buttonText}>Configure Line</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  content: {
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#007AFF',
  },
  formGroup: {
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
    borderColor: '#ddd',
    borderWidth: 1,
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
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#dc3545',
  },
});