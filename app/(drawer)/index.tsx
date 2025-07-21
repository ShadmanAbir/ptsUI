import { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import CustomDropDown from '@/components/CustomDropDown';
import HourlyProductionChart from '@/components/HourlyProductionChart';
import ProductionTable from '@/components/ProductionTable';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { Buyer, DashboardMetrics, ProductionLine } from '@/types/production';

const hours = ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3', '3-4', '4-5'];

export default function Dashboard() {
  const [selectedLine, setSelectedLine] = useState('All Lines');
  const [selectedBuyer, setSelectedBuyer] = useState('All Buyers');
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState<number[]>(new Array(8).fill(0));

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [linesData, buyersData, metricsData] = await Promise.all([
        ProductionService.getProductionLines(),
        ProductionService.getBuyers(),
        ProductionService.getDashboardMetrics(),
      ]);

      setLines(linesData);
      setBuyers(buyersData);
      setMetrics(metricsData);
      
      // Generate sample hourly data for chart
      const sampleHourlyData = hours.map(() => Math.floor(Math.random() * 50) + 20);
      setChartData(sampleHourlyData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const lineOptions = ['All Lines', ...lines.map(line => line.name)];
  const buyerOptions = ['All Buyers', ...buyers.map(buyer => buyer.name)];

  return (
    <ThemedView style={dashboardStyles.container}>
      <ThemedText type="title" style={dashboardStyles.heading}>Production Dashboard</ThemedText>
      
      {/* Key Metrics Cards */}
      {metrics && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={dashboardStyles.metricsContainer}
        >
          <View style={dashboardStyles.metricCard}>
            <ThemedText style={dashboardStyles.metricValue}>{metrics.todayProduction}</ThemedText>
            <ThemedText style={dashboardStyles.metricLabel}>Today's Production</ThemedText>
          </View>
          <View style={dashboardStyles.metricCard}>
            <ThemedText style={dashboardStyles.metricValue}>{metrics.overallEfficiency.toFixed(1)}%</ThemedText>
            <ThemedText style={dashboardStyles.metricLabel}>Efficiency</ThemedText>
          </View>
          <View style={dashboardStyles.metricCard}>
            <ThemedText style={dashboardStyles.metricValue}>{metrics.qualityRate.toFixed(1)}%</ThemedText>
            <ThemedText style={dashboardStyles.metricLabel}>Quality Rate</ThemedText>
          </View>
          <View style={dashboardStyles.metricCard}>
            <ThemedText style={dashboardStyles.metricValue}>{metrics.activeLines}/{metrics.totalLines}</ThemedText>
            <ThemedText style={dashboardStyles.metricLabel}>Active Lines</ThemedText>
          </View>
        </ScrollView>
      )}

      <View style={dashboardStyles.filters}>
        <CustomDropDown
          options={lineOptions}
          selected={selectedLine}
          onSelect={setSelectedLine}
          placeholder="Select Line"
        />
        <CustomDropDown
          options={buyerOptions}
          selected={selectedBuyer}
          onSelect={setSelectedBuyer}
          placeholder="Select Buyer"
        />
      </View>
      
      <ScrollView 
        contentContainerStyle={dashboardStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={dashboardStyles.chartCard}>
          <ThemedText type="subtitle" style={dashboardStyles.chartTitle}>Hourly Production</ThemedText>
          <HourlyProductionChart labels={hours} data={chartData} />
        </View>
        <View style={dashboardStyles.tableCard}>
          <ThemedText type="subtitle" style={dashboardStyles.tableTitle}>Production Summary</ThemedText>
          <ProductionTable />
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
  metricsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
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
