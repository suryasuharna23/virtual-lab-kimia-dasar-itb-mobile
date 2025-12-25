import { Image } from 'expo-image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  withDelay,
  withSpring,
  Easing, 
  FadeInDown,
  ZoomIn,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  onFinish?: () => void;
};

// Theme-aware color configs
const themeColors = {
  light: {
    gradient: ['#E8E5F2', '#F5F3FF', '#FFFFFF'] as const,
    bubbles: ['#C4B5FD', '#DDD6FE', '#E9D5FF'],
    icons: {
      flask: '#8B5CF6',
      beaker: '#F59E0B',
      analytics: '#3B82F6',
      colorFilter: '#10B981',
    },
    title: colors.primary,
    subtitle: '#6B7280',
    dots: colors.primary,
  },
  dark: {
    gradient: ['#1E1B4B', '#2D2A5B', '#3D3A6B'] as const,
    bubbles: ['#6D28D9', '#7C3AED', '#8B5CF6'],
    icons: {
      flask: '#C4B5FD',
      beaker: '#FCD34D',
      analytics: '#93C5FD',
      colorFilter: '#6EE7B7',
    },
    title: '#F5F3FF',
    subtitle: '#A5B4FC',
    dots: '#C4B5FD',
  },
};

const FloatingIcon = ({ 
  name, 
  size, 
  color, 
  delay, 
  x, 
  y, 
  duration = 2000 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  size: number; 
  color: string; 
  delay: number; 
  x: number; 
  y: number;
  duration?: number;
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    position: 'absolute',
    left: x,
    top: y,
    opacity: 0.6,
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

interface BubbleProps {
  id: number;
  size: number;
  color: string;
  x: number;
  y: number;
  delay: number;
  onPop: (id: number) => void;
}

const Bubble = ({ id, size, color, x, y, delay, onPop }: BubbleProps) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0.3);
  const isPopped = useSharedValue(false);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
  }, []);

  const handlePop = useCallback(() => {
    if (isPopped.value) return;
    isPopped.value = true;
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Pop animation: scale up then fade out
    scale.value = withSpring(1.8, { damping: 10, stiffness: 300 });
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onPop)(id);
      }
    });
  }, [id, onPop]);

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    position: 'absolute',
    left: x,
    top: y,
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable onPress={handlePop}>
      <Animated.View style={style} />
    </Pressable>
  );
};

// Sound utility
const playPopSound = async (soundRef: React.MutableRefObject<Audio.Sound | null>) => {
  try {
    if (soundRef.current) {
      await soundRef.current.replayAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/pop.mp3'),
        { volume: 0.5 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    }
  } catch (error) {
    // Silently fail - sound is optional enhancement
    console.log('Sound playback failed:', error);
  }
};

export function SplashOverlay({ onFinish }: Props) {
  const { isDark } = useTheme();
  const currentTheme = isDark ? themeColors.dark : themeColors.light;
  const soundRef = useRef<Audio.Sound | null>(null);
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(false);
  
  // Track popped bubbles
  const [poppedBubbles, setPoppedBubbles] = useState<Set<number>>(new Set());
  
  // Initial bubble configs
  const initialBubbles = [
    { id: 1, size: 100, x: -20, y: height * 0.1, delay: 0 },
    { id: 2, size: 150, x: width - 80, y: height * 0.2, delay: 500 },
    { id: 3, size: 80, x: 40, y: height - 150, delay: 1000 },
    { id: 4, size: 60, x: width * 0.7, y: height * 0.8, delay: 1500 },
    { id: 5, size: 70, x: width * 0.1, y: height * 0.5, delay: 800 },
  ];

  // Play sound when logo animation completes
  useEffect(() => {
    if (logoAnimationComplete) {
      playPopSound(soundRef);
    }
  }, [logoAnimationComplete]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  const handleBubblePop = useCallback((id: number) => {
    playPopSound(soundRef);
    setPoppedBubbles(prev => new Set(prev).add(id));
  }, []);

  const activeBubbles = initialBubbles.filter(b => !poppedBubbles.has(b.id));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={currentTheme.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Background Bubbles - Interactive! */}
        {activeBubbles.map((bubble) => (
          <Bubble 
            key={bubble.id}
            id={bubble.id}
            size={bubble.size} 
            color={currentTheme.bubbles[bubble.id % 3]} 
            x={bubble.x} 
            y={bubble.y} 
            delay={bubble.delay}
            onPop={handleBubblePop}
          />
        ))}
        
        {/* Floating Chemistry Icons */}
        <FloatingIcon 
          name="flask" 
          size={40} 
          color={currentTheme.icons.flask} 
          x={width * 0.15} 
          y={height * 0.25} 
          delay={0} 
        />
        <FloatingIcon 
          name="beaker" 
          size={32} 
          color={currentTheme.icons.beaker} 
          x={width * 0.8} 
          y={height * 0.35} 
          delay={400} 
        />
        <FloatingIcon 
          name="analytics" 
          size={36} 
          color={currentTheme.icons.analytics} 
          x={width * 0.2} 
          y={height * 0.75} 
          delay={800} 
        />
        <FloatingIcon 
          name="color-filter" 
          size={28} 
          color={currentTheme.icons.colorFilter} 
          x={width * 0.85} 
          y={height * 0.65} 
          delay={1200} 
        />

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Animated.View 
            entering={ZoomIn.duration(800).springify().withCallback((finished) => {
              if (finished) {
                runOnJS(setLogoAnimationComplete)(true);
              }
            })}
          >
            <Image
              source={require('@/assets/images/itb-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800).springify()}
            style={styles.textContainer}
          >
            <Text style={[styles.title, { color: currentTheme.title }]}>
              Lab Kimia Dasar
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>
              Institut Teknologi Bandung
            </Text>
          </Animated.View>


        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

});
