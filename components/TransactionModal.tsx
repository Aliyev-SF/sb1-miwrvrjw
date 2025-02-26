import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { Transaction, TransactionCategory } from '@/types';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

// Mock categories - in a real app, these would come from your data store
const CATEGORIES: TransactionCategory[] = [
  { id: '1', name: 'Groceries', budgetType: 'needs' },
  { id: '2', name: 'Rent', budgetType: 'needs' },
  { id: '3', name: 'Utilities', budgetType: 'needs' },
  { id: '4', name: 'Dining Out', budgetType: 'wants' },
  { id: '5', name: 'Entertainment', budgetType: 'wants' },
  { id: '6', name: 'Shopping', budgetType: 'wants' },
  { id: '7', name: 'Investments', budgetType: 'savings' },
  { id: '8', name: 'Emergency Fund', budgetType: 'savings' },
];

export default function TransactionModal({ 
  visible, 
  onClose, 
  onSave
}: TransactionModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const handleSave = () => {
    if (!title.trim() || !amount.trim() || !category) return;
    
    onSave({
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
    });
    
    // Reset form
    resetForm();
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('');
    setShowCategoryPicker(false);
  };
  
  const selectCategory = (categoryName: string) => {
    setCategory(categoryName);
    setShowCategoryPicker(false);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Transaction Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Grocery Shopping, Salary"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Transaction Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.typeButton,
                      type === 'expense' && styles.activeExpenseButton
                    ]}
                    onPress={() => setType('expense')}
                  >
                    <Text 
                      style={[
                        styles.typeText,
                        type === 'expense' && styles.activeTypeText
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.typeButton,
                      type === 'income' && styles.activeIncomeButton
                    ]}
                    onPress={() => setType('income')}
                  >
                    <Text 
                      style={[
                        styles.typeText,
                        type === 'income' && styles.activeTypeText
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity 
                  style={styles.categorySelector}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={[
                    styles.categorySelectorText,
                    !category && styles.categorySelectorPlaceholder
                  ]}>
                    {category || 'Select a category'}
                  </Text>
                  <ChevronDown size={20} color="#64748b" />
                </TouchableOpacity>
                
                {showCategoryPicker && (
                  <View style={styles.categoryPickerContainer}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity 
                        key={cat.id}
                        style={styles.categoryOption}
                        onPress={() => selectCategory(cat.name)}
                      >
                        <Text style={styles.categoryOptionText}>{cat.name}</Text>
                        <View 
                          style={[
                            styles.budgetTypeIndicator,
                            {
                              backgroundColor: 
                                cat.budgetType === 'needs' ? '#6366f1' :
                                cat.budgetType === 'wants' ? '#8b5cf6' : '#10b981'
                            }
                          ]}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={!title.trim() || !amount.trim() || !category}
            >
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 4,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  activeExpenseButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  activeIncomeButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTypeText: {
    color: '#1e293b',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#1e293b',
  },
  categorySelectorPlaceholder: {
    color: '#94a3b8',
  },
  categoryPickerContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: 200,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  budgetTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});