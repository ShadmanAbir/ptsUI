import { useAuth } from '@/app/AuthContext';
import CustomDropDown from '@/components/CustomDropDown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { HourlyProduction, QualityDefect } from '@/types/production';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const defectTypes = [
  'Stitch Defect',
  'Fabric Defect',
  'Print Defect',
  'Size Variation',
  'Color Variation',
  'Trim Defect',
  'Other',
];

const severityLevels: Array<'Minor' | 'Major' | 'Critical'> = [
  'Minor',
  'Major',
  'Critical',
];

export default function QualityControlScreen() {
  const { permissions } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hourlyEntries, setHourlyEntries] = useState<HourlyProduction[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string>('');
  const [selectedDefectType, setSelectedDefectType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('Minor');
  const [defectCount, setDefectCount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');

  // Check permissions
  const checkPermissions = () => {
    if (!permissions.includes('QualityControl')) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>
            You don't have permission to access Quality Control
          </ThemedText>
        </ThemedView>
      );
    }
    return null;
  };

  // Load hourly entries
  useEffect(() => {
    const loadHourlyEntries = async () => {
      setLoading(true);
      try {
        // This is a mock implementation - in a real app, you'd fetch from API
        const cachedEntries = await AsyncStorage.getItem('cache_hourly_entries');
        if (cachedEntries) {
          setHourlyEntries(JSON.parse(cachedEntries));
        } else {
          // Mock data if no cached entries
          setHourlyEntries([
            { 
              id: 1, 
              lineSetupId: 1, 
              hourSlot: '9-10', 
              targetQuantity: 100, 
              actualQuantity: 95, 
              defectQuantity: 5, 
              entryTime: new Date().toISOString(),
              enteredBy: 1
            },
            { 
              id: 2, 
              lineSetupId: 2, 
              hourSlot: '10-11', 
              targetQuantity: 120, 
              actualQuantity: 115, 
              defectQuantity: 3, 
              entryTime: new Date().toISOString(),
              enteredBy: 1
            },
          ]);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load production entries');
      } finally {
        setLoading(false);
      }
    };

    loadHourlyEntries();
  }, []);

  const handleSubmit = async () => {
    if (!selectedEntry) {
      Alert.alert('Error', 'Please select a production entry');
      return;
    }

    if (!selectedDefectType) {
      Alert.alert('Error', 'Please select a defect type');
      return;
    }

    if (!defectCount || parseInt(defectCount) <= 0) {
      Alert.alert('Error', 'Please enter a valid defect count');
      return;
    }

    setSubmitting(true);

    try {
      const entryId = parseInt(selectedEntry.split(' - ')[0]);
      
      const defect: Omit<QualityDefect, 'id'> = {
        hourlyProductionId: entryId,
        defectType: selectedDefectType,
        defectCount: parseInt(defectCount),
        severity: selectedSeverity as 'Minor' | 'Major' | 'Critical',
        description: description || undefined,
        actionTaken: actionTaken || undefined,
      };

      await ProductionService.submitQualityDefect(defect);
      
      Alert.alert('Success', 'Quality defect recorded successfully');
      
      // Reset form
      setSelectedDefectType('');
      setDefectCount('');
      setDescription('');
      setActionTaken('');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit quality defect');
    } finally {
      setSubmitting(false);
    }
  };

  const entryOptions = hourlyEntries.map(entry => 
    `${entry.id} - Line ${entry.lineSetupId}, ${entry.hourSlot}, Qty: ${entry.actualQuantity}`
  );

  const permissionCheck = checkPermissions();
  if (permissionCheck) return permissionCheck;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Quality Control</ThemedText>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>Record Defect</ThemedText>
            
            {/* Production Entry Selection */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Production Entry</ThemedText>
              <CustomDropDown
                options={entryOptions}
                selected={selectedEntry}
                onSelect={setSelectedEntry}
                placeholder="Select Production Entry"
              />
            </View>
            
            {/* Defect Type */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Defect Type</ThemedText>
              <CustomDropDown
                options={defectTypes}
                selected={selectedDefectType}
                onSelect={setSelectedDefectType}
                placeholder="Select Defect Type"
              />
            </View>
            
            {/* Severity */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Severity</ThemedText>
              <CustomDropDown
                options={severityLevels}
                selected={selectedSeverity}
                onSelect={setSelectedSeverity}
                placeholder="Select Severity"
              />
            </View>
            
            {/* Defect Count */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Defect Count</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter number of defects"
                value={defectCount}
                onChangeText={setDefectCount}
                keyboardType="numeric"
              />
            </View>
            
            {/* Description */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the defect"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
            
            {/* Action Taken */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Action Taken</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe action taken to fix the issue"
                value={actionTaken}
                onChangeText={setActionTaken}
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
                <ThemedText style={styles.buttonText}>Submit Defect Report</ThemedText>
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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