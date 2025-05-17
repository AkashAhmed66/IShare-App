import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { RootState } from '../redux/store';
import { convertToRider } from '../redux/slices/authSlice';
import { setAppMode, AppMode } from '../redux/slices/appModeSlice';

const RiderSignupScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');
  const [insuranceInfo, setInsuranceInfo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');

  const vehicleTypes = [
    { id: 'standard', name: 'Standard', icon: 'car-outline' },
    { id: 'premium', name: 'Premium', icon: 'car-sport-outline' },
    { id: 'xl', name: 'XL', icon: 'car-outline' },
  ];

  const handleSubmit = () => {
    setLoading(true);
    
    // Prepare vehicle and document data
    const vehicleDetails = {
      type: vehicleType,
      make: vehicleMake,
      model: vehicleModel,
      year: vehicleYear,
      licensePlate: licensePlate
    };
    
    const riderDocuments = {
      drivingLicense: drivingLicense,
      insuranceInfo: insuranceInfo
    };
    
    // Dispatch action to convert user to rider
    dispatch(convertToRider({ vehicleDetails, riderDocuments }));
    
    // Set app mode to rider
    dispatch(setAppMode(AppMode.RIDER));
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Account Upgraded',
        'Your account has been successfully upgraded to a driver account. You can now start accepting ride requests.',
        [
          {
            text: 'Start Driving',
            onPress: () => {
              // Navigate to the RiderMode tab navigator
              navigation.reset({
                index: 0,
                routes: [{ name: 'RiderMode' }],
              });
            }
          }
        ]
      );
    }, 2000);
  };

  const handleNextStep = () => {
    if (step === 1 && !vehicleType) {
      Alert.alert('Error', 'Please select a vehicle type');
      return;
    }
    
    if (step === 2) {
      if (!vehicleMake || !vehicleModel || !vehicleYear || !licensePlate) {
        Alert.alert('Error', 'Please fill in all vehicle details');
        return;
      }
    }
    
    if (step === 3) {
      if (!drivingLicense || !insuranceInfo || !phoneNumber) {
        Alert.alert('Error', 'Please provide all required documentation');
        return;
      }
      handleSubmit();
      return;
    }
    
    setStep(step + 1);
  };

  const renderVehicleTypeSelection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Select your vehicle type</Text>
      <Text style={styles.sectionDescription}>
        Choose the type of vehicle you'll be driving
      </Text>
      
      {vehicleTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.vehicleTypeOption,
            vehicleType === type.id && styles.selectedVehicleType
          ]}
          onPress={() => setVehicleType(type.id)}
        >
          <View style={[
            styles.vehicleTypeIcon,
            vehicleType === type.id && styles.selectedVehicleTypeIcon
          ]}>
            <Ionicons 
              name={type.icon} 
              size={28} 
              color={vehicleType === type.id ? COLORS.white : COLORS.primary} 
            />
          </View>
          <View style={styles.vehicleTypeDetails}>
            <Text style={[
              styles.vehicleTypeName,
              vehicleType === type.id && styles.selectedVehicleTypeName
            ]}>
              {type.name}
            </Text>
            <Text style={styles.vehicleTypeDescription}>
              {type.id === 'standard' && 'Regular-sized vehicles for everyday rides'}
              {type.id === 'premium' && 'Luxury vehicles for premium rides'}
              {type.id === 'xl' && 'Larger vehicles for group transportation'}
            </Text>
          </View>
          <View style={styles.radioContainer}>
            <View style={[
              styles.radioOuter,
              vehicleType === type.id && styles.radioOuterSelected
            ]}>
              {vehicleType === type.id && <View style={styles.radioInner} />}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderVehicleDetailsForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Vehicle Details</Text>
      <Text style={styles.sectionDescription}>
        Provide information about your vehicle
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Make</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Toyota, Honda, Ford"
          value={vehicleMake}
          onChangeText={setVehicleMake}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Model</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Camry, Civic, Focus"
          value={vehicleModel}
          onChangeText={setVehicleModel}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Year</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., 2019"
          value={vehicleYear}
          onChangeText={setVehicleYear}
          keyboardType="number-pad"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>License Plate Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your license plate number"
          value={licensePlate}
          onChangeText={setLicensePlate}
          autoCapitalize="characters"
        />
      </View>
    </View>
  );

  const renderDocumentsForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Required Documentation</Text>
      <Text style={styles.sectionDescription}>
        Provide the necessary documents to verify your identity and eligibility
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Driving License Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your driving license number"
          value={drivingLicense}
          onChangeText={setDrivingLicense}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Vehicle Insurance Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your insurance policy number"
          value={insuranceInfo}
          onChangeText={setInsuranceInfo}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your contact number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.documentUploadSection}>
        <Text style={styles.inputLabel}>Upload Documents</Text>
        <Text style={styles.documentNote}>
          You'll need to upload photos of your driving license, insurance card, and vehicle registration
        </Text>
        
        <View style={styles.uploadButtonsContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload License</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload Insurance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload Registration</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Become a Driver</Text>
        <View style={styles.backButton} />
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <View style={styles.stepsContainer}>
          <View style={styles.stepWrapper}>
            <View style={[styles.stepIndicator, step >= 1 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 1 && styles.activeStepNumber]}>1</Text>
            </View>
            <Text style={styles.stepLabel}>Vehicle Type</Text>
          </View>
          
          <View style={styles.stepWrapper}>
            <View style={[styles.stepIndicator, step >= 2 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 2 && styles.activeStepNumber]}>2</Text>
            </View>
            <Text style={styles.stepLabel}>Vehicle Details</Text>
          </View>
          
          <View style={styles.stepWrapper}>
            <View style={[styles.stepIndicator, step >= 3 && styles.activeStep]}>
              <Text style={[styles.stepNumber, step >= 3 && styles.activeStepNumber]}>3</Text>
            </View>
            <Text style={styles.stepLabel}>Documentation</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {step === 1 && renderVehicleTypeSelection()}
        {step === 2 && renderVehicleDetailsForm()}
        {step === 3 && renderDocumentsForm()}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextStep}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 3 ? 'Submit Application' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
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
  progressContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  stepNumber: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeStepNumber: {
    color: COLORS.white,
  },
  stepLabel: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  formSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    margin: SIZES.padding,
    ...SHADOWS.light,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  vehicleTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    padding: 12,
    marginBottom: 12,
  },
  selectedVehicleType: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  vehicleTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedVehicleTypeIcon: {
    backgroundColor: COLORS.primary,
  },
  vehicleTypeDetails: {
    flex: 1,
  },
  vehicleTypeName: {
    ...FONTS.h4,
    marginBottom: 4,
  },
  selectedVehicleTypeName: {
    color: COLORS.primary,
  },
  vehicleTypeDescription: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
  radioContainer: {
    paddingLeft: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    ...FONTS.body4,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    ...FONTS.body4,
  },
  documentUploadSection: {
    marginTop: 20,
  },
  documentNote: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  uploadButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.accent,
    borderRadius: SIZES.radius - 4,
    marginBottom: 12,
  },
  uploadButtonText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.light,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    borderRadius: SIZES.radius - 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default RiderSignupScreen; 