import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  Sparkles,
  Send,
  HelpCircle,
  Dna,
  ShieldAlert,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Info,
  Check,
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { aiService } from '../../src/services/aiService';

const SUGGESTED_QUESTIONS = [
  'Can I combine Retinol and Vitamin C?',
  'How do I care for a damaged skin barrier in humid Indian climate?',
  'What are the scientific benefits of Niacinamide?',
  'Safe home remedies for mild sun tan or hyperpigmentation',
];

const INITIAL_MESSAGES = [
  {
    id: 'welcome',
    isAssistant: true,
    text: 'Hello. I am Bellezza AI, your evidence-grounded dermatological consultant. How can I assist your skincare decisions today?',
    scientificInsights:
      'Responses are synthesized using PubMed clinical dermatological literature, PubChem biochemical data, and personal allergy safety profiles.',
    suggestedIngredients: ['Ceramides', 'Niacinamide', 'Hyaluronic Acid'],
    citations: ['Cosmetic Dermatology: Principles and Practice (Baumann, 2009)', 'Indian J Dermatol Venereol Leprol'],
    timestamp: 'Just now',
  },
];

const AI_CATEGORIES = [
  { id: 'general', label: 'All Science' },
  { id: 'routine', label: 'Routines' },
  { id: 'ingredients', label: 'Actives' },
  { id: 'remedies', label: 'Home Care' },
];

const querySchema = Yup.object().shape({
  query: Yup.string().trim().min(2, 'Query too short').max(500, 'Query too long').required(),
});

