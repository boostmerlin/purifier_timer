import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';

export type ContextMenuItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export type ContextMenuProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: ContextMenuItem[];
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  title,
  items,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.menu}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index < items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.menuItemTextDestructive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  menu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2328',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuItemTextDestructive: {
    color: '#dc2626',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#1f2328',
    textAlign: 'center',
    fontWeight: '600',
  },
});
