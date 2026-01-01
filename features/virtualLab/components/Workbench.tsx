import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeInDown
} from 'react-native-reanimated';
import Svg, { 
  Path, 
  Defs, 
  LinearGradient, 
  Stop, 
  ClipPath, 
  Rect, 
  G,
  Circle
} from 'react-native-svg';
import { Text } from '@/components/ui';
import { VesselState } from '../data/types';
import { labItems } from '../data/items';
import { borderRadius, shadows } from '@/constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface WorkbenchProps {
  vessels: VesselState[];
  selectedItemId: string | null;
  onVesselTap: (vesselId: string) => void;
  theme: any;
}

interface VesselProps {
  vessel: VesselState;
  isTarget: boolean;
  onTap: () => void;
  theme: any;
}

function BubbleAnimation({ width, height }: { width: number; height: number }) {
  const bubbles = React.useMemo(() => 
    [...Array(6)].map((_, i) => ({
      id: i,
      x: Math.random() * (width - 8) + 4,
      delay: i * 200,
      size: Math.random() * 3 + 2,
    })), [width]
  );

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {bubbles.map((bubble) => (
        <AnimatedBubble 
          key={bubble.id} 
          x={bubble.x} 
          delay={bubble.delay} 
          size={bubble.size}
          height={height}
        />
      ))}
    </View>
  );
}

function AnimatedBubble({ x, delay, size, height }: { x: number; delay: number; size: number; height: number }) {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(-10, { duration: 1500 }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.8, { duration: 1100 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'rgba(255,255,255,0.7)',
        },
        animatedStyle
      ]} 
    />
  );
}

const getVesselConfig = (type: string) => {
  switch (type) {
    case 'buret':
      return {
        width: 36,
        height: 180,
        viewBox: "0 0 36 180",
        path: "M8 0 L8 150 L14 160 L14 170 L22 170 L22 160 L28 150 L28 0", 
        liquidMask: "M9 0 L9 149 L15 159 L15 168 L21 168 L21 159 L27 149 L27 0",
        stopcock: true,
      };
    case 'erlenmeyer':
      return {
        width: 80,
        height: 110,
        viewBox: "0 0 80 110",
        path: "M28 0 L28 35 L5 100 Q0 110 10 110 L70 110 Q80 110 75 100 L52 35 L52 0",
        liquidMask: "M29 0 L29 35 L7 100 Q3 108 10 108 L70 108 Q77 108 73 100 L51 35 L51 0",
        stopcock: false,
      };
    case 'testTube':
      return {
        width: 32,
        height: 100,
        viewBox: "0 0 32 100",
        path: "M0 0 L0 84 A16 16 0 0 0 32 84 L32 0",
        liquidMask: "M1.5 0 L1.5 84 A14.5 14.5 0 0 0 30.5 84 L30.5 0",
        stopcock: false,
      };
    case 'measuringCylinder':
      return {
        width: 34,
        height: 120,
        viewBox: "0 0 34 120",
        path: "M5 0 L5 110 L0 120 L34 120 L29 110 L29 0",
        liquidMask: "M6 0 L6 110 L2 118 L32 118 L28 110 L28 0",
        stopcock: false,
      };
    case 'beaker':
    default:
      return {
        width: 70,
        height: 90,
        viewBox: "0 0 70 90",
        path: "M0 0 L0 80 A10 10 0 0 0 10 90 L60 90 A10 10 0 0 0 70 80 L70 0",
        liquidMask: "M1.5 0 L1.5 80 A8.5 8.5 0 0 0 10 88.5 L60 88.5 A8.5 8.5 0 0 0 68.5 80 L68.5 0",
        stopcock: false,
      };
  }
};

