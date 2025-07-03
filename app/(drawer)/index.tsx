import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import CustomDropDown from '@/components/CustomDropDown';
import HourlyProductionChart from '@/components/HourlyProductionChart';
import ProductionTable from '@/components/ProductionTable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const lines = ['All Lines', 'Line 1', 'Line 2', 'Line 3'];
const buyers = ['All Buyers', 'Buyer A', 'Buyer B', 'Buyer C'];
const hours = ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5'];
const productionData = [
  {
    line: 'Line 1',
    buyer: 'Buyer A',
    orderNo: 'ORD001',
    color: 'Red',
    qty: 100,
    target: 120,
    hourly: [10, 15, 20, 25, 30, 0, 0, 0],
  },
  {
    line: 'Line 2',
    buyer: 'Buyer B',
    orderNo: 'ORD002',
    color: 'Blue',
    qty: 150,
    target: 180,
    hourly: [12, 18, 22, 28, 35, 0, 0, 0],
  },
  {
    line: 'Line 3',
    buyer: 'Buyer C',
    orderNo: 'ORD003',
    color: 'Green',
    qty: 200,
    target: 210,
    hourly: [20, 25, 30, 35, 40, 0, 0, 0],
  },
];

export default function Dashboard() {
  const [selectedLine, setSelectedLine] = useState('All Lines');
  const [selectedBuyer, setSelectedBuyer] = useState('All Buyers');

  // Filter data based on dropdowns
  const filteredData = productionData.filter(row =>
    (selectedLine === 'All Lines' || row.line === selectedLine) &&
    (selectedBuyer === 'All Buyers' || row.buyer === selectedBuyer)
  );

  // Chart data: sum hourly for filtered rows
  const chartData = hours.map((_, i) =>
    filteredData.reduce((sum, row) => sum + (row.hourly[i] || 0), 0)
  );

  return (
    <ThemedView style={dashboardStyles.container}>
      <ThemedText type="title" style={dashboardStyles.heading}>Production Dashboard</ThemedText>
      <View style={dashboardStyles.filters}>
        <CustomDropDown
          options={lines}
          selected={selectedLine}
          onSelect={setSelectedLine}
          placeholder="Select Line"
        />
        <CustomDropDown
          options={buyers}
          selected={selectedBuyer}
          onSelect={setSelectedBuyer}
          placeholder="Select Buyer"
        />
      </View>
      <ScrollView contentContainerStyle={dashboardStyles.scrollContent}>
        <View style={dashboardStyles.chartCard}>
          <ThemedText type="subtitle" style={dashboardStyles.chartTitle}>Hourly Production</ThemedText>
          <HourlyProductionChart labels={hours} data={chartData} />
        </View>
        <View style={dashboardStyles.tableCard}>
          <ThemedText type="subtitle" style={dashboardStyles.tableTitle}>Production Table</ThemedText>
          <ProductionTable data={filteredData} hours={hours} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 1,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 12,
    padding: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  tableTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
});
