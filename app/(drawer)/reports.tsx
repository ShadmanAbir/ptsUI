import { useAuth } from '@/app/AuthContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiFetch } from '@/constants/Api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface ReportData {
  lineId: number;
  productionDate: string;
  style: string;
  orderNo: string;
  buyer: string;
  totalTarget: number;
  totalActual: number;
  efficiency: number;
}

export default function ReportsScreen() {
  const { permissions } = useAuth();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  // Check permissions
  if (!permissions.includes('ProductionDashboardView')) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          You don't have permission to view reports
        </ThemedText>
      </ThemedView>
    );
  }

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/reports/production', {
        method: 'POST',
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }),
      });
      setReportData(response.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      await apiFetch('/reports/export', {
        method: 'POST',
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          format: 'excel',
        }),
      });
      Alert.alert('Success', 'Report exported successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const calculateTotals = () => {
    const totalTarget = reportData.reduce((sum, item) => sum + item.totalTarget, 0);
    const totalActual = reportData.reduce((sum, item) => sum + item.totalActual, 0);
    const overallEfficiency = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    
    return { totalTarget, totalActual, overallEfficiency };
  };

  const totals = calculateTotals();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Production Reports</ThemedText>
      
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowStartPicker(true)}
        >
          <ThemedText style={styles.dateText}>
            Start: {startDate.toDateString()}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowEndPicker(true)}
        >
          <ThemedText style={styles.dateText}>
            End: {endDate.toDateString()}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.fetchButton} onPress={fetchReports}>
          <ThemedText style={styles.buttonText}>Generate Report</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
          <ThemedText style={styles.buttonText}>Export Excel</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <ScrollView style={styles.reportContainer}>
          {reportData.length > 0 && (
            <>
              <View style={styles.summaryCard}>
                <ThemedText type="subtitle" style={styles.summaryTitle}>Summary</ThemedText>
                <View style={styles.summaryRow}>
                  <ThemedText>Total Target: {totals.totalTarget}</ThemedText>
                  <ThemedText>Total Actual: {totals.totalActual}</ThemedText>
                </View>
                <ThemedText style={[styles.efficiency, { color: totals.overallEfficiency >= 100 ? '#28a745' : '#dc3545' }]}>
                  Overall Efficiency: {totals.overallEfficiency.toFixed(1)}%
                </ThemedText>
              </View>

              {reportData.map((item, index) => (
                <View key={index} style={styles.reportCard}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="subtitle">Line {item.lineId} - {item.style}</ThemedText>
                    <ThemedText style={styles.date}>{item.productionDate}</ThemedText>
                  </View>
                  <ThemedText>Order: {item.orderNo} | Buyer: {item.buyer}</ThemedText>
                  <View style={styles.metricsRow}>
                    <ThemedText>Target: {item.totalTarget}</ThemedText>
                    <ThemedText>Actual: {item.totalActual}</ThemedText>
                    <ThemedText style={[styles.efficiency, { color: item.efficiency >= 100 ? '#28a745' : '#dc3545' }]}>
                      {item.efficiency.toFixed(1)}%
                    </ThemedText>
                  </View>
                </View>
              ))}
            </>
          )}
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  fetchButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loader: {
    marginTop: 50,
  },
  reportContainer: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#007AFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  efficiency: {
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#dc3545',
  },
});