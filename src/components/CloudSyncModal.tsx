import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { AlertDialog } from './AlertDialog';

export type CloudSyncModalProps = {
  visible: boolean;
  onClose: () => void;
  cloudKey: string | null;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  onEnableSync: (key?: string) => Promise<string>;
  onDisableSync: () => Promise<void>;
  onPullFromCloud: () => Promise<boolean>;
};

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  visible,
  onClose,
  cloudKey,
  isSyncing,
  lastSyncTime,
  onEnableSync,
  onDisableSync,
  onPullFromCloud,
}) => {
  const [inputKey, setInputKey] = useState('');
  const [mode, setMode] = useState<'main' | 'input'>('main');
  
  // Alert 对话框状态
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: typeof alertConfig.buttons
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: '确定' }],
    });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleEnableWithNewKey = async () => {
    try {
      const newKey = await onEnableSync();
      showAlert(
        '云端同步已启用',
        `您的同步密钥:\n${newKey}\n\n请妥善保管此密钥,在其他设备上使用相同密钥即可同步数据。`,
        [
          {
            text: '复制密钥',
            onPress: () => Clipboard.setString(newKey),
          },
          { text: '确定' },
        ]
      );
      setMode('main');
    } catch (error) {
      showAlert('启用失败', error instanceof Error ? error.message : '未知错误');
    }
  };

  const handleEnableWithExistingKey = async () => {
    if (!inputKey.trim()) {
      showAlert('提示', '请输入同步密钥');
      return;
    }

    // 当用户使用已有 key 时,提示确认将使用云端数据覆盖本地
    showAlert(
      '确认覆盖',
      '即将使用云端数据覆盖本地，是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '继续',
          onPress: async () => {
            try {
              await onEnableSync(inputKey.trim());
              showAlert('成功', '已连接到云端数据');
              setInputKey('');
              setMode('main');
            } catch (error) {
              showAlert('连接失败', error instanceof Error ? error.message : '未知错误');
            }
          },
        },
      ]
    );
  };

  const handleDisable = () => {
    showAlert(
      '确认禁用',
      '禁用云端同步后,数据将只保存在本地。云端数据不会被删除。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '禁用',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDisableSync();
              setAlertConfig((prev) => ({ ...prev, visible: false }));
              onClose();
            } catch (error) {
              showAlert('失败', error instanceof Error ? error.message : '未知错误');
            }
          },
        },
      ]
    );
  };

  const handlePull = async () => {
    try {
      const success = await onPullFromCloud();
      if (success) {
        showAlert('成功', '已从云端拉取最新数据');
      } else {
        showAlert('提示', '云端暂无数据');
      }
    } catch (error) {
      showAlert('拉取失败', error instanceof Error ? error.message : '未知错误');
    }
  };

  const formatSyncTime = (date: Date | null) => {
    if (!date) return '从未同步';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return date.toLocaleDateString();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>云端同步设置</Text>

          {mode === 'main' && (
            <>
              {cloudKey ? (
                <>
                  <View style={styles.section}>
                    <Text style={styles.label}>同步状态</Text>
                    <Text style={styles.value}>
                      {isSyncing ? '同步中...' : '已启用'}
                    </Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>上次同步</Text>
                    <Text style={styles.value}>{formatSyncTime(lastSyncTime)}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.label}>同步密钥</Text>
                    <View style={styles.keyContainer}>
                      <Text style={styles.keyText} numberOfLines={1}>
                        {cloudKey}
                      </Text>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => {
                          Clipboard.setString(cloudKey);
                          showAlert('已复制', '同步密钥已复制到剪贴板');
                        }}
                      >
                        <Text style={styles.copyButtonText}>复制</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.hint}>
                      💡 在其他设备上使用此密钥可同步相同数据
                    </Text>
                  </View>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonSecondary]}
                      onPress={handlePull}
                      disabled={isSyncing}
                    >
                      <Text style={styles.buttonTextSecondary}>拉取云端数据</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.buttonDanger]}
                      onPress={handleDisable}
                    >
                      <Text style={styles.buttonTextDanger}>禁用同步</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.description}>
                    启用云端同步后,您的数据将自动保存到云端,可在多个设备间同步。
                  </Text>

                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonPrimary]}
                      onPress={handleEnableWithNewKey}
                    >
                      <Text style={styles.buttonTextPrimary}>生成新密钥</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.button, styles.buttonSecondary]}
                      onPress={() => setMode('input')}
                    >
                      <Text style={styles.buttonTextSecondary}>使用已有密钥</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}

          {mode === 'input' && (
            <>
              <Text style={styles.description}>
                输入在其他设备上生成的同步密钥,即可访问相同的云端数据。
              </Text>

              <TextInput
                style={styles.input}
                placeholder="请输入同步密钥"
                value={inputKey}
                onChangeText={setInputKey}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    setInputKey('');
                    setMode('main');
                  }}
                >
                  <Text style={styles.buttonTextSecondary}>取消</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={handleEnableWithExistingKey}
                >
                  <Text style={styles.buttonTextPrimary}>连接</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alert 对话框 */}
      <AlertDialog
        visible={alertConfig.visible}
        onClose={hideAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
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
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2328',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  section: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    color: '#1f2328',
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f6f8fa',
    padding: 8,
    borderRadius: 8,
  },
  keyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1f2328',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0969da',
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2328',
  },
  buttonGroup: {
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
  },
  buttonPrimary: {
    backgroundColor: '#0969da',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  buttonTextSecondary: {
    color: '#1f2328',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDanger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  buttonTextDanger: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
