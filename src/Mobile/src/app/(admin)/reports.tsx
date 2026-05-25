import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Card, Header, Icon, Input, SectionLabel } from '@/components/ui';
import { ReportService } from '@/services/report.service';
import { apiError } from '@/services/api';

export default function ReportsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const lastOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(lastOfMonth);
  const [exporting, setExporting] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async (type: 'hours' | 'attendance' | 'vacations') => {
    setExporting(type);
    try {
      if (type === 'hours') await ReportService.downloadHours(from, to);
      else if (type === 'attendance') await ReportService.downloadAttendance(from, to);
      else await ReportService.downloadVacations(from, to);
      setLastExport(`turnify-${type}-${from}.csv`);
    } catch (e) { Alert.alert('Errore', apiError(e)); }
    finally { setExporting(null); }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={{ paddingTop: insets.top, backgroundColor: t.surface }}>
        <Header
          t={t}
          title="Report"
          leading={
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Icon name="chev-l" size={20} color={t.text} strokeWidth={2} />
            </TouchableOpacity>
          }
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {lastExport && (
          <View style={[styles.successBanner, { backgroundColor: t.primaryLight }]}>
            <Icon name="check" size={18} color={t.successText} strokeWidth={2.4} />
            <Text style={[styles.successTxt, { color: t.successText }]}>
              Export pronto: <Text style={{ fontWeight: '700' }}>{lastExport}</Text>
            </Text>
            <TouchableOpacity onPress={() => setLastExport(null)}>
              <Icon name="x" size={14} color={t.successText} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}

        <SectionLabel t={t}>Periodo</SectionLabel>
        <View style={styles.dateRow}>
          <View style={styles.flex1}>
            <Input t={t} label="Dal" value={from} onChangeText={setFrom} leadingIcon="cal" />
          </View>
          <View style={styles.flex1}>
            <Input t={t} label="Al" value={to} onChangeText={setTo} leadingIcon="cal" />
          </View>
        </View>

        <SectionLabel t={t} style={{ marginTop: 6 }}>Esporta</SectionLabel>

        <Card t={t} padding={16}>
          <View style={styles.exportRow}>
            <View style={[styles.exportIcon, { backgroundColor: t.primaryLight }]}>
              <Icon name="clock" size={22} color={t.primary} strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.exportTitle, { color: t.text }]}>Ore pianificate</Text>
              <Text style={[styles.exportSub, { color: t.textSecondary }]}>Tutti i turni assegnati nel periodo selezionato.</Text>
            </View>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: t.primary }]}
              onPress={() => handleExport('hours')}
              disabled={exporting === 'hours'}
            >
              {exporting === 'hours' ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={18} color="#fff" strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </Card>

        <Card t={t} padding={16}>
          <View style={styles.exportRow}>
            <View style={[styles.exportIcon, { backgroundColor: t.kpiBlueBg }]}>
              <Icon name="doc" size={22} color={t.kpiBlue} strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.exportTitle, { color: t.text }]}>Presenze effettive</Text>
              <Text style={[styles.exportSub, { color: t.textSecondary }]}>Timbrature entrata e uscita con ore lavorate.</Text>
            </View>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: t.kpiBlue }]}
              onPress={() => handleExport('attendance')}
              disabled={exporting === 'attendance'}
            >
              {exporting === 'attendance' ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={18} color="#fff" strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </Card>

        <Card t={t} padding={16}>
          <View style={styles.exportRow}>
            <View style={[styles.exportIcon, { backgroundColor: t.warningBg }]}>
              <Icon name="palm" size={22} color={t.warningText} strokeWidth={2} />
            </View>
            <View style={styles.flex1}>
              <Text style={[styles.exportTitle, { color: t.text }]}>Ferie e permessi</Text>
              <Text style={[styles.exportSub, { color: t.textSecondary }]}>Storico assenze approvate per dipendente.</Text>
            </View>
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: t.kpiAmber }]}
              onPress={() => handleExport('vacations')}
              disabled={exporting === 'vacations'}
            >
              {exporting === 'vacations' ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="download" size={18} color="#fff" strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, gap: 16, paddingBottom: 32 },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  successTxt: { flex: 1, fontFamily: 'PlusJakartaSans-Regular', fontSize: 13 },
  dateRow: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  exportRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  exportIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exportTitle: { fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14.5 },
  exportSub: { fontFamily: 'PlusJakartaSans-Regular', fontSize: 12.5, marginTop: 2, lineHeight: 18 },
  downloadBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
