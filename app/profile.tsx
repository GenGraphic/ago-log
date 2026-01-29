import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../appwrite';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await auth.get();
        setUser(res);
      } catch (e) {
        navigation.replace('(auth)/login');
      }
    })();
  }, []);

  const logout = async () => {
    try {
      await auth.deleteSession('current');
      navigation.replace('(auth)/login');
    } catch (e) {
      console.log('Logout error', e);
    }
  };

  if (!user) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Email: {user.email}</Text>
      <Text>ID: {user.$id}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex:1, padding:16 }, title: { fontSize:20, marginBottom:12 } });
