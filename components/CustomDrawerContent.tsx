import { useAuth } from '@/app/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CustomDrawerContent = (props: any) => {
  const { logout } = useAuth();

  const user = {
    name: 'Shadman Sakib',
    email: 'shadman@example.com',
    image: 'https://i.pravatar.cc/150?img=12',
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.profileSection}>
          <Image source={{ uri: user.image }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.divider} />
        <DrawerItemList {...props} />
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
