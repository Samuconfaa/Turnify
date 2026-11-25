import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { EmployeeTabLayout } from '@/components/EmployeeTabLayout';
import { Header, Input, PrimaryBtn } from '@/components/ui';
import { api, apiError } from '@/services/api';
import { textOnPrimary } from '@/constants/tokens';

export default function EmployeeChangePasswordScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const textOnPri = textOnPrimary(t);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!oldPw || !newPw || !confirmPw) {
      Alert.alert('Errore', 'Compila tutti i campi.');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Errore', 'La nuova password deve avere almeno 6 caratteri.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Errore', 'Le password non coincidono.');
      return;
    }
    try {
      setLoading(true);
      await api.patch('/api/users/change-password', { oldPassword: oldPw, newPassword: newPw });
      Alert.alert('Fatto', 'Password aggiornata.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeTabLayout>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header t={t} title="Cambia password" leading={
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: t.primary, fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 }}>Indietro</Text>
          </TouchableOpacity>
        } />
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Input t={t} label="Password attuale" placeholder="••••••••" value={oldPw} onChangeText={setOldPw} secure />
        <Input t={t} label="Nuova password" placeholder="min. 6 caratteri" value={newPw} onChangeText={setNewPw} secure />
        <Input t={t} label="Conferma nuova password" placeholder="••••••••" value={confirmPw} onChangeText={setConfirmPw} secure />
        {loading
          ? <ActivityIndicator color={t.primary} style={{ marginTop: 16 }} />
          : <PrimaryBtn t={t} onPress={handleSave} style={{ marginTop: 8 }}>
              Salva password
            </PrimaryBtn>
        }
      </ScrollView>
    </EmployeeTabLayout>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 16, paddingBottom: 40 },
});
