import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { logout } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
        {user?.profilePic ? (
          <Image 
            source={{ uri: user.profilePic }} 
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.defaultProfileImage}>
            <Text style={styles.profileInitials}>
              {user?.name.split(' ').map((n: string) => n[0]).join('')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileRating}>
          <Ionicons name="star" size={14} color="#FFC043" />
          {' 4.9'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.editProfileButton}
        onPress={() => console.log('Edit profile pressed')}
      >
        <Text style={styles.editProfileText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContactSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <View style={styles.infoItem}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{user?.email}</Text>
      </View>
      <View style={styles.infoItem}>
        <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{user?.phone}</Text>
      </View>
    </View>
  );

  const renderSavedPlacesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Saved Places</Text>
        <TouchableOpacity onPress={() => console.log('Add place pressed')}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.locationItem}>
        <View style={styles.locationIconContainer}>
          <Ionicons name="home" size={16} color={COLORS.primary} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>Home</Text>
          <Text style={styles.locationAddress}>{user?.homeAddress.address}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationItem}>
        <View style={styles.locationIconContainer}>
          <Ionicons name="briefcase" size={16} color={COLORS.primary} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>Work</Text>
          <Text style={styles.locationAddress}>{user?.workAddress.address}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {user?.savedPlaces.map((place: any) => (
        <TouchableOpacity key={place.id} style={styles.locationItem}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{place.name}</Text>
            <Text style={styles.locationAddress}>{place.address}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Payment')}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {user?.paymentMethods && user.paymentMethods.length > 0 ? (
        user.paymentMethods.map((method: any) => (
          <TouchableOpacity 
            key={method.id} 
            style={styles.paymentItem}
            onPress={() => navigation.navigate('Payment')}
          >
            <View style={styles.paymentIconContainer}>
              <Ionicons 
                name={method.type === 'credit_card' ? 'card' : 'logo-paypal'} 
                size={16} 
                color={COLORS.primary} 
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>
                {method.type === 'credit_card' 
                  ? `${method.brand} •••• ${method.last4}`
                  : method.email
                }
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))
      ) : (
        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={() => navigation.navigate('Payment')}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => navigation.navigate('RideHistory')}
      >
        <Ionicons name="time-outline" size={20} color={COLORS.text} />
        <Text style={styles.actionText}>Ride History</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={20} color={COLORS.text} />
        <Text style={styles.actionText}>Settings</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => console.log('Help pressed')}
      >
        <Ionicons name="help-circle-outline" size={20} color={COLORS.text} />
        <Text style={styles.actionText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => console.log('About pressed')}
      >
        <Ionicons name="information-circle-outline" size={20} color={COLORS.text} />
        <Text style={styles.actionText}>About IShare</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderProfileSection()}
        {renderContactSection()}
        {renderSavedPlacesSection()}
        {renderPaymentSection()}
        {renderActionsSection()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  defaultProfileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  profileRating: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius - 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editProfileText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  locationAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius - 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  defaultText: {
    ...FONTS.body5,
    color: COLORS.primary,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addPaymentText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginLeft: 8,
  },
});

export default ProfileScreen; 