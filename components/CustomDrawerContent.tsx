import { useAuth } from '@/app/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { drawerItems } from '../constants/DrawerItem';
  // const user = {
  //   name: 'Shadman Sakib',
  //   email: 'shadman@example.com',
  //   image: 'https://i.pravatar.cc/150?img=12',
  // };
  const CustomDrawerContent = (props: any) => {
  const { logout, permissions,user } = useAuth();
  

  // Filter items by permission (if no requiredPermissions, show always)
  const filteredItems = drawerItems.filter(item =>
    !item.requiredPermissions ||
    item.requiredPermissions.every(p => permissions.includes(p))
  );

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>

<View style={styles.profileSection}>
  <Image source={{ uri:/* user?.avatarUrl ||*/ 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
  <Text style={styles.name}>{user?.fullName || 'Guest'}</Text>
  {/* <Text style={styles.email}>{user?.email || 'guest@example.com'}</Text> */}
</View>
        <View style={styles.divider} />

        {/* Render filtered drawer items */}
{filteredItems.map(({ label, iconName, route }) => (
  <DrawerItem
    key={route}
    label={label}
    icon={({ color, size }) => <Ionicons name={iconName as any} size={size} color={color} />}
    onPress={() => props.navigation.navigate(route)}
  />
))}
      </DrawerContentScrollView>

      <TouchableOpacity style={styles.logoutSection} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#333" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  profileSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#e6e6e6',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  logoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
});
