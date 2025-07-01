import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  rowHeader: { flexDirection: 'row', backgroundColor: '#007AFF' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  evenRow: { backgroundColor: '#fff' },
  oddRow: { backgroundColor: '#f1f1f1' },
  totalRow: { backgroundColor: '#d1ecf1' },
  cell: { minWidth: 80, paddingVertical: 6, paddingHorizontal: 4, textAlign: 'center' },
  headerCell: { color: '#fff', fontWeight: 'bold' },
  bold: { fontWeight: 'bold' },
});

export default styles;
