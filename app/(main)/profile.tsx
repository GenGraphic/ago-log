import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../appwrite';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await auth.get();
        setUser(res);
      } catch {
        navigation.replace('(auth)/login');
      }
    })();
  }, [navigation]);

  const logout = async () => {
    try {
      await auth.deleteSession('current');
      navigation.replace('(auth)/login');
    } catch {
      console.log('Logout error');
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
