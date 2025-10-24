import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import FilterCapsule from './FilterCapsule';

export type PurifierUnitProps = {
  // 外框尺寸
  width?: number; // 净水器机身宽
  height?: number; // 净水器机身高
  style?: ViewStyle;
  // 标题
  title?: string; // 标题文字(默认为 'Purifier')
  // 布局参数（可选）：左右内边距、上下滤芯留白、最小间距、最小/最大滤芯粗细
  layout?: {
    sidePadding?: number;      // 机身左右内边距
    verticalPadding?: number;  // 机身上下（滤芯区）留白
    minGutter?: number;        // 滤芯最小间距
    minCapsuleWidth?: number;  // 滤芯最小粗细
    maxCapsuleWidth?: number;  // 滤芯最大粗细
    maxPerRow?: number;        // 每行最多显示的滤芯数量（默认 6）
    rowGap?: number;           // 行间距（默认 16）
    autoHeight?: boolean;      // 多行时自动增高外框（默认 false）
    capsuleWidth?: number;     // 滤芯宽度（默认 50）
    capsuleHeight?: number;    // 滤芯高度（默认 120）
    badgeHeight?: number;      // 底部字母徽标高度（默认 20）
    columnGap?: number;        // 列间距（默认 12）
  };
  // 每个滤芯的进度与标签
  filters: Array<{
    id: string;
    label: string;
    progress?: number; // 0~1，可选
    days?: number;      // 可选：剩余天数
    totalDays?: number; // 可选：总寿命天数
    letter?: string;    // 可选：字母徽标（A-Z），不传则用 id 首字母
  }>;
  // 长按滤芯的回调
  onFilterLongPress?: (filterId: string) => void;
  // 添加和删除回调
  onAdd?: () => void;
  onRemove?: () => void;
};

const PurifierUnit: React.FC<PurifierUnitProps> = ({
  width = 320,
  style,
  title = 'Purifier',
  layout,
  filters,
  onFilterLongPress,
  onAdd,
  onRemove,
}) => {
  const sidePadding = layout?.sidePadding ?? 16;
  const verticalPadding = layout?.verticalPadding ?? 24;
  const rowGap = layout?.rowGap ?? 16;

  const columnGap = layout?.columnGap ?? 12;
  const capsuleWidth = layout?.capsuleWidth ?? 50;
  const capsuleHeight = layout?.capsuleHeight ?? 300;
  const badgeHeight = layout?.badgeHeight ?? 20;

  const configMaxPerRow = layout?.maxPerRow ?? 6; // 用户配置的最大值
  
  // 计算可用宽度
  const availableWidth = width - sidePadding * 2;
  
  // 根据可用宽度动态计算每行实际能放下的滤芯数量
  // 公式：n * capsuleWidth + (n-1) * columnGap <= availableWidth
  // 求解：n <= (availableWidth + columnGap) / (capsuleWidth + columnGap)
  const calculatedMaxPerRow = Math.floor((availableWidth + columnGap) / (capsuleWidth + columnGap));
  
  // 取用户配置值和计算值的较小者，并至少为1
  const maxPerRow = Math.max(1, Math.min(configMaxPerRow, calculatedMaxPerRow));
  
  // 计算总行数
  const totalRows = Math.max(0, Math.ceil(filters.length / maxPerRow));
  
  // 计算容器所需高度：header + 上下padding + (滤芯高度+徽标高度) × 行数 + 行间距 × (行数-1) + footer
  const headerHeight = 36;
  const footerHeight = (onAdd || onRemove) ? 48 : 0; // Footer 高度，如果有回调则显示
  const singleRowHeight = capsuleHeight + badgeHeight; // 单行高度 = 滤芯 + 徽标
  const contentHeight = totalRows > 0 
    ? singleRowHeight * totalRows + rowGap * Math.max(0, totalRows - 1)
    : 0; // 没有滤芯时内容高度为0
  const computedHeight = headerHeight + (totalRows > 0 ? verticalPadding * 2 : 0) + contentHeight + footerHeight;

  // 计算每行实际显示的滤芯数量
  const itemsPerRow = Math.min(maxPerRow, filters.length);
  // 计算一行滤芯的总宽度：滤芯宽度 * 数量 + 间距 * (数量-1)
  const rowWidth = capsuleWidth * itemsPerRow + columnGap * (itemsPerRow - 1);
  const startOffset = Math.max(0, (availableWidth - rowWidth) / 2);

  return (
    <View style={[styles.container, { width, height: computedHeight }, style]}
      accessibilityLabel="净水器外框"
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={[
        styles.body, 
        { 
          paddingHorizontal: filters.length > 0 ? sidePadding : 0,
          paddingVertical: filters.length > 0 ? verticalPadding : 0,
          paddingLeft: filters.length > 0 ? sidePadding + startOffset : 0, // 应用起始偏移
        }
      ]}> 
        {filters.map((f, idx) => {
          const rowIndex = Math.floor(idx / maxPerRow);
          const colIndex = idx % maxPerRow;
          const letter = (f.letter ?? f.id?.charAt(0) ?? '').toUpperCase();
          return (
            <View
              key={f.id}
              style={{
                width: capsuleWidth,
                marginLeft: colIndex === 0 ? 0 : columnGap,
                marginTop: rowIndex === 0 ? 0 : rowGap,
                alignItems: 'center',
              }}
            >
              <FilterCapsule
                width={capsuleWidth}
                height={capsuleHeight}
                progress={f.progress}
                daysRemaining={f.days}
                totalDays={f.totalDays}
                label={f.label}
                labelStyle={{ fontSize: 12 }}
                onLongPress={onFilterLongPress ? () => onFilterLongPress(f.id) : undefined}
              />
              {/* 底部字母徽标,显示在胶囊外 */}
              {letter ? <Text style={styles.bottomBadge}>{letter}</Text> : null}
            </View>
          );
        })}
      </View>
      
      {/* Footer 底部操作栏 */}
      {(onAdd || onRemove) && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.footerButton, !onRemove && styles.footerButtonDisabled]} 
            onPress={onRemove}
            disabled={!onRemove || filters.length === 0}
          >
            <Text style={[styles.footerButtonText, (!onRemove || filters.length === 0) && styles.footerButtonTextDisabled]}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.footerButton, !onAdd && styles.footerButtonDisabled]} 
            onPress={onAdd}
            disabled={!onAdd}
          >
            <Text style={[styles.footerButtonText, !onAdd && styles.footerButtonTextDisabled]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d0d7de',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    height: 36,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  headerText: {
    fontWeight: '700',
    color: '#374151',
  },
  body: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    justifyContent: 'flex-start', // 左对齐
    paddingHorizontal: 16,
    position: 'relative',
  },
  bottomBadge: {
    marginTop: 4,
    fontWeight: '700',
    color: '#111827',
  },
  footer: {
    height: 48,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  footerButtonDisabled: {
    opacity: 0.3,
  },
  footerButtonText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#374151',
    lineHeight: 28, // 添加行高以确保垂直居中
    textAlign: 'center',
  },
  footerButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default PurifierUnit;
