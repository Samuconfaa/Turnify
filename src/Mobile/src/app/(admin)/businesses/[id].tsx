import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Card, Header, Icon, Input, PrimaryBtn, DangerBtn, SectionLabel } from '@/components/ui';
import { BusinessService } from '@/services/business.service';
import { apiError } from '@/services/api';
import type { Business } from '@/types/employee.types';

export default function BusinessDetail() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (isNew) return;
    BusinessService.getBusiness(Number(id))
      .then(b => {
        setBusiness(b);
        setName(b.name);
        setBusinessType(b.businessType ?? '');
        setAddress(b.address ?? '');
        setPhone(b.phone ?? '');
      })
      .catch(e => Alert.alert('Errore', apiError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Errore', 'Il nome attività è obbligatorio.'); return; }
    setSaving(true);
    try {
      if (isNew) {
        await BusinessService.createBusiness({ name, businessType: businessType || undefined, address: address || undefined, phone: phone || undefined, isActive: true });
      } else {
        await BusinessService.updateBusiness(Number(id), { name, businessType: businessType || undefined, address: address || undefined, phone: phone || undefined });
      }
      router.back();
    } catch (e) {
      Alert.alert('Errore', apiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title={isNew ? 'Nuova attività' : (business?.name ?? '…')}
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={t.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <SectionLabel t={t}>Informazioni</SectionLabel>
          <Input t={t} label="Nome attività" value={name} onChangeText={setName} leadingIcon="building" />
          <Input t={t} label="Tipo attività" value={businessType} onChangeText={setBusinessType}
            leadingIcon="briefcase" trailingIcon="chev-d" />
          <Input t={t} label="Indirizzo" value={address} onChangeText={setAddress} leadingIcon="pin" />
          <Input t={t} label="Telefono" value={phone} onChangeText={setPhone}
            leadingIcon="phone" keyboardType="phone-pad" />

          {!isNew && (
            <>
              <SectionLabel t={t} style={styles.sectionGap}>Operativo</SectionLabel>
              <Card t={t} padding={14} onPress={() => router.push(`/(admin)/team` as any)}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: t.primaryLight }]}>
                    <Icon name="users" size={18} color={t.primary} strokeWidth={2} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={[styles.infoTitle, { color: t.text }]}>Dipendenti assegnati</Text>
                    <Text style={[styles.infoSub, { color: t.textSecondary }]}>Gestisci dal Team</Text>
                  </View>
                  <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2} />
                </View>
              </Card>
              <Card t={t} padding={14}
                onPress={() => router.push({ pathname: '/(admin)/business-hours', params: { id } } as any)}>
                <View style={styles.infoRow}>
                  <View style={[styles.infoIcon, { backgroundColor: t.kpiBlueBg }]}>
                    <Icon name="clock" size={18} color={t.kpiBlue} strokeWidth={2} />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={[styles.infoTitle, { color: t.text }]}>Orari di apertura</Text>
                    <Text style={[styles.infoSub, { color: t.textSecondary }]}>Configura orari per giorno</Text>
                  </View>
                  <Icon name="chev-r" size={18} color={t.textSecondary} strokeWidth={2} />
                </View>
              </Card>
            </>
          )}

          <View style={[styles.footer, { marginTop: 20 }]}>
            {!isNew && (
              <DangerBtn t={t} full={false} style={{ flex: 1 }}
                onPress={() => Alert.alert('Disattiva', 'Funzione disponibile dalla prossima versione.')}>
                Disattiva
              </DangerBtn>
            )}
            <PrimaryBtn t={t} onPress={handleSave} disabled={saving} style={{ flex: isNew ? 1 : 2 }}>
              {saving ? 'Salvataggio…' : 'Salva'}
            </PrimaryBtn>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, gap: 12, paddingBottom: 32 },
  sectionGap: { marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1, minWidth: 0 },
  infoTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14 },
  infoSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12.5, marginTop: 2 },
  footer: { flexDirection: 'row', gap: 10 },
});
