import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type AlertDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  onClose,
  title,
  message,
  buttons = [{ text: '确定' }],
}) => {
  const handleButtonPress = (button: typeof buttons[0]) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.buttonCancel,
                  button.style === 'destructive' && styles.buttonDestructive,
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.buttonTextCancel,
                    button.style === 'destructive' && styles.buttonTextDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2328',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#0969da',
  },
  buttonCancel: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  buttonDestructive: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonTextCancel: {
    color: '#1f2328',
  },
  buttonTextDestructive: {
    color: '#ffffff',
  },
});
