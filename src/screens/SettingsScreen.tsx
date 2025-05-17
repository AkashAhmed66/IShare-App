import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { RootState } from '../redux/store';

const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for various settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saveRideHistory, setSaveRideHistory] = useState(true);
  const [autoSuggest, setAutoSuggest] = useState(true);

  const toggleSetting = (setting: string, value: boolean) => {
    // In a real app, this would update settings in redux/backend
    switch (setting) {
      case 'pushNotifications':
        setPushNotifications(value);
        break;
      case 'emailNotifications':
        setEmailNotifications(value);
        break;
      case 'locationServices':
        setLocationServices(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'saveRideHistory':
        setSaveRideHistory(value);
        break;
      case 'autoSuggest':
        setAutoSuggest(value);
        break;
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => console.log('Delete account pressed'),
          style: 'destructive',
        },
      ]
    );
  };

  const renderNotificationSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Text style={styles.settingDescription}>
            Receive push notifications for ride updates
          </Text>
        </View>
        <Switch
          value={pushNotifications}
          onValueChange={(value) => toggleSetting('pushNotifications', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={pushNotifications ? COLORS.primary : COLORS.white}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Text style={styles.settingDescription}>
            Receive email notifications for receipts and promotions
          </Text>
        </View>
        <Switch
          value={emailNotifications}
          onValueChange={(value) => toggleSetting('emailNotifications', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={emailNotifications ? COLORS.primary : COLORS.white}
        />
      </View>
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Privacy</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Location Services</Text>
          <Text style={styles.settingDescription}>
            Allow app to access your location
          </Text>
        </View>
        <Switch
          value={locationServices}
          onValueChange={(value) => toggleSetting('locationServices', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={locationServices ? COLORS.primary : COLORS.white}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Save Ride History</Text>
          <Text style={styles.settingDescription}>
            Store your ride history for easier bookings
          </Text>
        </View>
        <Switch
          value={saveRideHistory}
          onValueChange={(value) => toggleSetting('saveRideHistory', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={saveRideHistory ? COLORS.primary : COLORS.white}
        />
      </View>
    </View>
  );

  const renderAppSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>App Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Text style={styles.settingDescription}>
            Use dark theme for the app
          </Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={(value) => toggleSetting('darkMode', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={darkMode ? COLORS.primary : COLORS.white}
        />
      </View>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Auto-suggest Locations</Text>
          <Text style={styles.settingDescription}>
            Automatically suggest destinations based on history
          </Text>
        </View>
        <Switch
          value={autoSuggest}
          onValueChange={(value) => toggleSetting('autoSuggest', value)}
          trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
          thumbColor={autoSuggest ? COLORS.primary : COLORS.white}
        />
      </View>
    </View>
  );

  const renderAccountSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => navigation.navigate('Payment')}
      >
        <Ionicons name="card-outline" size={24} color={COLORS.text} />
        <Text style={styles.actionText}>Payment Methods</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => console.log('Change password pressed')}
      >
        <Ionicons name="lock-closed-outline" size={24} color={COLORS.text} />
        <Text style={styles.actionText}>Change Password</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionItem}
        onPress={() => console.log('Language pressed')}
      >
        <Ionicons name="language-outline" size={24} color={COLORS.text} />
        <Text style={styles.actionText}>Language</Text>
        <Text style={styles.actionValue}>English</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionItem, styles.dangerAction]}
        onPress={handleDeleteAccount}
      >
        <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        <Text style={styles.dangerText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderNotificationSettings()}
        {renderPrivacySettings()}
        {renderAppSettings()}
        {renderAccountSettings()}
        
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>IShare v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2023 IShare Inc.</Text>
        </View>
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
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
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
  actionValue: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  appVersion: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  appCopyright: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
});

export default SettingsScreen; 