function Vessel({ vessel, isTarget, onTap, theme }: VesselProps) {
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  
  React.useEffect(() => {
    if (isTarget) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
      glowOpacity.value = withTiming(0.6, { duration: 300 });
    } else {
      pulseScale.value = withSpring(1);
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isTarget]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const totalVolume = vessel.contents.reduce((sum, c) => sum + c.volumeMl, 0);
  const fillPercent = Math.min((totalVolume / vessel.maxVolume) * 100, 100);
  
  const mixedColor = vessel.contents.length > 0 
    ? vessel.contents[vessel.contents.length - 1].color 
    : 'transparent';

  const config = getVesselConfig(vessel.type);
  const liquidHeight = (config.height * fillPercent) / 100;
  const liquidY = config.height - liquidHeight;

  const contentSummary = vessel.contents.length > 0
    ? vessel.contents.map(c => {
        const item = labItems[c.itemId];
        return item ? item.name : '';
      }).filter(Boolean).slice(-2).join(' + ') + (vessel.contents.length > 2 ? '...' : '')
    : 'Kosong';

  const hasSolids = vessel.contents.some(c => labItems[c.itemId]?.phase === 'solid');
  const showPrecipitate = vessel.hasPrecipitate || hasSolids;
  const precipitateColor = vessel.precipitateColor || '#60A5FA';

  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.8} style={styles.vesselTouchArea}>
      <Animated.View style={[styles.vesselWrapper, animatedStyle]}>
        <Animated.View style={[
          styles.glowRing, 
          glowStyle,
          { 
            width: config.width + 16, 
            height: config.height + 16,
            borderColor: theme.primary,
            backgroundColor: theme.primarySoft
          }
        ]} />

        <View style={styles.svgContainer}>
          <Svg width={config.width} height={config.height} viewBox={config.viewBox}>
            <Defs>
              <LinearGradient id={`glassGradient-${vessel.id}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="rgba(255,255,255,0.4)" />
                <Stop offset="0.2" stopColor="rgba(255,255,255,0.1)" />
                <Stop offset="0.5" stopColor="rgba(255,255,255,0.05)" />
                <Stop offset="0.8" stopColor="rgba(255,255,255,0.1)" />
                <Stop offset="1" stopColor="rgba(255,255,255,0.3)" />
              </LinearGradient>
              <ClipPath id={`clip-${vessel.id}`}>
                <Path d={config.liquidMask} />
              </ClipPath>
            </Defs>

            <G clipPath={`url(#clip-${vessel.id})`}>
              <Rect 
                x="0" 
                y={liquidY} 
                width={config.width} 
                height={liquidHeight} 
                fill={mixedColor}
                fillOpacity={0.85}
              />
              {fillPercent > 0 && (
                <Rect
                  x="0"
                  y={liquidY}
                  width={config.width}
                  height={2}
                  fill="rgba(0,0,0,0.15)"
                />
              )}
            </G>

            <Path 
              d={config.path} 
              stroke="rgba(255,255,255,0.7)" 
              strokeWidth="1.5"
              fill={`url(#glassGradient-${vessel.id})`} 
            />

            {config.stopcock && (
               <G y={config.height - 25} x={config.width/2 - 6}>
                 <Path d="M0 5 L12 5 L12 9 L0 9 Z" fill="#666" />
                 <Circle cx="6" cy="7" r="2.5" fill="#333" />
               </G>
            )}

            <Path 
              d={`M${config.width * 0.2} ${config.height * 0.1} L${config.width * 0.2} ${config.height * 0.85}`} 
              stroke="rgba(255,255,255,0.5)" 
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path 
              d={`M${config.width * 0.85} ${config.height * 0.1} L${config.width * 0.85} ${config.height * 0.85}`} 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="1"
              strokeLinecap="round"
            />

            <G opacity="0.3">
               {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
                 <Rect 
                   key={i}
                   x={config.width * 0.6}
                   y={config.height * p}
                   width={config.width * 0.3}
                   height={1}
                   fill="#000"
                 />
               ))}
            </G>
          </Svg>

          {showPrecipitate && (
            <View style={[styles.precipitateContainer, { width: config.width - 10, bottom: 8 }]}>
              <View style={[styles.precipitateLayer, { backgroundColor: precipitateColor }]} />
              {[...Array(7)].map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.solidParticle, 
                    { backgroundColor: precipitateColor, opacity: 0.9 }
                  ]} 
                />
              ))}
            </View>
          )}

          {vessel.hasBubbles && (
            <BubbleAnimation width={config.width} height={config.height} />
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text variant="caption" style={[styles.vesselName, { color: theme.textPrimary }]}>
            {vessel.name}
          </Text>
          
          <Text style={[styles.contentsLabel, { color: theme.textSecondary }]} numberOfLines={1}>
            {contentSummary}
          </Text>

          {totalVolume > 0 && (
            <View style={[styles.volumeBadge, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.volumeText, { color: theme.textPrimary }]}>
                {totalVolume.toFixed(0)} mL
              </Text>
            </View>
          )}
          
          {vessel.temperature !== 25 && (
            <Animated.View 
              entering={FadeInDown}
              style={[
                styles.tempBadge, 
                { backgroundColor: vessel.temperature > 25 ? '#EF4444' : '#3B82F6' }
              ]}
            >
              <Ionicons name="thermometer" size={10} color="#FFF" />
              <Text style={styles.tempText}>{vessel.temperature}°C</Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function Workbench({ vessels, selectedItemId, onVesselTap, theme }: WorkbenchProps) {
  const hasSelection = selectedItemId !== null;

  return (
    <View style={[styles.workbench, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.benchBackground} />
      <View style={styles.benchSurface} />
      
      <View style={styles.vesselsRow}>
        {vessels.map((vessel, index) => (
          <Vessel
            key={vessel.id}
            vessel={vessel}
            isTarget={hasSelection}
            onTap={() => onVesselTap(vessel.id)}
            theme={theme}
          />
        ))}
      </View>

      {hasSelection ? (
        <Animated.View entering={FadeIn.duration(400)} style={[styles.instructionTag, { backgroundColor: theme.primary }]}>
          <Text style={styles.instructionText}>Ketuk wadah untuk menuang/menggunakan</Text>
        </Animated.View>
      ) : (
        <View style={styles.tableLabelContainer}>
           <Text style={[styles.tableLabel, { color: theme.textMuted }]}>MEJA PRAKTIKUM</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  workbench: {
    width: SCREEN_WIDTH - 24,
    minHeight: 280,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shadows.md,
    overflow: 'hidden',
    position: 'relative',
  },
  benchBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  benchSurface: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tableLabelContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 4,
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.6,
  },
  vesselsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    zIndex: 10,
    width: '100%',
  },
  vesselTouchArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  vesselWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  svgContainer: {
    ...shadows.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 20,
    borderWidth: 2,
    bottom: 25, 
  },
  precipitateContainer: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 3,
  },
  solidParticle: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  precipitateLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
    height: 65, 
  },
  vesselName: {
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 2,
  },
  contentsLabel: {
    fontSize: 9,
    maxWidth: 80,
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.8,
  },
  volumeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  volumeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  tempText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  instructionTag: {
    position: 'absolute',
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    ...shadows.sm,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
