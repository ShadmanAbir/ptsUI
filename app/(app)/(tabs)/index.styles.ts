import { StyleSheet } from 'react-native';

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

export default styles;
