import { StyleSheet } from 'react-native';
import ProductionTable from '@/components/ProductionTable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DashboardScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Dashboard</ThemedText>
      <ProductionTable
        data={[
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
        ]}
        hours={['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5']}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
