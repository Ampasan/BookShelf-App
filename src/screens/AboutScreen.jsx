import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROFILE_IMAGE_URL = 'https://res.cloudinary.com/drrmbeiyk/image/upload/v1777217745/foto_geztgv.webp';

const PROFILE = {
  name: 'Naufal Rakan Ramadhan',
  nim: '2410501042',
  className: 'B',
  theme: 'BookShelf',
  apiCredit: 'OpenLibrary',
};

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>About BookShelf</Text>
        <Text style={styles.subtitle}>Informasi Developer.</Text>

        <View style={styles.card}>
          <Image source={{ uri: PROFILE_IMAGE_URL }} style={styles.avatar} resizeMode="cover" />

          <View style={styles.infoWrap}>
            <InfoRow label="Nama" value={PROFILE.name} />
            <InfoRow label="NIM" value={PROFILE.nim} />
            <InfoRow label="Kelas" value={PROFILE.className} />
            <InfoRow label="Tema" value={PROFILE.theme} />
            <InfoRow label="Credit API" value={PROFILE.apiCredit} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Dibuat oleh {PROFILE.name}</Text>
          <Text style={styles.footerSubtext}>BookShelf</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { color: '#6b7280', fontWeight: '600' },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  infoWrap: { gap: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 6,
  },
  infoLabel: { color: '#6b7280', fontWeight: '700' },
  infoValue: { color: '#111827', fontWeight: '800' },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 2,
  },
  footerText: { color: '#111827', fontWeight: '800' },
  footerSubtext: { color: '#6b7280', fontSize: 12, fontWeight: '600' },
});

