import { ScrollView, Text, View } from 'react-native';
import styles from './ProductionTable.styles';

interface ProductionRow {
  line: string;
  buyer: string;
  orderNo: string;
  color: string;
  qty: number;
  target: number;
  hourly: number[];
}

interface ProductionTableProps {
  data: ProductionRow[];
  hours: string[];
}

export default function ProductionTable({ data, hours }: ProductionTableProps) {
  const hourlyTotals = hours.map((_: any, i: number) =>
    data.reduce((sum: number, row: ProductionRow) => sum + (row.hourly[i] || 0), 0)
  );

  return (
    <ScrollView horizontal>
      <View>
        <View style={styles.rowHeader}>
          {['Line', 'Buyer', 'Order No', 'Color', 'Qty', 'Target', ...hours, 'Total'].map((col, i) => (
            <Text key={i} style={[styles.cell, styles.headerCell]}>{col}</Text>
          ))}
        </View>

        {data.map((row: ProductionRow, idx: number) => (
          <View style={[styles.row, idx % 2 === 0 ? styles.evenRow : styles.oddRow]} key={idx}>
            <Text style={styles.cell}>{row.line}</Text>
            <Text style={styles.cell}>{row.buyer}</Text>
            <Text style={styles.cell}>{row.orderNo}</Text>
            <Text style={styles.cell}>{row.color}</Text>
            <Text style={styles.cell}>{row.qty}</Text>
            <Text style={styles.cell}>{row.target}</Text>
            {row.hourly.map((val: number, i: number) => (
              <Text style={styles.cell} key={i}>{val}</Text>
            ))}
            <Text style={[styles.cell, styles.bold]}>{row.hourly.reduce((a: number, b: number) => a + b, 0)}</Text>
          </View>
        ))}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.cell, styles.bold]}>Total</Text>
          {[...Array(5)].map((_: any, i: number) => <Text key={i} style={styles.cell}></Text>)}
          {hourlyTotals.map((val: number, i: number) => (
            <Text key={i} style={[styles.cell, styles.bold]}>{val}</Text>
          ))}
          <Text style={[styles.cell, styles.bold]}>{hourlyTotals.reduce((a: number, b: number) => a + b, 0)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}