import { useState } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';
import CustomDropdown from '../../components/CustomDropDown';
import HourlyProductionChart from '../../components/HourlyProductionChart';
import ProductionTable from '../../components/ProductionTable';
import styles from './index.styles';

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
