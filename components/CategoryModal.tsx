import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { X } from 'lucide-react-native';
import { BudgetType, Category } from '@/types';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
  initialBudgetType?: BudgetType;
}

export default function CategoryModal({ 
  visible, 
  onClose, 
  onSave,
  initialBudgetType = 'needs'
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [budgetType, setBudgetType] = useState<BudgetType>(initialBudgetType);
  
  const handleSave = () => {
    if (!name.trim() || !limit.trim()) return;
    
    onSave({
      name: name.trim(),
      limit: parseFloat(limit),
      spent: 0,
      budgetType,
    });
    
    // Reset form
    setName('');
    setLimit('');
    setBudgetType(initialBudgetType);
  };
  
  const handleClose = () => {
    // Reset form
    setName('');
    setLimit('');
    setBudgetType(initialBudgetType);
    onClose();
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
              <Text style={styles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Groceries, Rent, Entertainment"
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Monthly Budget Limit</Text>
              <TextInput
                style={styles.input}
                value={limit}
                onChangeText={setLimit}
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Budget Type</Text>
              <View style={styles.budgetTypeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.budgetTypeButton,
                    budgetType === 'needs' && styles.activeBudgetTypeButton,
                    { borderColor: '#6366f1' }
                  ]}
                  onPress={() => setBudgetType('needs')}
                >
                  <Text 
                    style={[
                      styles.budgetTypeText,
                      budgetType === 'needs' && { color: '#6366f1' }
                    ]}
                  >
                    Needs
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.budgetTypeButton,
                    budgetType === 'wants' && styles.activeBudgetTypeButton,
                    { borderColor: '#8b5cf6' }
                  ]}
                  onPress={() => setBudgetType('wants')}
                >
                  <Text 
                    style={[
                      styles.budgetTypeText,
                      budgetType === 'wants' && { color: '#8b5cf6' }
                    ]}
                  >
                    Wants
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.budgetTypeButton,
                    budgetType === 'savings' && styles.activeBudgetTypeButton,
                    { borderColor: '#10b981' }
                  ]}
                  onPress={() => setBudgetType('savings')}
                >
                  <Text 
                    style={[
                      styles.budgetTypeText,
                      budgetType === 'savings' && { color: '#10b981' }
                    ]}
                  >
                    Savings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={!name.trim() || !limit.trim()}
            >
              <Text style={styles.saveButtonText}>Save Category</Text>
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
  budgetTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    marginHorizontal: 4,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  activeBudgetTypeButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
  },
  budgetTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
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