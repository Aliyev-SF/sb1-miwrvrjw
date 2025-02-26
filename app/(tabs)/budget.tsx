import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart, Plus, Settings } from 'lucide-react-native';
import { getBudgetSummary, getCategories } from '@/utils/dataUtils';
import { BudgetSummary, Category, BudgetType } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import CategoryModal from '@/components/CategoryModal';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBudgetType, setSelectedBudgetType] = useState<BudgetType>('needs');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  useEffect(() => {
    // Load data
    const summary = getBudgetSummary();
    setBudgetSummary(summary);
    
    const allCategories = getCategories();
    setCategories(allCategories);
  }, []);

  const filteredCategories = categories.filter(
    category => category.budgetType === selectedBudgetType
  );

  const getBudgetTypeColor = (type: BudgetType): string => {
    switch (type) {
      case 'needs': return '#6366f1';
      case 'wants': return '#8b5cf6';
      case 'savings': return '#10b981';
      default: return '#6366f1';
    }
  };

  const getBudgetData = (type: BudgetType) => {
    if (!budgetSummary) return { spent: 0, limit: 0, percentage: 0 };
    
    const data = budgetSummary[type];
    return {
      spent: data.spent,
      limit: data.limit,
      percentage: Math.round((data.spent / data.limit) * 100),
    };
  };

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    // This would be handled by the dataUtils in a real app
    setIsCategoryModalVisible(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Budget Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Budget Summary</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.budgetOverview}>
          <View style={styles.totalBudget}>
            <Text style={styles.totalBudgetLabel}>Total Budget</Text>
            <Text style={styles.totalBudgetAmount}>
              {formatCurrency(budgetSummary?.income || 0)}
            </Text>
          </View>
          
          <View style={styles.budgetDistribution}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#6366f1' }]} />
              <Text style={styles.distributionLabel}>Needs</Text>
              <Text style={styles.distributionPercentage}>50%</Text>
            </View>
            
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.distributionLabel}>Wants</Text>
              <Text style={styles.distributionPercentage}>30%</Text>
            </View>
            
            <View style={styles.distributionItem}>
              <View style={[styles.distributionDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.distributionLabel}>Savings</Text>
              <Text style={styles.distributionPercentage}>20%</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Budget Type Tabs */}
      <View style={styles.budgetTypeTabs}>
        <TouchableOpacity 
          style={[
            styles.budgetTypeTab, 
            selectedBudgetType === 'needs' && styles.activeBudgetTypeTab,
            { borderBottomColor: '#6366f1' }
          ]}
          onPress={() => setSelectedBudgetType('needs')}
        >
          <Text 
            style={[
              styles.budgetTypeText, 
              selectedBudgetType === 'needs' && styles.activeBudgetTypeText
            ]}
          >
            Needs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.budgetTypeTab, 
            selectedBudgetType === 'wants' && styles.activeBudgetTypeTab,
            { borderBottomColor: '#8b5cf6' }
          ]}
          onPress={() => setSelectedBudgetType('wants')}
        >
          <Text 
            style={[
              styles.budgetTypeText, 
              selectedBudgetType === 'wants' && styles.activeBudgetTypeText
            ]}
          >
            Wants
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.budgetTypeTab, 
            selectedBudgetType === 'savings' && styles.activeBudgetTypeTab,
            { borderBottomColor: '#10b981' }
          ]}
          onPress={() => setSelectedBudgetType('savings')}
        >
          <Text 
            style={[
              styles.budgetTypeText, 
              selectedBudgetType === 'savings' && styles.activeBudgetTypeText
            ]}
          >
            Savings
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Selected Budget Type Details */}
      <View style={styles.budgetTypeDetails}>
        <View style={styles.budgetTypeHeader}>
          <Text style={styles.budgetTypeTitle}>{selectedBudgetType.charAt(0).toUpperCase() + selectedBudgetType.slice(1)}</Text>
          <View style={styles.budgetTypeProgress}>
            <Text style={styles.budgetTypeAmount}>
              {formatCurrency(getBudgetData(selectedBudgetType).spent)} / {formatCurrency(getBudgetData(selectedBudgetType).limit)}
            </Text>
            <Text style={styles.budgetTypePercentage}>
              {getBudgetData(selectedBudgetType).percentage}%
            </Text>
          </View>
        </View>
        
        <BudgetProgressBar 
          progress={getBudgetData(selectedBudgetType).spent / getBudgetData(selectedBudgetType).limit} 
          color={getBudgetTypeColor(selectedBudgetType)}
        />
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <TouchableOpacity 
            style={styles.addCategoryButton}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Plus size={16} color="#6366f1" />
            <Text style={styles.addCategoryText}>Add Category</Text>
          </TouchableOpacity>
        </View>
        
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryAmount}>
                  {formatCurrency(category.spent)} / {formatCurrency(category.limit)}
                </Text>
              </View>
              <BudgetProgressBar 
                progress={category.spent / category.limit} 
                color={getBudgetTypeColor(selectedBudgetType)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyCategoriesState}>
            <PieChart size={32} color="#94a3b8" />
            <Text style={styles.emptyCategoriesText}>No categories yet</Text>
            <Text style={styles.emptyCategoriesSubtext}>
              Add categories to track your spending in this budget type
            </Text>
          </View>
        )}
      </View>
      
      <CategoryModal
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        onSave={handleAddCategory}
        initialBudgetType={selectedBudgetType}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingsButton: {
    padding: 4,
  },
  budgetOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBudget: {
    flex: 1,
  },
  totalBudgetLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  totalBudgetAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  budgetDistribution: {
    flex: 1,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  distributionPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  budgetTypeTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetTypeTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeBudgetTypeTab: {
    borderBottomWidth: 2,
  },
  budgetTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  activeBudgetTypeText: {
    color: '#1e293b',
  },
  budgetTypeDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  budgetTypeProgress: {
    alignItems: 'flex-end',
  },
  budgetTypeAmount: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  budgetTypePercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  categoriesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 4,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  categoryAmount: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyCategoriesState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCategoriesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 8,
  },
  emptyCategoriesSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});