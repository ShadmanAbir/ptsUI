import { useAuth } from '@/app/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { DailyLineSetup, HourlyEntry } from '@/types/production';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface HourlyEntryForm {
  dailyLineSetupId: number;
  hourSlot: string;
  targetQuantity: string;
  actualQuantity: string;
  remarks: string;
}

interface EfficiencyData {
  percentage: number;
  color: string;
  status: string;
}

export default function HourlyEntryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Data states
  const [lineSetups, setLineSetups] = useState<DailyLineSetup[]>([]);
  const [hourlyEntries, setHourlyEntries] = useState<HourlyEntry[]>([]);
  const [hourSlots] = useState<string[]>([
    '8-9', '9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7'
  ]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selection states
  const [selectedLineSetup, setSelectedLineSetup] = useState<DailyLineSetup | null>(null);
  const [selectedHourSlot, setSelectedHourSlot] = useState<string>('');

  // Form state
  const [form, setForm] = useState<HourlyEntryForm>({
    dailyLineSetupId: 0,
    hourSlot: '',
    targetQuantity: '',
    actualQuantity: '',
    remarks: '',
  });
  
  // Efficiency state
  const [efficiency, setEfficiency] = useState<EfficiencyData | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Load line setups for today
      const lineSetupsData = await ProductionService.getDailyLineSetups(today);
      
      // Filter line setups based on user's assigned lines if not admin
      const filteredLineSetups = user?.role === 'Admin' 
        ? lineSetupsData 
        : lineSetupsData.filter(setup => 
            user?.assignedLines?.includes(setup.lineId)
          );
      
      setLineSetups(filteredLineSetups);
      
      if (filteredLineSetups.length === 0) {
        Alert.alert(
          'No Line Setups',
          'You need to set up production lines for today first.',
          [
            {
              text: 'Go to Line Setup',
              onPress: () => router.push('/dailylinesetup'),
            },
          ]
        );
      }
      
      // Load hourly entries for today
      const hourlyEntriesData = await ProductionService.getHourlyEntries(today);
      setHourlyEntries(hourlyEntriesData);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLineSetupSelect = (lineSetup: DailyLineSetup) => {
    setSelectedLineSetup(lineSetup);
    setForm(prev => ({ 
      ...prev, 
      dailyLineSetupId: lineSetup.id || 0,
      hourSlot: '',
      targetQuantity: '',
      actualQuantity: '',
      remarks: '',
    }));
    
    // Suggest next hour slot that hasn't been entered yet
    const existingEntries = hourlyEntries.filter(entry => 
      entry.dailyLineSetupId === lineSetup.id
    );
    
    const enteredHourSlots = existingEntries.map(entry => entry.hourSlot);
    const nextHourSlot = hourSlots.find(slot => !enteredHourSlots.includes(slot));
    
    if (nextHourSlot) {
      setSelectedHourSlot(nextHourSlot);
      setForm(prev => ({ ...prev, hourSlot: nextHourSlot }));
    }
  };

  const handleHourSlotSelect = (hourSlot: string) => {
    setSelectedHourSlot(hourSlot);
    setForm(prev => ({ ...prev, hourSlot }));
    
    // Check if there's an existing entry for this hour slot
    if (selectedLineSetup) {
      const existingEntry = hourlyEntries.find(entry => 
        entry.dailyLineSetupId === selectedLineSetup.id && 
        entry.hourSlot === hourSlot
      );
      
      if (existingEntry) {
        // Pre-fill the form with existing data
        const targetQty = existingEntry.targetQuantity.toString();
        const actualQty = existingEntry.actualQuantity.toString();
        
        setForm(prev => ({
          ...prev,
          targetQuantity: targetQty,
          actualQuantity: actualQty,
          remarks: existingEntry.remarks || '',
        }));
        
        // Calculate efficiency for existing entry
        calculateEfficiency(targetQty, actualQty);
      }
    }
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Calculate efficiency when target or actual quantity changes
      if (name === 'targetQuantity' || name === 'actualQuantity') {
        calculateEfficiency(newForm.targetQuantity, newForm.actualQuantity);
      }
      
      return newForm;
    });
  };
  
  // Calculate efficiency and set appropriate color
  const calculateEfficiency = (target: string, actual: string) => {
    const targetNum = parseInt(target);
    const actualNum = parseInt(actual);
    
    if (!targetNum || targetNum <= 0 || !actualNum) {
      setEfficiency(null);
      return;
    }
    
    const efficiencyPercentage = (actualNum / targetNum) * 100;
    
    let color = '#dc3545'; // Red for < 80%
    let status = 'Low';
    
    if (efficiencyPercentage >= 100) {
      color = '#28a745'; // Green for >= 100%
      status = 'Excellent';
    } else if (efficiencyPercentage >= 80) {
      color = '#ffc107'; // Yellow for 80-99%
      status = 'Good';
    }
    
    setEfficiency({
      percentage: efficiencyPercentage,
      color,
      status
    });
  };

  const validateForm = () => {
    if (!form.dailyLineSetupId) {
      Alert.alert('Validation Error', 'Please select a production line');
      return false;
    }

    if (!form.hourSlot) {
      Alert.alert('Validation Error', 'Please select an hour slot');
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
      const hourlyEntryData: Omit<HourlyEntry, 'id' | 'entryTime'> = {
        dailyLineSetupId: form.dailyLineSetupId,
        hourSlot: form.hourSlot,
        targetQuantity: parseInt(form.targetQuantity),
        actualQuantity: parseInt(form.actualQuantity),
        remarks: form.remarks || undefined,
        entryTime: new Date().toISOString(),
        enteredBy: user?.id || 0,
      };

      await ProductionService.submitHourlyEntry(hourlyEntryData);

      Alert.alert('Success', 'Hourly entry submitted successfully!');
      
      // Refresh data
      await loadData();
      
      // Reset form for next entry but keep the selected line setup
      setForm(prev => ({
        ...prev,
        hourSlot: '',
        targetQuantity: '',
        actualQuantity: '',
        remarks: '',
      }));
      setSelectedHourSlot('');
      setEfficiency(null);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit hourly entry');
    } finally {
      setSubmitting(false);
    }
  };

  const renderLineSetupItem = ({ item }: { item: DailyLineSetup }) => {
    const isSelected = selectedLineSetup?.id === item.id;
    
    return (
      <TouchableOpacity 
        style={[styles.lineSetupItem, isSelected && styles.selectedLineSetup]}
        onPress={() => handleLineSetupSelect(item)}
      >
        <ThemedText style={styles.lineSetupTitle}>Line {item.lineId}</ThemedText>
        <ThemedText style={styles.lineSetupSubtitle}>{item.style}</ThemedText>
        <ThemedText style={styles.lineSetupSubtitle}>{item.buyer} | {item.orderNo}</ThemedText>
      </TouchableOpacity>
    );
  };

  const renderHourSlotItem = ({ item }: { item: string }) => {
    const isSelected = selectedHourSlot === item;
    const isEntered = selectedLineSetup && hourlyEntries.some(entry => 
      entry.dailyLineSetupId === selectedLineSetup.id && 
      entry.hourSlot === item
    );
    
    return (
      <TouchableOpacity 
        style={[
          styles.hourSlotItem, 
          isSelected && styles.selectedHourSlot,
          isEntered && styles.enteredHourSlot
        ]}
        onPress={() => handleHourSlotSelect(item)}
      >
        <ThemedText style={styles.hourSlotText}>{item}</ThemedText>
        {isEntered && <ThemedText style={styles.enteredText}>✓</ThemedText>}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <ThemedText type="title" style={styles.heading}>Hourly Production Entry</ThemedText>
          
          {/* Line Setups */}
          <ThemedText style={styles.sectionTitle}>Select Production Line</ThemedText>
          <FlatList
            horizontal
            data={lineSetups}
            renderItem={renderLineSetupItem}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.lineSetupList}
            showsHorizontalScrollIndicator={false}
          />
          
          {/* Hour Slots */}
          {selectedLineSetup && (
            <>
              <ThemedText style={styles.sectionTitle}>Select Hour Slot</ThemedText>
              <FlatList
                horizontal
                data={hourSlots}
                renderItem={renderHourSlotItem}
                keyExtractor={item => item}
                contentContainerStyle={styles.hourSlotList}
                showsHorizontalScrollIndicator={false}
              />
              
              {/* Entry Form */}
              {selectedHourSlot && (
                <View style={styles.formContainer}>
                  <ThemedText style={styles.formTitle}>
                    Entry for Line {selectedLineSetup.lineId} - {selectedHourSlot}
                  </ThemedText>
                  
                  {/* Target Quantity */}
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Target Quantity</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter target quantity"
                      value={form.targetQuantity}
                      onChangeText={(value) => handleChange('targetQuantity', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  {/* Actual Quantity */}
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.label}>Actual Quantity</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter actual quantity"
                      value={form.actualQuantity}
                      onChangeText={(value) => handleChange('actualQuantity', value)}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  {/* Efficiency Indicator */}
                  {efficiency && (
                    <View style={styles.efficiencyContainer}>
                      <ThemedText style={styles.efficiencyLabel}>Efficiency:</ThemedText>
                      <View style={styles.efficiencyWrapper}>
                        <View 
                          style={[styles.efficiencyBar, { 
                            width: `${Math.min(efficiency.percentage, 100)}%`,
                            backgroundColor: efficiency.color 
                          }]}
                        />
                      </View>
                      <View style={styles.efficiencyTextContainer}>
                        <ThemedText style={[styles.efficiencyPercentage, { color: efficiency.color }]}>
                          {efficiency.percentage.toFixed(1)}%
                        </ThemedText>
                        <ThemedText style={[styles.efficiencyStatus, { color: efficiency.color }]}>
                          {efficiency.status}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                  
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
                </View>
              )}
            </>
          )}
        </>
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
  heading: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineSetupList: {
    paddingBottom: 16,
  },
  lineSetupItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedLineSetup: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  lineSetupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#007AFF',
  },
  lineSetupSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  hourSlotList: {
    paddingBottom: 16,
  },
  hourSlotItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    width: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedHourSlot: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  enteredHourSlot: {
    backgroundColor: '#e8f5e9',
  },
  hourSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  enteredText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#007AFF',
    textAlign: 'center',
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
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
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
  efficiencyContainer: {
    marginBottom: 16,
  },
  efficiencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  efficiencyWrapper: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  efficiencyBar: {
    height: '100%',
    borderRadius: 6,
  },
  efficiencyTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  efficiencyPercentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  efficiencyStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});