export default function AssistantScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [conversationId, setConversationId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    if (!queryText || !queryText.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      isAssistant: false,
      text: queryText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await aiService.chat(queryText.trim(), conversationId, activeCategory);
      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage = {
        id: response.messageId || (Date.now() + 1).toString(),
        isAssistant: true,
        text: response.reply || response.answer,
        scientificInsights: response.scientificInsights,
        suggestedIngredients: response.suggestedIngredients || [],
        recommendedProducts: response.recommendedProducts || [],
        citations: response.citations || [],
        disclaimer: response.disclaimer,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        isAssistant: true,
        text: 'Our dermatological intelligence engine encountered a temporary network delay. Please try asking again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (msgId, type) => {
    if (!conversationId) return;
    try {
      await aiService.submitFeedback(conversationId, msgId, type);
      setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
    } catch (err) {
      console.warn('Feedback submission failed:', err.message);
    }
  };

  const handleResetChat = () => {
    Alert.alert('Clear Conversation', 'Reset conversation back to welcome state?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setMessages(INITIAL_MESSAGES);
          setConversationId(null);
          setFeedbackGiven({});
        },
      },
    ]);
  };

  return (
    <ScreenContainer scrollable={false} padded={false} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Sparkles size={18} color={COLORS.cream} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <View style={styles.badgeRow}>
              <Text style={styles.headerSubtitle}>AI CLINICAL CONSULTANT</Text>
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.headerTitle}>Bellezza AI</Text>
          </View>
          <TouchableOpacity onPress={handleResetChat} style={styles.resetBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <RotateCcw size={16} color={COLORS.burgundy} />
          </TouchableOpacity>
        </View>

        {/* Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <ShieldAlert size={12} color={COLORS.textSecondary} />
          <Text style={styles.disclaimerText}>
            Educational guidance only. Non-diagnostic. Not intended to replace a certified dermatologist.
          </Text>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoryPillsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPillsScroll}>
            {AI_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Conversation Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Suggested Questions */}
          {messages.length <= 2 ? (
            <View style={styles.suggestedSection}>
              <View style={styles.suggestedHeader}>
                <HelpCircle size={13} color={COLORS.burgundy} />
                <Text style={styles.suggestedTitle}>SUGGESTED CLINICAL INQUIRIES</Text>
              </View>
              <View style={styles.promptsGrid}>
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    style={styles.promptPill}
                    onPress={() => handleSend(question)}
                  >
                    <Sparkles size={12} color={COLORS.dustyPink} style={{ marginRight: 6 }} />
                    <Text style={styles.promptText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Messages */}
          {messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageRow,
                item.isAssistant ? styles.assistantRow : styles.userRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.isAssistant ? styles.assistantBubble : styles.userBubble,
                  SHADOWS.subtle,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.isAssistant ? styles.assistantText : styles.userText,
                  ]}
                >
                  {item.text}
                </Text>

                {item.scientificInsights ? (
                  <View style={styles.scienceCallout}>
                    <Dna size={14} color={COLORS.burgundy} style={{ marginTop: 2, marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scienceTitle}>MOLECULAR INSIGHT</Text>
                      <Text style={styles.scienceText}>{item.scientificInsights}</Text>
                    </View>
                  </View>
                ) : null}

                {item.suggestedIngredients && item.suggestedIngredients.length > 0 ? (
                  <View style={styles.ingredientsArea}>
                    <Text style={styles.ingredientsLabel}>KEY ACTIVES</Text>
                    <View style={styles.pillsRow}>
                      {item.suggestedIngredients.map((ing, idx) => (
                        <View key={idx} style={styles.ingredientBadge}>
                          <Text style={styles.ingredientBadgeText}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Citations */}
                {item.citations && item.citations.length > 0 ? (
                  <View style={styles.citationsArea}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                      <BookOpen size={11} color={COLORS.dustyPink} />
                      <Text style={styles.citationsLabel}>SCIENTIFIC CITATIONS</Text>
                    </View>
                    {item.citations.map((cite, cIdx) => (
                      <Text key={cIdx} style={styles.citationText}>
                        • {cite}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {/* Feedback Buttons for Assistant */}
                {item.isAssistant && item.id !== 'welcome' ? (
                  <View style={styles.feedbackRow}>
                    <Text style={styles.feedbackHint}>Was this evidence helpful?</Text>
                    <TouchableOpacity
                      onPress={() => handleFeedback(item.id, 'helpful')}
                      style={[
                        styles.feedbackBtn,
                        feedbackGiven[item.id] === 'helpful' && styles.feedbackBtnActive,
                      ]}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <ThumbsUp
                        size={12}
                        color={feedbackGiven[item.id] === 'helpful' ? COLORS.burgundy : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleFeedback(item.id, 'not_helpful')}
                      style={[
                        styles.feedbackBtn,
                        feedbackGiven[item.id] === 'not_helpful' && styles.feedbackBtnActive,
                      ]}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <ThumbsDown
                        size={12}
                        color={feedbackGiven[item.id] === 'not_helpful' ? COLORS.burgundy : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            </View>
          ))}

          {loading ? (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={COLORS.burgundy} />
              <Text style={styles.loadingText}>Synthesizing PubMed clinical literature & molecular data…</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Input Bar */}
        <Formik
          initialValues={{ query: '' }}
          validationSchema={querySchema}
          onSubmit={async (values, { resetForm }) => {
            const text = values.query;
            resetForm();
            await handleSend(text);
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values }) => (
            <View style={styles.inputBar}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask about skin science, actives, routines..."
                placeholderTextColor={COLORS.textMuted}
                value={values.query}
                onChangeText={handleChange('query')}
                onBlur={handleBlur('query')}
                onSubmitEditing={handleSubmit}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!values.query.trim() || loading}
                style={[
                  styles.sendBtn,
                  (!values.query.trim() || loading) && styles.sendBtnDisabled,
                ]}
                accessibilityLabel="Send inquiry"
              >
                <Send size={16} color={COLORS.cream} />
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    backgroundColor: COLORS.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  headerTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.burgundy,
  },
  resetBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.softCream,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    flex: 1,
  },
  categoryPillsWrap: {
    paddingVertical: 6,
    backgroundColor: COLORS.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  categoryPillsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catPillActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  catPillText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: COLORS.cream,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 24,
  },
  suggestedSection: {
    backgroundColor: COLORS.warmWhite,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  suggestedTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
  },
  promptsGrid: {
    gap: 8,
  },
  promptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  promptText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontSize: 12,
    flex: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  assistantBubble: {
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.burgundy,
    borderTopRightRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.bodyMedium,
    lineHeight: 22,
  },
  assistantText: {
    color: COLORS.textPrimary,
  },
  userText: {
    color: COLORS.cream,
  },
  scienceCallout: {
    flexDirection: 'row',
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.md,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.burgundy,
  },
  scienceTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.burgundy,
    fontSize: 8,
    marginBottom: 2,
  },
  scienceText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  ingredientsArea: {
    marginTop: 10,
  },
  ingredientsLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 8,
    marginBottom: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ingredientBadge: {
    backgroundColor: '#FCF0F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#F5C6D0',
  },
  ingredientBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  citationsArea: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  citationsLabel: {
    ...TYPOGRAPHY.overline,
    fontSize: 8,
    color: COLORS.dustyPink,
  },
  citationText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  feedbackHint: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
  },
  feedbackBtn: {
    padding: 4,
    borderRadius: RADIUS.full,
  },
  feedbackBtnActive: {
    backgroundColor: COLORS.softCream,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warmWhite,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
    fontSize: 12,
    color: COLORS.burgundy,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.warmWhite,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.softCream,
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#DFD7D0',
  },
});
