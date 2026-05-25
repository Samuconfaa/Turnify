import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { AdminTabLayout } from '@/components/AdminTabLayout';

export default function NotificationsScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <AdminTabLayout>
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
        <Text style={{ color: t.textSecondary, fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 15 }}>
          Notifiche — it-28
        </Text>
      </View>
    </AdminTabLayout>
  );
}
