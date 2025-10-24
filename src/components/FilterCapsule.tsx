import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, Pressable, Animated } from 'react-native';
import { interpolateHex, HexColor } from '../utils/color';

export type FilterCapsuleProps = {
  // 0.0 ~ 1.0, 表示剩余进度（1=全新，0=已到期），可选；
  // 若未提供，将尝试用 daysRemaining/totalDays 计算。
  progress?: number;
  // 胶囊尺寸（垂直模式）：width 为粗细，height 为长度
  width?: number;
  height?: number;
  // 颜色从绿色到红色的插值区间，可自定义
  startColor?: HexColor; // 进度高时颜色
  endColor?: HexColor;   // 进度低时颜色
  // 天数显示相关（可选，点击可在百分比与天数间切换）
  daysRemaining?: number; // 直接传剩余天数
  totalDays?: number;     // 若提供 totalDays，则以 Math.round(totalDays * progress) 估算剩余天数
  enableToggle?: boolean; // 点击切换显示模式，默认 true
  // 底部标识（例如 A/B/C）
  badgeText?: string;
  // 标签展示
  label?: string;
  // 外层容器样式与文本样式
  style?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  // 长按回调
  onLongPress?: () => void;
};

export const FilterCapsule: React.FC<FilterCapsuleProps> = ({
  progress,
  width = 220,
  height = 44,
  startColor = '#2ecc71',
  endColor = '#e74c3c',
  daysRemaining,
  totalDays,
  enableToggle = true,
  badgeText,
  label,
  style,
  labelStyle,
  valueStyle,
  onLongPress,
}) => {
  const rawP =
    typeof progress === 'number'
      ? progress
      : typeof daysRemaining === 'number' && typeof totalDays === 'number' && totalDays > 0
      ? daysRemaining / totalDays
      : undefined;
  const p = Math.max(0, Math.min(1, rawP ?? 0));
  // 根据进度计算当前颜色：剩余越少越接近 endColor
  const current = interpolateHex(startColor, endColor, 1 - p);
  const radius = width / 2;

  const computedDays = useMemo(() => {
    if (typeof daysRemaining === 'number') return Math.max(0, Math.round(daysRemaining));
    if (typeof totalDays === 'number') return Math.max(0, Math.round(totalDays * p));
    return undefined;
  }, [daysRemaining, totalDays, p]);

  const [showDays, setShowDays] = useState(false);
  const onPress = useCallback(() => {
    if (!enableToggle) return;
    if (computedDays === undefined) return; // 无天数信息则不切换
    setShowDays((s) => !s);
  }, [enableToggle, computedDays]);

  // 水波动画
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 创建三个不同相位的波浪动画,模拟水流效果
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2500, // 稍微放慢,让水流更平滑
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // 闪光动画 - 模拟水面反光
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    const animations = Animated.parallel([
      createWaveAnimation(wave1Anim, 0),
      createWaveAnimation(wave2Anim, 833),  // 1/3相位差
      createWaveAnimation(wave3Anim, 1666), // 2/3相位差
      shimmerAnimation,
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, [wave1Anim, wave2Anim, wave3Anim, shimmerAnim]);

  return (
    <View style={[styles.container, { width, height }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
      accessibilityLabel={label ? `${label} 进度` : '滤芯进度'}
    >
      {/* 胶囊外框（垂直） */}
      <Pressable
        style={[
          styles.capsule,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        ]}
        accessibilityRole="button"
        accessibilityHint={computedDays !== undefined ? '点击切换百分比与剩余天数显示' : undefined}
        onPress={onPress}
        onLongPress={onLongPress}
      > 
        {/* 进度自底向上填充 */}
        <View
          style={[
            styles.fillVertical,
            {
              height: `${p * 100}%`,
              backgroundColor: current,
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          ]}
        >
          {/* 流动光效 - 充满整个进度条 */}
          {p > 0.05 && (
            <>
              {/* 整体微光效果 */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: '#ffffff',
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.05, 0.15, 0.05],
                    }),
                  },
                ]}
              />
              {/* 流动波纹 - 从下往上移动 */}
              <Animated.View
                style={[
                  styles.flowingWave,
                  {
                    backgroundColor: '#ffffff',
                    opacity: wave1Anim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 0.2, 0.1, 0],
                    }),
                    transform: [
                      {
                        translateY: wave1Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['100%', '-100%'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.flowingWave,
                  {
                    backgroundColor: '#ffffff',
                    opacity: wave2Anim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 0.2, 0.1, 0],
                    }),
                    transform: [
                      {
                        translateY: wave2Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['100%', '-100%'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.flowingWave,
                  {
                    backgroundColor: '#ffffff',
                    opacity: wave3Anim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 0.2, 0.1, 0],
                    }),
                    transform: [
                      {
                        translateY: wave3Anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['100%', '-100%'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </>
          )}
        </View>
        {/* 标签文本居中显示 */}
        {!!label && (
          <View style={styles.labelContainer} pointerEvents="none">
            <Text style={[styles.label, labelStyle]}>{label}</Text>
          </View>
        )}
        {/* 百分比/天数显示在底部 */}
        <View style={styles.valueContainer} pointerEvents="none">
          <Text 
            style={[styles.value, valueStyle]}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.5}
          >
            {showDays && computedDays !== undefined ? `${computedDays}天` : `${Math.round(p * 100)}%`}
          </Text>
        </View>
        {/* 底部标识徽章 */}
        {badgeText ? (
          <View style={styles.badge} pointerEvents="none">
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capsule: {
    width: '100%',
    height: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d7de',
    backgroundColor: '#f8f9fb',
    overflow: 'hidden',
    position: 'relative',
  },
  fillVertical: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    overflow: 'hidden',
  },
  flowingWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '40%',
    borderRadius: 50,
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  valueContainer: {
    position: 'absolute',
    bottom: 3,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontWeight: '600',
    color: '#1f2328',
    textAlign: 'center',
  },
  value: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 11,
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export default FilterCapsule;
