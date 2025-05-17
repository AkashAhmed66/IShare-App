import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';
import EmptyState from '../components/EmptyState';

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState('');

  const handleAddPayment = () => {
    setIsAddingPayment(true);
  };

  const cancelAddPayment = () => {
    setIsAddingPayment(false);
    // Reset form
    setPaymentType('credit_card');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardName('');
    setEmail('');
  };

  const validateAndSavePayment = () => {
    if (paymentType === 'credit_card') {
      if (!cardNumber || !cardExpiry || !cardCVV || !cardName) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
      
      // In a real app, would validate card details format
      
      // Mock saving the card
      const newPayment = {
        id: `payment${Date.now()}`,
        type: 'credit_card',
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith('4') ? 'Visa' : 'MasterCard',
        isDefault: user?.paymentMethods?.length === 0 ? true : false,
      };
      
      dispatch(addPaymentMethod(newPayment));
      setIsAddingPayment(false);
      
      // Reset form
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setCardName('');
      
    } else if (paymentType === 'paypal') {
      if (!email) {
        Alert.alert('Error', 'Please enter your PayPal email');
        return;
      }
      
      // Mock saving the PayPal account
      const newPayment = {
        id: `payment${Date.now()}`,
        type: 'paypal',
        email: email,
        isDefault: user?.paymentMethods?.length === 0 ? true : false,
      };
      
      dispatch(addPaymentMethod(newPayment));
      setIsAddingPayment(false);
      
      // Reset form
      setEmail('');
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => dispatch(removePaymentMethod(paymentId)),
          style: 'destructive',
        },
      ]
    );
  };

  const handleSetDefault = (paymentId: string) => {
    dispatch(setDefaultPaymentMethod(paymentId));
  };

  const renderPaymentItem = ({ item }: { item: any }) => (
    <View style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentTypeContainer}>
          <View style={styles.paymentIconContainer}>
            <Ionicons 
              name={item.type === 'credit_card' ? 'card' : 'logo-paypal'} 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
          <View>
            <Text style={styles.paymentTypeName}>
              {item.type === 'credit_card' ? `${item.brand}` : 'PayPal'}
            </Text>
            <Text style={styles.paymentTypeDetail}>
              {item.type === 'credit_card' ? `•••• ${item.last4}` : item.email}
            </Text>
          </View>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentActions}>
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeletePayment(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentForm = () => (
    <View style={styles.paymentForm}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Add Payment Method</Text>
        <TouchableOpacity onPress={cancelAddPayment}>
          <Ionicons name="close" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.paymentTypeSelector}>
        <TouchableOpacity 
          style={[
            styles.paymentTypeOption, 
            paymentType === 'credit_card' && styles.selectedPaymentType
          ]}
          onPress={() => setPaymentType('credit_card')}
        >
          <Ionicons 
            name="card" 
            size={20} 
            color={paymentType === 'credit_card' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[
            styles.paymentTypeText,
            paymentType === 'credit_card' && styles.selectedPaymentTypeText
          ]}>
            Credit Card
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.paymentTypeOption, 
            paymentType === 'paypal' && styles.selectedPaymentType
          ]}
          onPress={() => setPaymentType('paypal')}
        >
          <Ionicons 
            name="logo-paypal" 
            size={20} 
            color={paymentType === 'paypal' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[
            styles.paymentTypeText,
            paymentType === 'paypal' && styles.selectedPaymentTypeText
          ]}>
            PayPal
          </Text>
        </TouchableOpacity>
      </View>
      
      {paymentType === 'credit_card' ? (
        <View style={styles.cardForm}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput
              style={styles.formInput}
              placeholder="1234 5678 9012 3456"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
              maxLength={16}
            />
          </View>
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.formLabel}>Expiry</Text>
              <TextInput
                style={styles.formInput}
                placeholder="MM/YY"
                keyboardType="number-pad"
                value={cardExpiry}
                onChangeText={setCardExpiry}
                maxLength={5}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.formLabel}>CVV</Text>
              <TextInput
                style={styles.formInput}
                placeholder="123"
                keyboardType="number-pad"
                value={cardCVV}
                onChangeText={setCardCVV}
                maxLength={3}
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Name on Card</Text>
            <TextInput
              style={styles.formInput}
              placeholder="John Doe"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>
        </View>
      ) : (
        <View style={styles.paypalForm}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>PayPal Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="email@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={validateAndSavePayment}
      >
        <Text style={styles.saveButtonText}>Save Payment Method</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="card"
      message="You haven't added any payment methods yet"
      actionText="Add Payment Method"
      onAction={handleAddPayment}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {isAddingPayment ? (
        renderPaymentForm()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Payment Methods</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddPayment}
            >
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          {user?.paymentMethods && user.paymentMethods.length > 0 ? (
            <FlatList
              data={user.paymentMethods}
              renderItem={renderPaymentItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
  },
  paymentItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTypeName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
  },
  paymentTypeDetail: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  defaultBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius - 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  setDefaultButton: {
    marginRight: 16,
  },
  setDefaultText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  deleteButton: {
    padding: 8,
  },
  paymentForm: {
    flex: 1,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  paymentTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius - 4,
    marginRight: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedPaymentType: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  paymentTypeText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  selectedPaymentTypeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardForm: {
    marginBottom: 24,
  },
  paypalForm: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    ...FONTS.body4,
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...FONTS.body3,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default PaymentScreen; 