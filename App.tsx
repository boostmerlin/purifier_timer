import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, Button, TouchableOpacity, Clipboard } from 'react-native';
import PurifierUnit from './src/components/PurifierUnit';
import { FilterEditModal } from './src/components/FilterEditModal';
import { ContextMenu } from './src/components/ContextMenu';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { CloudSyncModal } from './src/components/CloudSyncModal';
import { AlertDialog } from './src/components/AlertDialog';
import { useMemo, useState, useEffect } from 'react';
import { FilterModel, FilterLetter } from './src/types';
import { computeFilterProgress } from './src/utils/filters';
import { useFilters } from './src/hooks/useFilters';

export default function App() {
  // 使用自定义 Hook 管理滤芯数据
  const {
    filters,
    isLoading,
    cloudKey,
    isSyncing,
    lastSyncTime,
    addFilter,
    removeLastFilter,
    deleteFilter,
    updateFilter,
    resetAll,
    enableCloudSync,
    disableCloudSync,
    pullFromCloud,
  } = useFilters();

  const [editingFilter, setEditingFilter] = useState<FilterModel | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuFilter, setContextMenuFilter] = useState<FilterModel | null>(null);
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  
  // 确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Alert 对话框状态
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 用于触发进度重新计算的状态
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  // 每小时自动刷新进度
  useEffect(() => {
    // 设置定时器,每小时触发一次刷新
    const intervalId = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
      setLastRefreshTime(new Date());
    }, 60 * 60 * 1000); // 60分钟 * 60秒 * 1000毫秒 = 1小时

    // 清理函数:组件卸载时清除定时器
    return () => clearInterval(intervalId);
  }, []);

  const viewModel = useMemo(() => {
    return filters.map((f) => {
      const { progress, remaining } = computeFilterProgress(f);
      return {
        id: f.letter,
        label: f.label ?? f.letter,
        progress,
        days: remaining,
        totalDays: f.lifespanDays,
        letter: f.letter as FilterLetter,
      };
    });
  }, [filters, refreshTrigger]); // 添加 refreshTrigger 作为依赖

  // 处理长按滤芯
  const handleFilterLongPress = (filterId: string) => {
    const filter = filters.find((f) => f.letter === filterId);
    if (!filter) return;

    setContextMenuFilter(filter);
    setShowContextMenu(true);
  };

  // 删除滤芯(打开确认对话框)
  const handleDeleteFilter = (filterId: string) => {
    setDeleteTargetId(filterId);
    setShowDeleteConfirm(true);
  };

  // 确认删除滤芯
  const confirmDeleteFilter = () => {
    if (deleteTargetId) {
      deleteFilter(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  // 重置存档(打开确认对话框)
  const handleReset = () => {
    setShowResetConfirm(true);
  };

  // 确认重置
  const confirmReset = async () => {
    try {
      await resetAll();
    } catch (error) {
      console.error('重置失败:', error);
      setAlertMessage('重置失败,请重试');
      setShowAlert(true);
    }
  };

  // 加载中显示
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>净水器滤芯进度</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button title="云端同步" onPress={() => setShowCloudSyncModal(true)} />
          <Button title="重置存档" onPress={handleReset} color="#dc2626" />
        </View>
        
        {/* 显示云端同步状态和密钥 */}
        {cloudKey ? (
          <View style={styles.cloudKeyContainer}>
            <Text style={styles.info}>
              ☁️ 云端同步已启用 · {isSyncing ? '同步中...' : `共 ${filters.length} 个滤芯`}
            </Text>
            <TouchableOpacity 
              style={styles.cloudKeyBox}
              onPress={() => {
                Clipboard.setString(cloudKey);
                setAlertMessage('同步密钥已复制到剪贴板');
                setShowAlert(true);
              }}
            >
              <Text style={styles.cloudKeyLabel}>同步密钥 (点击复制)</Text>
              <Text style={styles.cloudKeyText} numberOfLines={1}>{cloudKey}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.info}>
            💾 本地存储 (共 {filters.length} 个滤芯) · 每小时刷新进度
          </Text>
        )}
        <View style={styles.block}>
          <PurifierUnit
            width={500}
            layout={{ autoHeight: true, maxPerRow: 10, rowGap: 16, capsuleWidth: 60 }}
            filters={viewModel.map((v) => ({
              id: v.id,
              label: v.label,
              progress: v.progress,
              days: v.days,
              totalDays: v.totalDays,
              letter: v.letter,
            }))}
            onFilterLongPress={handleFilterLongPress}
            onAdd={addFilter}
            onRemove={removeLastFilter}
          />
        </View>

      </ScrollView>

      {/* 上下文菜单 */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => {
          setShowContextMenu(false);
          setContextMenuFilter(null);
        }}
        title={contextMenuFilter ? `滤芯 ${contextMenuFilter.letter}` : undefined}
        items={[
          {
            label: '编辑',
            onPress: () => {
              if (contextMenuFilter) {
                setEditingFilter(contextMenuFilter);
                setShowEditModal(true);
              }
            },
          },
          {
            label: '删除',
            destructive: true,
            onPress: () => {
              if (contextMenuFilter) {
                handleDeleteFilter(contextMenuFilter.letter);
              }
            },
          },
        ]}
      />

      {/* 编辑滤芯模态框 */}
      <FilterEditModal
        visible={showEditModal}
        filter={editingFilter}
        onClose={() => {
          setShowEditModal(false);
          setEditingFilter(null);
        }}
        onSave={updateFilter}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        title="确认删除"
        message={`确定要删除滤芯 ${deleteTargetId} 吗？`}
        confirmText="删除"
        onConfirm={confirmDeleteFilter}
        destructive
      />

      {/* 重置确认对话框 */}
      <ConfirmDialog
        visible={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="确认重置"
        message="确定要删除所有滤芯数据吗？此操作无法撤销。"
        confirmText="重置"
        onConfirm={confirmReset}
        destructive
      />

      {/* 云端同步设置模态框 */}
      <CloudSyncModal
        visible={showCloudSyncModal}
        onClose={() => setShowCloudSyncModal(false)}
        cloudKey={cloudKey}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onEnableSync={enableCloudSync}
        onDisableSync={disableCloudSync}
        onPullFromCloud={pullFromCloud}
      />

      {/* Alert 提示对话框 */}
      <AlertDialog
        visible={showAlert}
        onClose={() => setShowAlert(false)}
        title="提示"
        message={alertMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2328',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  info: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  block: {
    marginVertical: 4,
  },
  cloudKeyContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 8,
    alignItems: 'center',
  },
  cloudKeyBox: {
    width: '100%',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  cloudKeyLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0969da',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cloudKeyText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1f2328',
  },
});
