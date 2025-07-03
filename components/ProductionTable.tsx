import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import styles from './ProductionTable.styles';

interface LineConfiguration {
  id: number;
  lineId: number;
  productionDate: string;
  style: string;
  orderNo: string;
  buyer: string;
  fabricType: string;
  pmId: number;
}

interface HourlyEntry {
  id: number;
  lineSetupId: number;
  hourSlot: string;
  targetQuantity: number;
  actualQuantity: number;
  remarks: string | null;
}

interface ProductionData {
  lineConfiguration: LineConfiguration;
  hourlyEntries: HourlyEntry[];
}

export default function ProductionScreen() {
  const [data, setData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('https://localhost:7438/api/Production')
      .then(res => {
        setData(res.data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container}>
      {data.map((entry, idx) => {
        const config = entry.lineConfiguration;
        const hourly = entry.hourlyEntries;

        const totalTarget = hourly.reduce((sum, h) => sum + h.targetQuantity, 0);
        const totalActual = hourly.reduce((sum, h) => sum + h.actualQuantity, 0);

        return (
          <View key={idx} style={[styles.card, idx % 2 === 0 ? styles.evenCard : styles.oddCard]}>
            <Text style={styles.title}>Line #{config.lineId} | Style: {config.style}</Text>
            <Text style={styles.subTitle}>Order: {config.orderNo} | Buyer: {config.buyer}</Text>
            <Text style={styles.subTitle}>Fabric: {config.fabricType} | Date: {config.productionDate.slice(0, 10)}</Text>

            <View style={styles.hourHeaderRow}>
              <Text style={styles.hourHeader}>Hour</Text>
              <Text style={styles.hourHeader}>Target</Text>
              <Text style={styles.hourHeader}>Actual</Text>
            </View>

            {hourly.map((h, i) => (
              <View key={i} style={styles.hourRow}>
                <Text style={styles.hourCell}>{h.hourSlot}</Text>
                <Text style={styles.hourCell}>{h.targetQuantity}</Text>
                <Text style={styles.hourCell}>{h.actualQuantity}</Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{totalTarget}</Text>
              <Text style={styles.totalValue}>{totalActual}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
