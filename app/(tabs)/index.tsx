import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart, DollarSign, TrendingUp, Wallet } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getBudgetSummary, getRecentTransactions } from '@/utils/dataUtils';
import { Transaction, BudgetSummary } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import BudgetProgressBar from '@/components/BudgetProgressBar';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);

  useEffect(() => {
    // Load data
    const transactions = getRecentTransactions();
    setRecentTransactions(transactions);
    
    const summary = getBudgetSummary();
    setBudgetSummary(summary);
  }, []);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Balance Summary */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(budgetSummary?.balance || 0)}</Text>
        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeContainer}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.incomeLabel}>Income</Text>
            <Text style={styles.incomeAmount}>{formatCurrency(budgetSummary?.income || 0)}</Text>
          </View>
          <View style={styles.expenseContainer}>
            <TrendingUp size={16} color="#ef4444" style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={styles.expenseLabel}>Expenses</Text>
            <Text style={styles.expenseAmount}>{formatCurrency(budgetSummary?.expenses || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Budget Progress */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          <TouchableOpacity onPress={() => router.push('/budget')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.budgetProgressContainer}>
          <View style={styles.budgetCategory}>
            <View style={styles.budgetCategoryHeader}>
              <Text style={styles.budgetCategoryTitle}>Needs (50%)</Text>
              <Text style={styles.budgetCategoryAmount}>
                {formatCurrency(budgetSummary?.needs.spent || 0)} / {formatCurrency(budgetSummary?.needs.limit || 0)}
              </Text>
            </View>
            <BudgetProgressBar 
              progress={(budgetSummary?.needs.spent || 0) / (budgetSummary?.needs.limit || 1)} 
              color="#6366f1"
            />
          </View>
          
          <View style={styles.budgetCategory}>
            <View style={styles.budgetCategoryHeader}>
              <Text style={styles.budgetCategoryTitle}>Wants (30%)</Text>
              <Text style={styles.budgetCategoryAmount}>
                {formatCurrency(budgetSummary?.wants.spent || 0)} / {formatCurrency(budgetSummary?.wants.limit || 0)}
              </Text>
            </View>
            <BudgetProgressBar 
              progress={(budgetSummary?.wants.spent || 0) / (budgetSummary?.wants.limit || 1)} 
              color="#8b5cf6"
            />
          </View>
          
          <View style={styles.budgetCategory}>
            <View style={styles.budgetCategoryHeader}>
              <Text style={styles.budgetCategoryTitle}>Savings (20%)</Text>
              <Text style={styles.budgetCategoryAmount}>
                {formatCurrency(budgetSummary?.savings.spent || 0)} / {formatCurrency(budgetSummary?.savings.limit || 0)}
              </Text>
            </View>
            <BudgetProgressBar 
              progress={(budgetSummary?.savings.spent || 0) / (budgetSummary?.savings.limit || 1)} 
              color="#10b981"
            />
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIconContainer}>
                {transaction.type === 'expense' ? (
                  <Wallet size={20} color="#ef4444" />
                ) : (
                  <DollarSign size={20} color="#10b981" />
                )}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>{transaction.category}</Text>
              </View>
              <Text 
                style={[
                  styles.transactionAmount, 
                  transaction.type === 'expense' ? styles.expenseText : styles.incomeText
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyStateText}>No recent transactions</Text>
        )}
      </View>

      {/* Monthly Overview */}
      <View style={[styles.sectionContainer, styles.chartContainer]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Overview</Text>
        </View>
        <View style={styles.chartPlaceholder}>
          <BarChart size={24} color="#6366f1" />
          <Text style={styles.chartPlaceholderText}>Monthly spending overview</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  balanceCard: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  expenseContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  incomeLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginTop: 4,
  },
  expenseLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    marginTop: 4,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  budgetProgressContainer: {
    gap: 16,
  },
  budgetCategory: {
    marginBottom: 8,
  },
  budgetCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetCategoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  budgetCategoryAmount: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeText: {
    color: '#10b981',
  },
  expenseText: {
    color: '#ef4444',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 16,
  },
  chartContainer: {
    marginBottom: 32,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    marginTop: 8,
    color: '#64748b',
  },
});