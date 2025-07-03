import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  evenCard: {
    backgroundColor: '#f9f9f9',
  },
  oddCard: {
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  subTitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  hourHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e1e1e1',
    paddingVertical: 6,
    marginTop: 10,
    borderRadius: 4,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  hourHeader: {
    width: '33.33%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  hourCell: {
    width: '33.33%',
    textAlign: 'center',
    fontSize: 13,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#bbb',
  },
  totalLabel: {
    width: '33.33%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  totalValue: {
    width: '33.33%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});
