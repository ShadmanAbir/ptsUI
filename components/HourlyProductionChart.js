import { Dimensions, ScrollView, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import styles from './HourlyProductionChart.styles';

const screenWidth = Dimensions.get('window').width;

export default function HourlyProductionChart({ labels, data }) {
  // Set chart width to at least screen width or wider if many bars
  const barWidth = 60; 
  const chartWidth = Math.max(screenWidth, labels.length * barWidth);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={barWidth}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        overScrollMode="never"
      >
        <BarChart
          data={{ labels, datasets: [{ data }] }}
          width={chartWidth}
          height={260}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f2f2f2',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#007AFF' },
          }}
          style={styles.chart}
          fromZero
          showBarTops
        />
      </ScrollView>
    </View>
  );
}

