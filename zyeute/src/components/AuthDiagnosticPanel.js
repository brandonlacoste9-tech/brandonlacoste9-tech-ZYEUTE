import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { testSupabaseConnection } from '../lib/utils/authDiagnostics';

/**
 * Diagnostic Panel Component
 * Shows detailed connection diagnostics for troubleshooting
 */
export default function AuthDiagnosticPanel() {
  const [visible, setVisible] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results = await testSupabaseConnection();
    setDiagnostics(results);
    setLoading(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.triggerButton}
        onPress={() => {
          setVisible(true);
          runDiagnostics();
        }}
      >
        <Ionicons name="bug" size={16} color={colors.gold} />
        <Text style={styles.triggerText}>Diagnostics</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Diagnostics de Connexion</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={colors.gold} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {loading ? (
                <Text style={styles.loadingText}>Exécution des tests...</Text>
              ) : diagnostics ? (
                <>
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Statut Global:</Text>
                    <Text style={[
                      styles.statusValue,
                      { color: diagnostics.overall === 'pass' ? colors.success : colors.danger }
                    ]}>
                      {diagnostics.overall === 'pass' ? '✅ PASS' : '❌ FAIL'}
                    </Text>
                  </View>

                  <View style={styles.testsContainer}>
                    <Text style={styles.testsTitle}>Tests de Connexion:</Text>
                    {diagnostics.tests.map((test, index) => (
                      <View key={index} style={styles.testItem}>
                        <View style={styles.testHeader}>
                          <Ionicons
                            name={test.status === 'pass' ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={test.status === 'pass' ? colors.success : colors.danger}
                          />
                          <Text style={styles.testName}>{test.name}</Text>
                        </View>
                        <Text style={styles.testDetails}>
                          {typeof test.details === 'object' 
                            ? JSON.stringify(test.details, null, 2)
                            : test.details}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.configContainer}>
                    <Text style={styles.configTitle}>Configuration:</Text>
                    <Text style={styles.configText}>
                      URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Définie' : '❌ Manquante'}
                    </Text>
                    <Text style={styles.configText}>
                      Clé: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Manquante'}
                    </Text>
                    {process.env.EXPO_PUBLIC_SUPABASE_URL && (
                      <Text style={styles.configUrl} numberOfLines={1}>
                        {process.env.EXPO_PUBLIC_SUPABASE_URL}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={runDiagnostics}
                  >
                    <Ionicons name="refresh" size={20} color={colors.gold} />
                    <Text style={styles.refreshText}>Réexécuter les tests</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyText}>Aucun diagnostic disponible</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: colors.leather,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  triggerText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.leather,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
  },
  modalBody: {
    padding: 20,
  },
  loadingText: {
    color: colors.lightLeather,
    textAlign: 'center',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.bg,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  testsContainer: {
    marginBottom: 20,
  },
  testsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 12,
  },
  testItem: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  testDetails: {
    fontSize: 12,
    color: colors.lightLeather,
    fontFamily: 'monospace',
  },
  configContainer: {
    backgroundColor: colors.bg,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 12,
  },
  configText: {
    fontSize: 14,
    color: colors.lightLeather,
    marginBottom: 4,
  },
  configUrl: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  refreshText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.lightLeather,
    textAlign: 'center',
    fontSize: 14,
  },
});

