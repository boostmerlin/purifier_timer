import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { FilterModel } from '../types';

export type FilterEditModalProps = {
  visible: boolean;
  filter: FilterModel | null;
  onClose: () => void;
  onSave: (filter: FilterModel) => void;
};

export const FilterEditModal: React.FC<FilterEditModalProps> = ({
  visible,
  filter,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState('');
  const [lifespanDays, setLifespanDays] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (filter) {
      setLabel(filter.label || '');
      setLifespanDays(String(filter.lifespanDays));
      // 将时间戳转换为日期字符串（YYYY-MM-DD）
      const date = new Date(filter.startedAt);
      const dateStr = date.toISOString().split('T')[0];
      setStartDate(dateStr);
    }
  }, [filter]);

  const handleSave = () => {
    if (!filter) return;

    const days = parseInt(lifespanDays, 10);
    if (isNaN(days) || days <= 0) {
      alert('请输入有效的寿命天数');
      return;
    }

    // 解析日期字符串
    const timestamp = new Date(startDate).getTime();
    if (isNaN(timestamp)) {
      alert('请输入有效的日期');
      return;
    }

    const updated: FilterModel = {
      ...filter,
      label: label.trim() || undefined,
      lifespanDays: days,
      startedAt: timestamp,
    };

    onSave(updated);
    onClose();
  };

  if (!filter) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.container}>
          <ScrollView style={styles.content}>
            <Text style={styles.title}>编辑滤芯 {filter.letter}</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>名称</Text>
              <TextInput
                style={styles.input}
                value={label}
                onChangeText={setLabel}
                placeholder="例如：PP 棉"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>寿命（天）</Text>
              <TextInput
                style={styles.input}
                value={lifespanDays}
                onChangeText={setLifespanDays}
                placeholder="例如：180"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>开始使用日期</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.hint}>格式：年-月-日，例如：2024-01-15</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2328',
    marginBottom: 20,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2328',
    backgroundColor: '#f9fafb',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
