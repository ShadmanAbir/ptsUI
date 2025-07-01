import { ScrollView, Text, View } from 'react-native';
import styles from './ProductionTable.styles';

export default function ProductionTable({ data, hours }) {
  const hourlyTotals = hours.map((_, i) =>
    data.reduce((sum, row) => sum + (row.hourly[i] || 0), 0)
  );

  return (
    <ScrollView horizontal>
      <View>
        <View style={styles.rowHeader}>
          {['Line', 'Buyer', 'Order No', 'Color', 'Qty', 'Target', ...hours, 'Total'].map((col, i) => (
            <Text key={i} style={[styles.cell, styles.headerCell]}>{col}</Text>
          ))}
        </View>

        {data.map((row, idx) => (
          <View style={[styles.row, idx % 2 === 0 ? styles.evenRow : styles.oddRow]} key={idx}>
            <Text style={styles.cell}>{row.line}</Text>
            <Text style={styles.cell}>{row.buyer}</Text>
            <Text style={styles.cell}>{row.orderNo}</Text>
            <Text style={styles.cell}>{row.color}</Text>
            <Text style={styles.cell}>{row.qty}</Text>
            <Text style={styles.cell}>{row.target}</Text>
            {row.hourly.map((val, i) => (
              <Text style={styles.cell} key={i}>{val}</Text>
            ))}
            <Text style={[styles.cell, styles.bold]}>{row.hourly.reduce((a, b) => a + b, 0)}</Text>
          </View>
        ))}

        <View style={[styles.row, styles.totalRow]}>
          <Text style={[styles.cell, styles.bold]}>Total</Text>
          {[...Array(5)].map((_, i) => <Text key={i} style={styles.cell}></Text>)}
          {hourlyTotals.map((val, i) => (
            <Text key={i} style={[styles.cell, styles.bold]}>{val}</Text>
          ))}
          <Text style={[styles.cell, styles.bold]}>{hourlyTotals.reduce((a, b) => a + b, 0)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

