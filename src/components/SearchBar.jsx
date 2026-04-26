import React, { memo, useCallback, useMemo } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function canClear(text) {
  return typeof text === 'string' && text.length > 0;
}

function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Cari buku…',
  autoFocus = false,
  disabled = false,
}) {
  const showClear = useMemo(() => canClear(value) && !disabled, [disabled, value]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    onChangeText?.('');
  }, [disabled, onChangeText]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit?.();
  }, [disabled, onSubmit]);

  return (
    <View style={[styles.wrap, disabled ? styles.wrapDisabled : null]}>
      <Ionicons name="search-outline" size={18} color="#6b7280" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        editable={!disabled}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        style={styles.input}
      />

      {showClear ? (
        <Pressable
          onPress={handleClear}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={styles.iconButton}
        >
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}

export default memo(SearchBar);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 10, default: 10 }),
  },
  wrapDisabled: {
    opacity: 0.7,
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    color: '#111827',
    fontWeight: '800',
  },
  iconButton: { alignItems: 'center', justifyContent: 'center' },
  iconSpacer: { width: 18, height: 18 },
});