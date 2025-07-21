import { useAuth } from '@/app/AuthContext';
import CustomDropDown from '@/components/CustomDropDown';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ProductionService from '@/services/ProductionService';
import { ProductionOrder } from '@/types/production';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function OrdersScreen() {
  const { permissions } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProductionOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Check permissions
  const checkPermissions = () => {
    if (!permissions.includes('OrdersView')) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>
            You don't have permission to view orders
          </ThemedText>
        </ThemedView>
      );
    }
    return null;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await ProductionService.getProductionOrders();
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#ffc107'; // Yellow
      case 'In Progress':
        return '#007bff'; // Blue
      case 'Completed':
        return '#28a745'; // Green
      case 'Cancelled':
        return '#dc3545'; // Red
      default:
        return '#6c757d'; // Gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderOrderItem = ({ item }: { item: ProductionOrder }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => Alert.alert('Order Details', `Order ${item.orderNo} details will be shown here`)}
    >
      <View style={styles.orderHeader}>
        <ThemedText type="subtitle" style={styles.orderNo}>#{item.orderNo}</ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <ThemedText style={styles.statusText}>{item.status}</ThemedText>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <ThemedText>Quantity: {item.quantity}</ThemedText>
        <ThemedText>Unit Price: ${item.unitPrice.toFixed(2)}</ThemedText>
      </View>
      
      <View style={styles.orderFooter}>
        <ThemedText style={styles.dateText}>Created: {formatDate(item.createdAt)}</ThemedText>
        <ThemedText style={styles.dateText}>Delivery: {formatDate(item.deliveryDate)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

  const permissionCheck = checkPermissions();
  if (permissionCheck) return permissionCheck;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>Production Orders</ThemedText>
      
      <View style={styles.filterContainer}>
        <ThemedText style={styles.filterLabel}>Filter by Status:</ThemedText>
        <CustomDropDown
          options={statusOptions}
          selected={statusFilter}
          onSelect={setStatusFilter}
          placeholder="Select Status"
        />
      </View>
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No orders found</ThemedText>
            </View>
          }
        />
      )}
      
      {permissions.includes('OrdersCreate') && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => Alert.alert('Create Order', 'Order creation form will be shown here')}
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#007AFF',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#dc3545',
  },
});