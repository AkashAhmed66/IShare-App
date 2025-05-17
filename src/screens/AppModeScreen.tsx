import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { RootState } from '../redux/store';
import { setAppMode, AppMode } from '../redux/slices/appModeSlice';

const AppModeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentMode } = useSelector((state: RootState) => state.appMode);

  const handleSelectMode = (mode: AppMode) => {
    dispatch(setAppMode(mode));
    
    if (mode === AppMode.PASSENGER) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'PassengerMode' }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'RiderMode' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Select how you want to use IShare today
        </Text>

        <TouchableOpacity
          style={[
            styles.modeCard,
            currentMode === AppMode.PASSENGER && styles.selectedCard
          ]}
          onPress={() => handleSelectMode(AppMode.PASSENGER)}
        >
          <View style={[
            styles.iconContainer,
            currentMode === AppMode.PASSENGER && styles.selectedIconContainer
          ]}>
            <Ionicons
              name="person"
              size={36}
              color={currentMode === AppMode.PASSENGER ? COLORS.white : COLORS.primary}
            />
          </View>
          <View style={styles.modeDetails}>
            <Text style={styles.modeTitle}>Passenger</Text>
            <Text style={styles.modeDescription}>
              Book rides to your destination
            </Text>
          </View>
          {currentMode === AppMode.PASSENGER && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeCard,
            currentMode === AppMode.RIDER && styles.selectedCard
          ]}
          onPress={() => handleSelectMode(AppMode.RIDER)}
          disabled={!user?.isRider}
        >
          <View style={[
            styles.iconContainer,
            currentMode === AppMode.RIDER && styles.selectedIconContainer,
            !user?.isRider && styles.disabledIconContainer
          ]}>
            <Ionicons
              name="car"
              size={36}
              color={
                !user?.isRider ? COLORS.textSecondary :
                currentMode === AppMode.RIDER ? COLORS.white : COLORS.primary
              }
            />
          </View>
          <View style={styles.modeDetails}>
            <Text style={[
              styles.modeTitle,
              !user?.isRider && styles.disabledText
            ]}>
              Driver
            </Text>
            <Text style={[
              styles.modeDescription,
              !user?.isRider && styles.disabledText
            ]}>
              {user?.isRider 
                ? 'Accept ride requests and earn money' 
                : 'Sign up as a driver to access this mode'}
            </Text>
          </View>
          {currentMode === AppMode.RIDER && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>

        {!user?.isRider && (
          <TouchableOpacity
            style={styles.becomeDriverButton}
            onPress={() => navigation.navigate('RiderSignup')}
          >
            <Text style={styles.becomeDriverText}>Become a Driver</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: COLORS.primary,
  },
  disabledIconContainer: {
    backgroundColor: COLORS.border,
  },
  modeDetails: {
    flex: 1,
  },
  modeTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  modeDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  selectedIndicator: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  becomeDriverButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  becomeDriverText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default AppModeScreen; 