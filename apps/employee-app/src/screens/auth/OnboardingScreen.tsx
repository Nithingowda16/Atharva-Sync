/**
 * HI RIDERS — Enterprise Transport Mobility
 * Smooth Onboarding Walkthrough Carousel (Pure White Aesthetic)
 * 
 * Features:
 * - Pure white background (#FFFFFF)
 * - Seamlessly blended vector-styled hero cards (no hard image borders)
 * - Native horizontal swipeable FlatList with physics paging
 * - Solid black circular action button (#000000) with white arrow
 * - Hardware back button and swipe-back gesture integration
 * - Top Skip button
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  BackHandler,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

interface SlideItem {
  id: string;
  type: 'intro' | 'shifts' | 'tracking';
  title: string;
  subtitle: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    type: 'intro',
    title: 'Smart Corporate\nTransport',
    subtitle: 'A centralized mobility solution for your organization.',
  },
  {
    id: '2',
    type: 'shifts',
    title: 'Manage Shifts\n& Schedules',
    subtitle: 'View assigned shifts, pickup timings and routes in real time.',
  },
  {
    id: '3',
    type: 'tracking',
    title: 'Track & Stay\nInformed',
    subtitle: 'Get live trip updates, driver details and instant notifications.',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  // Android Hardware Back Button & Back Gestures
  useEffect(() => {
    const onBackPress = () => {
      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        setCurrentIndex(prevIndex);
        return true; // Handled internally
      }
      return false; // Exit on first slide
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      onFinish();
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index >= 0 && index < SLIDES.length && index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Render seamless visual hero cards that blend into the white background
  const renderHeroVisual = (type: SlideItem['type']) => {
    if (type === 'intro') {
      return (
        <View style={styles.cardContainer}>
          <View style={styles.heroCard}>
            {/* Top Brand Emblem Badge */}
            <View style={styles.brandBadgeRow}>
              <View style={styles.logoPill}>
                <Image
                  source={require('../../../assets/logo.png')}
                  style={styles.logoIconSmall}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>HI RIDERS</Text>
              </View>
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={13} color="#FF7900" />
                <Text style={styles.verifiedText}>Enterprise Mobility</Text>
              </View>
            </View>

            {/* Central Luxury Mobility Graphic */}
            <View style={styles.graphicCenter}>
              <View style={styles.sunGlowRing} />
              <View style={styles.vehicleSilhouetteBox}>
                <Ionicons name="car-sport" size={68} color="#0F172A" />
                <View style={styles.headlightBeam} />
              </View>
              {/* Curved Road Indicator */}
              <View style={styles.roadTrack}>
                <View style={styles.roadDash} />
                <View style={styles.roadDash} />
                <View style={styles.roadDash} />
                <View style={styles.locationPinHead}>
                  <Ionicons name="location" size={16} color="#FF7900" />
                </View>
              </View>
            </View>

            {/* Bottom Status Pill */}
            <View style={styles.cardFooterTag}>
              <Ionicons name="shield-outline" size={13} color="#64748B" />
              <Text style={styles.footerTagText}>24x7 Corporate Employee Commute</Text>
            </View>
          </View>
        </View>
      );
    }

    if (type === 'shifts') {
      return (
        <View style={styles.cardContainer}>
          <View style={styles.heroCard}>
            {/* Top Schedule Header */}
            <View style={styles.brandBadgeRow}>
              <View style={[styles.logoPill, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                <Ionicons name="calendar" size={15} color="#FF7900" />
                <Text style={[styles.logoText, { color: '#FF7900' }]}>Roster Sync</Text>
              </View>
              <View style={[styles.verifiedTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
                <Text style={[styles.verifiedText, { color: '#059669' }]}>Confirmed</Text>
              </View>
            </View>

            {/* Shift Items Display */}
            <View style={styles.shiftList}>
              {/* Shift 1: Login */}
              <View style={styles.shiftItem}>
                <View style={styles.shiftIconBox}>
                  <Ionicons name="sunny-outline" size={20} color="#FF7900" />
                </View>
                <View style={styles.shiftMetaCol}>
                  <Text style={styles.shiftTypeLabel}>Morning Commute • 09:30 AM</Text>
                  <Text style={styles.shiftSubLabel}>Pickup: Golden Palms, Gate 2</Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>08:45 AM</Text>
                </View>
              </View>

              {/* Shift 2: Logout */}
              <View style={styles.shiftItem}>
                <View style={[styles.shiftIconBox, { backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="moon-outline" size={20} color="#0F172A" />
                </View>
                <View style={styles.shiftMetaCol}>
                  <Text style={styles.shiftTypeLabel}>Evening Return • 06:30 PM</Text>
                  <Text style={styles.shiftSubLabel}>Drop: Domlur Tech Park Gate</Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagText}>06:30 PM</Text>
                </View>
              </View>
            </View>

            {/* Bottom Status Pill */}
            <View style={styles.cardFooterTag}>
              <Ionicons name="sync-outline" size={13} color="#64748B" />
              <Text style={styles.footerTagText}>Real-time automated shift allocation</Text>
            </View>
          </View>
        </View>
      );
    }

    // type === 'tracking'
    return (
      <View style={styles.cardContainer}>
        <View style={styles.heroCard}>
          {/* Top Live Tracking Header */}
          <View style={styles.brandBadgeRow}>
            <View style={[styles.logoPill, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <View style={styles.livePulseDot} />
              <Text style={[styles.logoText, { color: '#059669' }]}>Live GPS</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedText}>ETA 14 Mins</Text>
            </View>
          </View>

          {/* Interactive Map Visual */}
          <View style={styles.mapVisualContainer}>
            <View style={styles.mapGridPattern}>
              <View style={styles.mapGridLineHorizontal} />
              <View style={styles.mapGridLineHorizontal} />
              <View style={styles.mapGridLineVertical} />
            </View>

            {/* Route Path with Animated Look */}
            <View style={styles.routeTrackPath}>
              <View style={styles.routeNodeStart}>
                <View style={styles.nodeDotInner} />
              </View>
              <View style={styles.routeActiveLine} />
              <View style={styles.routeMovingCab}>
                <Ionicons name="car" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.routeNodeEnd}>
                <Ionicons name="location" size={18} color="#FF7900" />
              </View>
            </View>

            {/* Driver Allocation Info */}
            <View style={styles.driverPill}>
              <Ionicons name="person-circle" size={20} color="#0F172A" />
              <Text style={styles.driverPillText}>Suresh Babu • KA-03-AG-2024</Text>
            </View>
          </View>

          {/* Bottom Status Pill */}
          <View style={styles.cardFooterTag}>
            <Ionicons name="navigate-outline" size={13} color="#64748B" />
            <Text style={styles.footerTagText}>Instant SOS & Guard verified escort</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSlideItem = ({ item }: { item: SlideItem }) => {
    return (
      <View style={[styles.slidePage, { width }]}>
        {/* Seamless Hero Graphic */}
        <View style={styles.visualSection}>
          {renderHeroVisual(item.type)}
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header with Brand Title & Skip Button */}
      <View style={styles.topHeader}>
        <View style={styles.headerBrandRow}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerBrandText}>HI RIDERS</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.65}
          onPress={onFinish}
          style={styles.skipButton}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Butter-Smooth Horizontal Swipeable FlatList */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlideItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* Bottom Bar: Modern Indicators + Solid Black Action Button */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Main Solid Black Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          style={styles.nextButton}
          accessibilityLabel={currentIndex === SLIDES.length - 1 ? 'Go to Login' : 'Next slide'}
        >
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  headerBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  flatList: {
    flex: 1,
  },
  slidePage: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  visualSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    width: width * 0.88,
    backgroundColor: '#F8FAFC',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoIconSmall: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF7900',
  },
  graphicCenter: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 4,
  },
  sunGlowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  vehicleSilhouetteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headlightBeam: {
    width: 60,
    height: 3,
    backgroundColor: '#FF7900',
    borderRadius: 2,
    marginTop: 4,
  },
  roadTrack: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '80%',
    justifyContent: 'center',
  },
  roadDash: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  locationPinHead: {
    marginLeft: 4,
  },
  cardFooterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  footerTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  shiftList: {
    gap: 10,
    marginVertical: 4,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  shiftIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftMetaCol: {
    flex: 1,
  },
  shiftTypeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  shiftSubLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  timeTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  mapVisualContainer: {
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
    justifyContent: 'space-around',
  },
  mapGridLineHorizontal: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  mapGridLineVertical: {
    width: 1,
    backgroundColor: '#E2E8F0',
    height: '100%',
    alignSelf: 'center',
  },
  routeTrackPath: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 12,
    zIndex: 2,
  },
  routeNodeStart: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  routeActiveLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#FF7900',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  routeMovingCab: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  routeNodeEnd: {
    marginLeft: 6,
  },
  driverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 2,
  },
  driverPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  textSection: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
    marginTop: 10,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
  },
  activeDot: {
    width: 24,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  inactiveDot: {
    width: 7,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
