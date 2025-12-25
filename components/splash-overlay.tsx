import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  withDelay, 
  Easing, 
  FadeInDown,
  ZoomIn
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  onFinish?: () => void;
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

const Bubble = ({ 
  size, 
  color, 
  x, 
  y, 
  delay 
}: { 
  size: number; 
  color: string; 
  x: number; 
  y: number; 
  delay: number;
}) => {
  const scale = useSharedValue(0.8);

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

  const style = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    position: 'absolute',
    left: x,
    top: y,
    transform: [{ scale: scale.value }],
    opacity: 0.3,
  }));

  return <Animated.View style={style} />;
};

const LoadingDot = ({ index, color }: { index: number; color: string }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      index * 150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        style
      ]}
    />
  );
};

export function SplashOverlay({ onFinish }: Props) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8E5F2', '#F5F3FF', '#FFFFFF']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Background Elements */}
        <Bubble size={100} color="#C4B5FD" x={-20} y={height * 0.1} delay={0} />
        <Bubble size={150} color="#DDD6FE" x={width - 80} y={height * 0.2} delay={500} />
        <Bubble size={80} color="#E9D5FF" x={40} y={height - 150} delay={1000} />
        
        {/* Floating Chemistry Icons */}
        <FloatingIcon name="flask" size={40} color="#8B5CF6" x={width * 0.15} y={height * 0.25} delay={0} />
        <FloatingIcon name="beaker" size={32} color="#F59E0B" x={width * 0.8} y={height * 0.35} delay={400} />
        <FloatingIcon name="analytics" size={36} color="#3B82F6" x={width * 0.2} y={height * 0.75} delay={800} />
        <FloatingIcon name="color-filter" size={28} color="#10B981" x={width * 0.85} y={height * 0.65} delay={1200} />

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Animated.View entering={ZoomIn.duration(800).springify()}>
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
            <Text style={styles.title}>Lab Kimia Dasar</Text>
            <Text style={styles.subtitle}>Institut Teknologi Bandung</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).duration(800)}
            style={styles.loadingContainer}
          >
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((i) => (
                <LoadingDot key={i} index={i} color={colors.primary} />
              ))}
            </View>
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
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280', // Text secondary
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
