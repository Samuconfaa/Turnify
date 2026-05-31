import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface AvatarContextValue {
  avatarUri: string | undefined;
  pickAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  avatarUri: undefined,
  pickAvatar: () => {},
});

function avatarKey(userId: number) {
  return `turniup_avatar_${userId}`;
}

export function AvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [avatarUri, setAvatarUri] = useState<string | undefined>();

  useEffect(() => {
    if (!user) { setAvatarUri(undefined); return; }
    SecureStore.getItemAsync(avatarKey(user.id)).then(v => {
      setAvatarUri(v ?? undefined);
    });
  }, [user?.id]);

  const saveUri = useCallback(async (uri: string) => {
    if (!user) return;
    setAvatarUri(uri);
    await SecureStore.setItemAsync(avatarKey(user.id), uri);
  }, [user?.id]);

  const pickAvatar = useCallback(() => {
    Alert.alert('Foto profilo', 'Scegli sorgente', [
      {
        text: 'Fotocamera',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permesso negato', 'Abilita la fotocamera nelle impostazioni.');
            return;
          }
          const res = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
          });
          if (!res.canceled && res.assets[0]) await saveUri(res.assets[0].uri);
        },
      },
      {
        text: 'Galleria',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permesso negato', 'Abilita la galleria nelle impostazioni.');
            return;
          }
          const res = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
          });
          if (!res.canceled && res.assets[0]) await saveUri(res.assets[0].uri);
        },
      },
      { text: 'Annulla', style: 'cancel' },
    ]);
  }, [saveUri]);

  return (
    <AvatarContext.Provider value={{ avatarUri, pickAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar(): AvatarContextValue {
  return useContext(AvatarContext);
}
