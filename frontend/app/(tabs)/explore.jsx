import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Bookmark,
  Sparkles,
  Barcode,
  FlaskConical,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Atom,
  BookOpen,
  PlusCircle,
  Tag,
  GitCompare,
  Shuffle,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../src/constants/theme';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { SearchBar } from '../../src/components/common/SearchBar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { ProductCard } from '../../src/components/cards/ProductCard';
import { IngredientCard } from '../../src/components/cards/IngredientCard';
import { RemedyCard } from '../../src/components/cards/RemedyCard';
import { SkinConcernCard } from '../../src/components/cards/SkinConcernCard';
import { RoutineCard } from '../../src/components/cards/RoutineCard';
import { productService, FALLBACK_PRODUCTS } from '../../src/services/productService';
import { ingredientService } from '../../src/services/ingredientService';
import { remedyService } from '../../src/services/remedyService';
import { BUDGET_TIERS, POPULAR_INDIAN_BRANDS } from '../../src/constants/indianMarket';
import { formatInr, formatIndianDate } from '../../src/utils/formatters';
import {
  SAMPLE_INGREDIENTS,
  SAMPLE_REMEDIES,
  SKIN_CONCERNS,
  DEFAULT_MORNING_ROUTINE,
  DEFAULT_EVENING_ROUTINE,
} from '../../src/data/sampleData';

