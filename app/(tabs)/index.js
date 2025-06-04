import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CustomDropdown from '../../components/CustomDropDown';
import HourlyProductionChart from '../../components/HourlyProductionChart';
import ProductionTable from '../../components/ProductionTable';

const hours = ['8-9', '9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7'];

const dummyData = [
  {
    line: 'A', buyer: 'ID-KIDS', orderNo: '713991', color: 'Blue', qty: 12375, target: 220,
    hourly: [140, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    line: 'B', buyer: 'VIKASH', orderNo: '714855', color: 'Red', qty: 20935, target: 280,
    hourly: [220, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    line: 'C', buyer: 'KAPPAHL', orderNo: '723795', color: 'White', qty: 7800, target: 220,
    hourly: [180, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];


export default function ProductionDashboard() {
  const [pm, setPm] = useState('PM-1');
  const [floor, setFloor] = useState('Floor-B');
  const [line, setLine] = useState('All');

  const filteredData = line === 'All' ? dummyData : dummyData.filter(d => d.line === line);
  const hourlyTotals = hours.map((_, i) =>
    filteredData.reduce((sum, row) => sum + (row.hourly[i] || 0), 0)
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📊 Production Dashboard</Text>

      <View style={styles.pickers}>
        <CustomDropdown
          options={['PM-1', 'PM-2']}
          selected={pm}
          onSelect={setPm}
          placeholder="Select PM"
        />
        <CustomDropdown
          options={['Floor-B']}
          selected={floor}
          onSelect={setFloor}
          placeholder="Select Floor"
        />
        <CustomDropdown
          options={['All', ...dummyData.map(row => row.line)]}
          selected={line}
          onSelect={setLine}
          placeholder="Select Line"
        />
      </View>
       {/* TABLE */}
      <ProductionTable data={filteredData} hours={hours} />

      {/* CHART */}
      <Text style={styles.chartTitle}>Hourly Production Summary</Text>
      <HourlyProductionChart labels={hours} data={hourlyTotals} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  pickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  dropdownContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  arrow: {
    fontSize: 16,
    color: '#007AFF',
  },

  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#007AFF',
  },

  rowHeader: { flexDirection: 'row', backgroundColor: '#007AFF' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  evenRow: { backgroundColor: '#fff' },
  oddRow: { backgroundColor: '#f1f1f1' },
  totalRow: { backgroundColor: '#d1ecf1' },
  cell: { minWidth: 80, paddingVertical: 6, paddingHorizontal: 4, textAlign: 'center' },
  headerCell: { color: '#fff', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
  chartTitle: { textAlign: 'center', fontSize: 20, marginVertical: 15, fontWeight: '600' },
  chart: { marginVertical: 10, borderRadius: 16, alignSelf: 'center' },
});
