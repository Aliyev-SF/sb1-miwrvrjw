import React from 'react';
import { View, StyleSheet } from 'react-native';

interface BudgetProgressBarProps {
  progress: number;
  color: string;
  height?: number;
}

export default function BudgetProgressBar({ 
  progress, 
  color, 
  height = 8 
}: BudgetProgressBarProps) {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress > 1) return '#ef4444'; // Over budget - red
    if (progress > 0.9) return '#f97316'; // Close to budget - orange
    return color; // Default color
  };
  
  return (
    <View style={[styles.container, { height }]}>
      <View 
        style={[
          styles.progressBar, 
          { 
            width: `${clampedProgress * 100}%`,
            backgroundColor: getProgressColor(),
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});