const CATEGORIES = [
  'All',
  'Products',
  'Ingredients',
  'Home Remedies',
  'Skin Concerns',
  'Routines',
];

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const { user, toggleSavedProduct, toggleSavedIngredient } = useAuth();

  const [activeCategory, setActiveCategory] = useState(params.category || 'All');
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [onlySaved, setOnlySaved] = useState(false);

  // Live API States
  const [apiProducts, setApiProducts] = useState(FALLBACK_PRODUCTS);
  const [apiIngredients, setApiIngredients] = useState(SAMPLE_INGREDIENTS);
  const [apiRemedies, setApiRemedies] = useState(SAMPLE_REMEDIES);
  const [savedRemedyIds, setSavedRemedyIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('8906128100018');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [barcodeError, setBarcodeError] = useState('');

  // Compatibility Checker Modal
  const [compatibilityModalVisible, setCompatibilityModalVisible] = useState(false);
  const [compatActives, setCompatActives] = useState(['Retinol', 'Vitamin C']);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatResult, setCompatResult] = useState(null);

  // Formula Analyzer Modal
  const [analyzerModalVisible, setAnalyzerModalVisible] = useState(false);
  const [formulaInput, setFormulaInput] = useState('Aqua, Glycerin, Niacinamide, Salicylic Acid, Fragrance, Ceramide NP');
  const [analyzerLoading, setAnalyzerLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Ingredient Intelligence Modal (PubChem + PubMed)
  const [intelModalVisible, setIntelModalVisible] = useState(false);
  const [selectedIntelName, setSelectedIntelName] = useState('niacinamide');
  const [intelData, setIntelData] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  // Submit Product Modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [subBarcode, setSubBarcode] = useState('');
  const [subName, setSubName] = useState('');
  const [subBrand, setSubBrand] = useState('');
  const [subCategory, setSubCategory] = useState('serum');
  const [subPrice, setSubPrice] = useState('');
  const [subIngredients, setSubIngredients] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const savedProductIds = user?.savedProducts || [];
  const savedIngredientIds = user?.savedIngredients || [];

  // Load Saved Remedies
  useEffect(() => {
    remedyService.getSavedRemedies().then((saved) => {
      if (Array.isArray(saved)) {
        setSavedRemedyIds(saved.map((r) => r._id || r.id));
      }
    }).catch(() => {});
  }, []);

  const handleToggleSaveRemedy = async (remedyId) => {
    const isCurrentlySaved = savedRemedyIds.includes(remedyId);
    try {
      if (isCurrentlySaved) {
        await remedyService.unsaveRemedy(remedyId);
        setSavedRemedyIds((prev) => prev.filter((id) => id !== remedyId));
      } else {
        await remedyService.saveRemedy(remedyId);
        setSavedRemedyIds((prev) => [...prev, remedyId]);
      }
    } catch (err) {
      console.warn('Failed to toggle save remedy:', err.message);
    }
  };

  // Live Product, Ingredient & Remedy Search via Backend API
  const performSearch = useCallback(async (query, budgetTier, brandFilter) => {
    setIsLoading(true);
    try {
      let prodRes;
      if (budgetTier !== 'all' || (brandFilter && brandFilter !== 'All Brands')) {
        prodRes = await productService.getProductsByBudget({
          budget: budgetTier,
          brand: brandFilter !== 'All Brands' ? brandFilter : undefined,
        });
      } else {
        prodRes = await productService.searchProducts(query, { limit: 20 });
      }

      const ingRes = await ingredientService.searchIngredients(query);

      let remRes;
      try {
        remRes = await remedyService.getRemedies({ search: query });
      } catch {}

      if (prodRes && Array.isArray(prodRes.products)) {
        setApiProducts(prodRes.products);
      }
      if (ingRes && Array.isArray(ingRes) && ingRes.length > 0) {
        setApiIngredients(ingRes);
      }
      if (remRes && Array.isArray(remRes) && remRes.length > 0) {
        setApiRemedies(remRes);
      }
    } catch (err) {
      console.warn('[ExploreScreen] Search error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, selectedBudget, selectedBrand);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedBudget, selectedBrand, performSearch]);

  // Load Ingredient Intelligence
  const handleOpenIntelligence = async (ingredientName) => {
    setSelectedIntelName(ingredientName);
    setIntelModalVisible(true);
    setIntelLoading(true);
    setIntelData(null);

    try {
      const data = await ingredientService.getIngredientIntelligence(ingredientName);
      setIntelData(data);
    } catch (err) {
      console.warn('[ExploreScreen] getIngredientIntelligence error:', err.message);
    } finally {
      setIntelLoading(false);
    }
  };

  // Barcode Lookup handler
  const handleBarcodeLookup = async () => {
    if (!barcodeInput.trim()) return;
    setBarcodeLoading(true);
    setBarcodeError('');
    setBarcodeResult(null);

    try {
      const res = await productService.getProductByBarcode(barcodeInput.trim());
      if (res) {
        setBarcodeResult(res);
      } else {
        setBarcodeError(`No cosmetic product found for barcode ${barcodeInput.trim()}. You can submit it for verification!`);
      }
    } catch {
      setBarcodeError('Failed to connect to skincare database. Please check your network.');
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Formula Analysis handler
  const handleAnalyzeFormula = async () => {
    if (!formulaInput.trim()) return;
    setAnalyzerLoading(true);
    try {
      const result = await ingredientService.analyzeIngredients(formulaInput);
      setAnalysisResult(result);
    } catch (err) {
      console.warn('[ExploreScreen] Formula analysis failed:', err.message);
    } finally {
      setAnalyzerLoading(false);
    }
  };

  // Product Submission handler
  const handleSubmitProduct = async () => {
    if (!subBarcode.trim() || !subName.trim() || !subBrand.trim()) {
      Alert.alert('Incomplete Form', 'Barcode, Product Name, and Brand are mandatory.');
      return;
    }
    setSubLoading(true);
    try {
      const res = await productService.submitProduct({
        barcode: subBarcode.trim(),
        productName: subName.trim(),
        brand: subBrand.trim(),
        category: subCategory,
        priceInr: subPrice ? parseFloat(subPrice) : null,
        ingredientsText: subIngredients.trim(),
      });
      Alert.alert('Submission Received', res.message || 'Product submitted for dermatological label verification.');
      setSubmitModalVisible(false);
      setSubBarcode('');
      setSubName('');
      setSubBrand('');
      setSubPrice('');
      setSubIngredients('');
    } catch (err) {
      Alert.alert('Submission Error', err.message || 'Could not submit product.');
    } finally {
      setSubLoading(false);
    }
  };

  // Compatibility Checker Handlers
  const handleCheckCompatibility = async () => {
    if (!compatActives || compatActives.length < 2) {
      Alert.alert('Selection Required', 'Please select at least 2 active ingredients to check compatibility.');
      return;
    }
    setCompatLoading(true);
    setCompatResult(null);
    try {
      const res = await ingredientService.checkCompatibility(compatActives);
      setCompatResult(res);
    } catch (err) {
      Alert.alert('Compatibility Check Failed', err.message || 'Could not verify combinations.');
    } finally {
      setCompatLoading(false);
    }
  };

  const toggleCompatActive = (activeName) => {
    if (compatActives.includes(activeName)) {
      if (compatActives.length > 2) {
        setCompatActives((prev) => prev.filter((a) => a !== activeName));
      } else {
        Alert.alert('Minimum Actives', 'Keep at least 2 actives to evaluate compatibility.');
      }
    } else {
      if (compatActives.length >= 4) {
        Alert.alert('Maximum Limit', 'You can evaluate up to 4 actives simultaneously.');
      } else {
        setCompatActives((prev) => [...prev, activeName]);
      }
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return apiProducts.filter((item) => {
      const itemId = item.id || item._id;
      if (onlySaved && !savedProductIds.includes(itemId)) return false;
      return true;
    });
  }, [apiProducts, onlySaved, savedProductIds]);

  // Filtered Ingredients
  const filteredIngredients = useMemo(() => {
    return apiIngredients.filter((item) => {
      const itemId = item.id || item._id || item.normalizedName;
      if (onlySaved && !savedIngredientIds.includes(itemId)) return false;
      return true;
    });
  }, [apiIngredients, onlySaved, savedIngredientIds]);

  // Filtered Remedies
  const filteredRemedies = useMemo(() => {
    return apiRemedies.filter((item) => {
      const id = item._id || item.id;
      if (onlySaved && !savedRemedyIds.includes(id)) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.concern?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [apiRemedies, onlySaved, savedRemedyIds, searchQuery]);

  // Filtered Concerns
  const filteredConcerns = useMemo(() => {
    return SKIN_CONCERNS.filter((item) => {
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const totalResults =
    (activeCategory === 'All' || activeCategory === 'Products' ? filteredProducts.length : 0) +
    (activeCategory === 'All' || activeCategory === 'Ingredients' ? filteredIngredients.length : 0) +
    (activeCategory === 'All' || activeCategory === 'Home Remedies' ? filteredRemedies.length : 0) +
    (activeCategory === 'All' || activeCategory === 'Skin Concerns' ? filteredConcerns.length : 0) +
    (activeCategory === 'All' || activeCategory === 'Routines' ? 2 : 0);

  return (
    <ScreenContainer padded={false} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenSubtitle}>EVIDENCE-INFORMED DISCOVERY</Text>
          <Text style={styles.screenTitle}>Explore</Text>
        </View>
      </View>

      {/* Action Pills Scroll */}
      <View style={styles.actionPillsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionPill, styles.actionPillActive]}
            onPress={() => router.push('/comparison')}
            accessibilityLabel="Compare Products"
          >
            <GitCompare size={13} color={COLORS.cream} />
            <Text style={[styles.actionPillText, { color: COLORS.cream }]}>Compare</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => {
              setCompatibilityModalVisible(true);
              handleCheckCompatibility();
            }}
            accessibilityLabel="Active Compatibility Checker"
          >
            <Shuffle size={13} color={COLORS.burgundy} />
            <Text style={styles.actionPillText}>Compatibility</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setBarcodeModalVisible(true)}
            accessibilityLabel="Barcode Scanner"
          >
            <Barcode size={13} color={COLORS.burgundy} />
            <Text style={styles.actionPillText}>Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setAnalyzerModalVisible(true)}
            accessibilityLabel="Analyze Ingredients"
          >
            <FlaskConical size={13} color={COLORS.burgundy} />
            <Text style={styles.actionPillText}>Analyze</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => setSubmitModalVisible(true)}
            accessibilityLabel="Submit Product"
          >
            <PlusCircle size={13} color={COLORS.burgundy} />
            <Text style={styles.actionPillText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search & Saved Filter Bar */}
      <View style={styles.searchBarRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search Minimalist, Derma Co, Niacinamide, Retinol..."
          />
        </View>
        <TouchableOpacity
          onPress={() => setOnlySaved((prev) => !prev)}
          style={[styles.savedFilterBtn, onlySaved && styles.savedFilterBtnActive]}
          accessibilityLabel="Filter saved items"
        >
          <Bookmark
            size={16}
            color={onlySaved ? COLORS.cream : COLORS.burgundy}
            fill={onlySaved ? COLORS.cream : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* INR Budget Filter Pills */}
      <View style={styles.budgetScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.budgetChips}>
          {BUDGET_TIERS.map((tier) => {
            const isSelected = selectedBudget === tier.id;
            return (
              <TouchableOpacity
                key={tier.id}
                onPress={() => setSelectedBudget(tier.id)}
                style={[styles.budgetChip, isSelected && styles.budgetChipActive]}
              >
                <Tag size={12} color={isSelected ? COLORS.cream : COLORS.burgundy} />
                <Text style={[styles.budgetChipText, isSelected && styles.budgetChipTextActive]}>
                  {tier.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Chips Scroll */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.chip,
                activeCategory === cat && styles.activeChip,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeCategory === cat }}
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === cat && styles.activeChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading banner */}
      {isLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={COLORS.burgundy} />
          <Text style={styles.loadingText}>Fetching real Indian skincare products & INCI data...</Text>
        </View>
      )}

      {/* Results content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentScroll}
      >
        {totalResults === 0 && !isLoading ? (
          <EmptyState
            title="No matches found"
            subtitle="Try adjusting your budget or search terms."
            actionLabel="Reset filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedBudget('all');
              setSelectedBrand('All Brands');
              setActiveCategory('All');
              setOnlySaved(false);
            }}
          />
        ) : (
          <>
            {/* Products Section */}
            {(activeCategory === 'All' || activeCategory === 'Products') &&
              filteredProducts.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={styles.groupTitle}>Indian Skincare Formulations</Text>
                      <Text style={styles.groupAttribution}>Verified INR pricing & Open Beauty Facts feeds</Text>
                    </View>
                    <Text style={styles.groupCount}>{filteredProducts.length} items</Text>
                  </View>
                  <View style={styles.productGrid}>
                    {filteredProducts.map((prod) => {
                      const id = prod.id || prod._id;
                      return (
                        <ProductCard
                          key={id}
                          product={{
                            ...prod,
                            keyIngredients: prod.ingredientList || prod.keyIngredients || [],
                          }}
                          isSaved={savedProductIds.includes(id)}
                          onToggleSave={() => toggleSavedProduct(id)}
                          style={{ width: '48%', marginBottom: SPACING.md }}
                          onPress={() => setSelectedProduct(prod)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

            {/* Ingredients Section */}
            {(activeCategory === 'All' || activeCategory === 'Ingredients') &&
              filteredIngredients.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={styles.groupTitle}>INCI Active Compounds</Text>
                      <Text style={styles.groupAttribution}>Integrated with PubChem chemical CID & PubMed studies</Text>
                    </View>
                    <Text style={styles.groupCount}>{filteredIngredients.length} items</Text>
                  </View>
                  {filteredIngredients.map((item, idx) => {
                    const id = item.id || item._id || item.normalizedName || `ing-${idx}`;
                    return (
                      <IngredientCard
                        key={id}
                        ingredient={{
                          ...item,
                          summary: item.description || item.summary || 'Bio-active cosmetic compound.',
                          benefits: item.functions || item.benefits || ['Skin Conditioning'],
                        }}
                        isSaved={savedIngredientIds.includes(id)}
                        onToggleSave={() => toggleSavedIngredient(id)}
                        onPress={() => handleOpenIntelligence(item.name)}
                      />
                    );
                  })}
                </View>
              )}

            {/* Home Remedies Section */}
            {(activeCategory === 'All' || activeCategory === 'Home Remedies') &&
              filteredRemedies.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <View>
                      <Text style={styles.groupTitle}>Evidence-Informed Home Care</Text>
                      <Text style={styles.groupAttribution}>Clinical dermatological evidence • Strictly non-harmful DIY</Text>
                    </View>
                    <Text style={styles.groupCount}>{filteredRemedies.length} protocols</Text>
                  </View>
                  {filteredRemedies.map((remedy) => {
                    const id = remedy._id || remedy.id;
                    return (
                      <RemedyCard
                        key={id}
                        remedy={{
                          ...remedy,
                          id,
                          type: remedy.category || remedy.type,
                          duration: remedy.preparationTime || remedy.duration || '15 mins',
                          caution: remedy.safetyContraindications?.[0] || remedy.caution,
                          ingredients: remedy.ingredients || [],
                        }}
                        isSaved={savedRemedyIds.includes(id)}
                        onToggleSave={() => handleToggleSaveRemedy(id)}
                        onPress={() => router.push({ pathname: '/remedy-detail', params: { id } })}
                      />
                    );
                  })}
                </View>
              )}

            {/* Skin Concerns Section */}
            {(activeCategory === 'All' || activeCategory === 'Skin Concerns') &&
              filteredConcerns.length > 0 && (
                <View style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>Skin Concern Directory</Text>
                    <Text style={styles.groupCount}>{filteredConcerns.length} types</Text>
                  </View>
                  <View style={styles.concernsGrid}>
                    {filteredConcerns.map((concern) => (
                      <SkinConcernCard
                        key={concern.id}
                        concern={concern}
                        onPress={() => {
                          setSearchQuery(concern.name);
                          setActiveCategory('Products');
                        }}
                        style={{ width: '31%', marginBottom: SPACING.sm }}
                      />
                    ))}
                  </View>
                </View>
              )}

            {/* Routines Section */}
            {(activeCategory === 'All' || activeCategory === 'Routines') && (
              <View style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>Clinical Protocols</Text>
                  <Text style={styles.groupCount}>2 protocols</Text>
                </View>
                <RoutineCard
                  title="Daily Morning Photoprotection"
                  type="morning"
                  steps={DEFAULT_MORNING_ROUTINE}
                  onViewDetails={() => {}}
                />
                <RoutineCard
                  title="Nocturnal Cellular Recovery"
                  type="evening"
                  steps={DEFAULT_EVENING_ROUTINE}
                  onViewDetails={() => {}}
                />
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PRODUCT DETAILS MODAL */}
      <Modal
        visible={Boolean(selectedProduct)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalSubtitle}>
                  {selectedProduct?.brand || 'COSMETIC SPECIFICATION'}
                </Text>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedProduct?.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedProduct(null)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {selectedProduct?.imageUrl ? (
                <Image
                  source={{ uri: selectedProduct.imageUrl }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />
              ) : null}

              {/* Price & Retailer Row in INR */}
              <View style={styles.priceRetailerRow}>
                <Text style={styles.priceLarge}>
                  {selectedProduct?.priceFormatted || (selectedProduct?.priceInr ? formatInr(selectedProduct.priceInr) : '₹—')}
                </Text>
                <View style={styles.retailerBadge}>
                  <Text style={styles.retailerText}>
                    {selectedProduct?.retailer || 'Indian Skincare Retailer'}
                  </Text>
                </View>
              </View>

              {/* Source & Completeness Badge */}
              <View style={styles.badgeRow}>
                <View style={styles.sourceBadge}>
                  <ShieldCheck size={12} color={COLORS.success} />
                  <Text style={styles.sourceBadgeText}>
                    Source: {selectedProduct?.source || 'Open Beauty Facts'}
                  </Text>
                </View>
                {selectedProduct?.lastPriceCheckedAt ? (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>
                      Checked: {formatIndianDate(selectedProduct.lastPriceCheckedAt)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Barcode */}
              {selectedProduct?.barcode && (
                <View style={styles.barcodeInfoRow}>
                  <Barcode size={14} color={COLORS.textSecondary} />
                  <Text style={styles.barcodeInfoText}>
                    Barcode / EAN: {selectedProduct.barcode} {selectedProduct.barcode.startsWith('890') ? '(GS1 India)' : ''}
                  </Text>
                </View>
              )}

              {/* Scientific Description */}
              <Text style={styles.sectionHeading}>FORMULATION DESCRIPTION</Text>
              <Text style={styles.detailDescription}>
                {selectedProduct?.description || 'Cosmetic formulation available in Indian market.'}
              </Text>

              {/* Ingredients List */}
              <Text style={styles.sectionHeading}>
                INCI INGREDIENTS ({selectedProduct?.ingredientList?.length || 0})
              </Text>
              <View style={styles.ingredientsWrap}>
                {selectedProduct?.ingredientList && selectedProduct.ingredientList.length > 0 ? (
                  selectedProduct.ingredientList.map((ing, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.ingredientTag}
                      onPress={() => {
                        setSelectedProduct(null);
                        handleOpenIntelligence(ing);
                      }}
                    >
                      <Text style={styles.ingredientTagText}>{ing}</Text>
                      <Atom size={10} color={COLORS.burgundy} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noIngredientsText}>
                    {selectedProduct?.ingredientsText || 'Composition not declared.'}
                  </Text>
                )}
              </View>

              {/* Disclaimer */}
              <View style={styles.disclaimerBox}>
                <Info size={14} color={COLORS.burgundy} style={{ marginTop: 2 }} />
                <Text style={styles.disclaimerText}>
                  Cosmetic product data sourced under Open Database License (ODbL). Information is for educational reference and does not constitute medical advice.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* INGREDIENT INTELLIGENCE MODAL (PubChem + PubMed) */}
      <Modal
        visible={intelModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIntelModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>MOLECULAR DERMATOLOGY INTELLIGENCE</Text>
                <Text style={styles.modalTitle}>{intelData?.name || selectedIntelName}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIntelModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            {intelLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.burgundy} />
                <Text style={{ marginTop: 12, ...TYPOGRAPHY.caption, color: COLORS.textMuted }}>
                  Querying PubChem chemical database & PubMed clinical index...
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* 1. Chemical Identity (PubChem) */}
                <View style={styles.intelCardSection}>
                  <View style={styles.intelSectionHeader}>
                    <Atom size={16} color={COLORS.burgundy} />
                    <Text style={styles.intelSectionTitle}>PUBCHEM CHEMICAL PROPERTIES</Text>
                  </View>

                  {intelData?.chemicalIdentity?.cid ? (
                    <View style={styles.pubChemGrid}>
                      <View style={styles.pubChemRow}>
                        <Text style={styles.pubChemLabel}>PubChem CID:</Text>
                        <Text style={styles.pubChemValue}>{intelData.chemicalIdentity.cid}</Text>
                      </View>
                      <View style={styles.pubChemRow}>
                        <Text style={styles.pubChemLabel}>Formula:</Text>
                        <Text style={styles.pubChemValue}>{intelData.chemicalIdentity.molecularFormula || 'N/A'}</Text>
                      </View>
                      <View style={styles.pubChemRow}>
                        <Text style={styles.pubChemLabel}>Molecular Weight:</Text>
                        <Text style={styles.pubChemValue}>
                          {intelData.chemicalIdentity.molecularWeight ? `${intelData.chemicalIdentity.molecularWeight} g/mol` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.pubChemRow}>
                        <Text style={styles.pubChemLabel}>IUPAC Name:</Text>
                        <Text style={[styles.pubChemValue, { fontSize: 11 }]}>
                          {intelData.chemicalIdentity.iupacName}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.intelNoticeText}>
                      No direct chemical compound CID identified on PubChem.
                    </Text>
                  )}
                </View>

                {/* 2. Clinical Evidence (PubMed) */}
                <View style={styles.intelCardSection}>
                  <View style={styles.intelSectionHeader}>
                    <BookOpen size={16} color={COLORS.burgundy} />
                    <Text style={styles.intelSectionTitle}>
                      PUBMED CLINICAL STUDIES ({intelData?.clinicalEvidence?.totalStudies || 0})
                    </Text>
                  </View>

                  {intelData?.clinicalEvidence?.studies?.length > 0 ? (
                    intelData.clinicalEvidence.studies.map((study, idx) => (
                      <View key={idx} style={styles.studyCard}>
                        <View style={styles.studyTierBadge}>
                          <Text style={styles.studyTierText}>{study.evidenceLevel}</Text>
                        </View>
                        <Text style={styles.studyTitle}>{study.title}</Text>
                        <Text style={styles.studyMeta}>
                          {study.authors} • {study.journal} ({study.pubDate})
                        </Text>
                        <Text style={styles.studyPmid}>PubMed ID: {study.pmid}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.intelNoticeText}>
                      No indexed clinical dermatology studies found on PubMed.
                    </Text>
                  )}
                </View>

                {/* Limitations & Disclaimer */}
                <View style={styles.disclaimerBox}>
                  <Info size={14} color={COLORS.burgundy} style={{ marginTop: 2 }} />
                  <Text style={styles.disclaimerText}>
                    Chemical properties (PubChem) and clinical trials (PubMed) reflect published scientific cohorts and do not guarantee personal topical tolerance or medical outcomes.
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* USER PRODUCT SUBMISSION MODAL */}
      <Modal
        visible={submitModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>CROWD-SOURCED VERIFICATION</Text>
                <Text style={styles.modalTitle}>Submit Indian Product</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSubmitModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.modalHelpText}>
                Help enrich the Bellezza India database. Submit unlisted Indian cosmetics for dermatological label verification.
              </Text>

              <Text style={styles.formLabel}>Barcode / EAN (Mandatory)</Text>
              <TextInput
                style={styles.formInput}
                value={subBarcode}
                onChangeText={setSubBarcode}
                placeholder="e.g. 8906128100018"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Product Name</Text>
              <TextInput
                style={styles.formInput}
                value={subName}
                onChangeText={setSubName}
                placeholder="e.g. Cica Soothing Barrier Gel"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.formLabel}>Brand</Text>
              <TextInput
                style={styles.formInput}
                value={subBrand}
                onChangeText={setSubBrand}
                placeholder="e.g. Dot & Key, Minimalist, Plum"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.formLabel}>Estimated Price in INR (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={subPrice}
                onChangeText={setSubPrice}
                placeholder="e.g. 499"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />

              <Text style={styles.formLabel}>Ingredients List (From Bottle Label)</Text>
              <TextInput
                style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                value={subIngredients}
                onChangeText={setSubIngredients}
                placeholder="e.g. Aqua, Glycerin, Niacinamide..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />

              <TouchableOpacity
                style={styles.submitActionBtn}
                onPress={handleSubmitProduct}
                disabled={subLoading}
              >
                {subLoading ? (
                  <ActivityIndicator size="small" color={COLORS.cream} />
                ) : (
                  <Text style={styles.submitActionBtnText}>Submit for Verification</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BARCODE SEARCH MODAL */}
      <Modal
        visible={barcodeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBarcodeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>REAL-TIME SCANNER</Text>
                <Text style={styles.modalTitle}>Lookup by Barcode</Text>
              </View>
              <TouchableOpacity
                onPress={() => setBarcodeModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelpText}>
              Enter or scan any Indian or international cosmetic barcode (e.g. 8906128100018 for Minimalist Niacinamide, or 42164104 for Nivea).
            </Text>

            <View style={styles.barcodeInputRow}>
              <TextInput
                style={styles.barcodeTextInput}
                value={barcodeInput}
                onChangeText={setBarcodeInput}
                placeholder="Enter 8-13 digit barcode..."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.searchBarcodeBtn}
                onPress={handleBarcodeLookup}
                disabled={barcodeLoading}
              >
                {barcodeLoading ? (
                  <ActivityIndicator size="small" color={COLORS.cream} />
                ) : (
                  <Search size={18} color={COLORS.cream} />
                )}
              </TouchableOpacity>
            </View>

            {barcodeError ? (
              <View style={styles.errorAlert}>
                <AlertTriangle size={16} color={COLORS.error} />
                <Text style={styles.errorAlertText}>{barcodeError}</Text>
              </View>
            ) : null}

            {barcodeResult && (
              <ScrollView style={styles.barcodeResultCard}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {barcodeResult.imageUrl ? (
                    <Image
                      source={{ uri: barcodeResult.imageUrl }}
                      style={{ width: 70, height: 70, borderRadius: RADIUS.md }}
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultBrand}>{barcodeResult.brand}</Text>
                    <Text style={styles.resultName}>{barcodeResult.name}</Text>
                    <Text style={styles.resultCategory}>
                      {barcodeResult.category} • {barcodeResult.priceFormatted || (barcodeResult.priceInr ? `₹${barcodeResult.priceInr}` : 'INR Price Unlisted')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewFullBtn}
                  onPress={() => {
                    setSelectedProduct(barcodeResult);
                    setBarcodeModalVisible(false);
                  }}
                >
                  <Text style={styles.viewFullBtnText}>View Full Profile & Actives</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* FORMULA ANALYZER MODAL */}
      <Modal
        visible={analyzerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAnalyzerModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>DERMATOLOGICAL ANALYSIS</Text>
                <Text style={styles.modalTitle}>Formula INCI Analyzer</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAnalyzerModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelpText}>
              Paste a full cosmetic ingredient list separated by commas to evaluate comedogenicity, irritants, and active compounds.
            </Text>

            <TextInput
              style={styles.formulaTextInput}
              value={formulaInput}
              onChangeText={setFormulaInput}
              multiline
              numberOfLines={4}
              placeholder="e.g. Aqua, Glycerin, Salicylic Acid, Fragrance, Ceramide..."
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleAnalyzeFormula}
              disabled={analyzerLoading}
            >
              {analyzerLoading ? (
                <ActivityIndicator size="small" color={COLORS.cream} />
              ) : (
                <>
                  <FlaskConical size={16} color={COLORS.cream} />
                  <Text style={styles.analyzeBtnText}>Analyze Scientific Profile</Text>
                </>
              )}
            </TouchableOpacity>

            {analysisResult && (
              <ScrollView style={{ maxHeight: 220, marginTop: SPACING.md }}>
                <View style={styles.safetyHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {analysisResult.overallSafety === 'low' ? (
                      <CheckCircle2 size={16} color={COLORS.success} />
                    ) : (
                      <AlertTriangle size={16} color={COLORS.warning} />
                    )}
                    <Text style={styles.safetyStatus}>
                      Safety Rating: {analysisResult.overallSafety.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.analysisCount}>
                    {analysisResult.totalIngredients} INCI items
                  </Text>
                </View>

                <Text style={styles.analysisSummaryText}>{analysisResult.summary}</Text>

                {analysisResult.potentialIrritants?.length > 0 && (
                  <View style={styles.analysisGroup}>
                    <Text style={styles.analysisGroupTitle}>POTENTIAL IRRITANTS / ALLERGENS:</Text>
                    {analysisResult.potentialIrritants.map((item, idx) => (
                      <Text key={idx} style={styles.analysisItemText}>
                        • {item.name} (Irritancy Score: {item.irritancy || 'Moderate'})
                      </Text>
                    ))}
                  </View>
                )}

                {analysisResult.potentialComedogens?.length > 0 && (
                  <View style={styles.analysisGroup}>
                    <Text style={styles.analysisGroupTitle}>PORE-CLOGGING COMEDOGENS:</Text>
                    {analysisResult.potentialComedogens.map((item, idx) => (
                      <Text key={idx} style={styles.analysisItemText}>
                        • {item.name} (Comedogenic Rating: {item.comedogenicity}/5)
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ACTIVE COMPATIBILITY CHECKER MODAL */}
      <Modal
        visible={compatibilityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompatibilityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>MOLECULAR INTERACTION ENGINE</Text>
                <Text style={styles.modalTitle}>Compatibility Checker</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCompatibilityModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={COLORS.burgundy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHelpText}>
              Select 2 to 4 active cosmetic ingredients to check formulation synergy, pH conflicts, and irritation hazards.
            </Text>

            {/* Quick Select Active Pills */}
            <View style={styles.compatPillsWrap}>
              {['Retinol', 'Vitamin C', 'Niacinamide', 'Salicylic Acid', 'Glycolic Acid', 'Hyaluronic Acid', 'Ceramides', 'Benzoyl Peroxide'].map((act) => {
                const isSelected = compatActives.includes(act);
                return (
                  <TouchableOpacity
                    key={act}
                    style={[styles.compatActiveChip, isSelected && styles.compatActiveChipActive]}
                    onPress={() => toggleCompatActive(act)}
                  >
                    {isSelected ? (
                      <Check size={12} color={COLORS.cream} style={{ marginRight: 3 }} />
                    ) : null}
                    <Text style={[styles.compatActiveChipText, isSelected && styles.compatActiveChipTextActive]}>
                      {act}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={handleCheckCompatibility}
              disabled={compatLoading}
            >
              {compatLoading ? (
                <ActivityIndicator size="small" color={COLORS.cream} />
              ) : (
                <>
                  <Shuffle size={16} color={COLORS.cream} />
                  <Text style={styles.analyzeBtnText}>Verify Active Compatibility</Text>
                </>
              )}
            </TouchableOpacity>

            {compatResult && (
              <ScrollView style={{ maxHeight: 240, marginTop: SPACING.md }}>
                <View style={styles.safetyHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {compatResult.overallStatus === 'compatible' ? (
                      <CheckCircle2 size={16} color={COLORS.success} />
                    ) : compatResult.overallStatus === 'caution' ? (
                      <AlertTriangle size={16} color={COLORS.warning} />
                    ) : (
                      <AlertTriangle size={16} color={COLORS.error} />
                    )}
                    <Text
                      style={[
                        styles.safetyStatus,
                        {
                          color:
                            compatResult.overallStatus === 'compatible'
                              ? COLORS.success
                              : compatResult.overallStatus === 'caution'
                              ? COLORS.warning
                              : COLORS.error,
                        },
                      ]}
                    >
                      STATUS: {compatResult.overallStatus?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.analysisCount}>
                    {compatResult.interactions?.length || 0} interaction pairs
                  </Text>
                </View>

                <Text style={styles.analysisSummaryText}>{compatResult.recommendation}</Text>

                {compatResult.interactions && compatResult.interactions.length > 0 ? (
                  compatResult.interactions.map((interaction, idx) => (
                    <View key={idx} style={styles.studyCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.studyTitle}>
                          {interaction.actives ? interaction.actives.join(' + ') : interaction.title || 'Active Pair'}
                        </Text>
                        <Text
                          style={[
                            styles.studyTierText,
                            {
                              color:
                                interaction.status === 'compatible'
                                  ? COLORS.success
                                  : interaction.status === 'caution'
                                  ? COLORS.warning
                                  : COLORS.error,
                            },
                          ]}
                        >
                          {interaction.status?.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.studyMeta}>
                        {interaction.explanation || interaction.mechanism || 'Monitor skin response.'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.intelNoticeText}>
                    No known antagonistic interactions detected.
                  </Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xs,
  },
  actionPillsWrap: {
    paddingVertical: 4,
    marginBottom: 2,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    marginBottom: 2,
  },
  screenTitle: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 26,
    color: COLORS.burgundy,
  },
  headerActions: {
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionPillActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  actionPillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    fontSize: 10,
    color: COLORS.burgundy,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
  },
  savedFilterBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedFilterBtnActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },

  /* Budget Chips */
  budgetScrollWrap: {
    paddingVertical: 4,
  },
  budgetChips: {
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  budgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetChipActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  budgetChipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  budgetChipTextActive: {
    color: COLORS.cream,
  },

  categoryScrollWrap: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    paddingBottom: SPACING.xs,
  },
  categoryChips: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  chipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.cream,
  },
  loadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.softCream,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.burgundy,
    fontSize: 11,
  },
  contentScroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  group: {
    marginBottom: SPACING.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  groupTitle: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
  },
  groupAttribution: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  groupCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(41, 35, 38, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 10,
  },
  modalTitle: {
    ...TYPOGRAPHY.displaySmall,
    color: COLORS.burgundy,
    fontSize: 20,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.warmWhite,
    marginBottom: SPACING.md,
  },
  priceRetailerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  priceLarge: {
    ...TYPOGRAPHY.headingLarge,
    fontSize: 22,
    color: COLORS.burgundy,
  },
  retailerBadge: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  retailerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  sourceBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  scoreBadge: {
    backgroundColor: COLORS.softCream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  scoreBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.burgundy,
  },
  barcodeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  barcodeInfoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  sectionHeading: {
    ...TYPOGRAPHY.overline,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: 4,
  },
  detailDescription: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  ingredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  ingredientTagText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  noIngredientsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.softCream,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 14,
  },

  /* Intel Modal Section */
  intelCardSection: {
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  intelSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  intelSectionTitle: {
    ...TYPOGRAPHY.overline,
    fontSize: 11,
    color: COLORS.burgundy,
  },
  pubChemGrid: {
    gap: 4,
  },
  pubChemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  pubChemLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  pubChemValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  intelNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  studyCard: {
    backgroundColor: COLORS.softCream,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 6,
  },
  studyTierBadge: {
    backgroundColor: COLORS.burgundy,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  studyTierText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.cream,
    fontSize: 9,
    fontWeight: '700',
  },
  studyTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 11,
    lineHeight: 15,
  },
  studyMeta: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  studyPmid: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.dustyPink,
    marginTop: 2,
  },

  /* Form / Submit Product Modal */
  formLabel: {
    ...TYPOGRAPHY.overline,
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  formInput: {
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: SPACING.xs,
  },
  submitActionBtn: {
    backgroundColor: COLORS.burgundy,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submitActionBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 13,
  },

  /* Barcode & Analyzer */
  modalHelpText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  barcodeInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  barcodeTextInput: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  searchBarcodeBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDEDEC',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  errorAlertText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontSize: 11,
    flex: 1,
  },
  barcodeResultCard: {
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    maxHeight: 250,
  },
  resultBrand: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 9,
  },
  resultName: {
    ...TYPOGRAPHY.headingSmall,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  resultCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  viewFullBtn: {
    backgroundColor: COLORS.burgundy,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  viewFullBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.cream,
    fontWeight: '600',
  },
  formulaTextInput: {
    height: 90,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.warmWhite,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: SPACING.sm,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.burgundy,
    height: 42,
    borderRadius: RADIUS.md,
  },
  analyzeBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.cream,
    fontSize: 13,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.softCream,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  safetyStatus: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontSize: 11,
  },
  analysisCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  analysisSummaryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontSize: 11,
    lineHeight: 16,
    marginVertical: 4,
  },
  analysisGroup: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  analysisGroupTitle: {
    ...TYPOGRAPHY.overline,
    color: COLORS.dustyPink,
    fontSize: 9,
    marginBottom: 2,
  },
  analysisItemText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  compatPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  compatActiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.softCream,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compatActiveChipActive: {
    backgroundColor: COLORS.burgundy,
    borderColor: COLORS.burgundy,
  },
  compatActiveChipText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  compatActiveChipTextActive: {
    color: COLORS.cream,
    fontWeight: '600',
  },
});
