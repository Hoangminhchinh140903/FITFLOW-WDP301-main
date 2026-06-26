import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Header from '../../components/common/Header';
import FilterSidebar from '../../components/catalog/common/FilterSidebar';
import ProductGrid from '../../components/catalog/common/ProductGrid';
import QuickViewModal from '../../components/catalog/common/QuickViewModal';
import RentHero from '../../components/catalog/rent/RentHero';
import OutfitCarousel from '../../components/catalog/rent/OutfitCarousel';
import StickyRentCTA from '../../components/catalog/rent/StickyRentCTA';
import SortDropdown from '../../components/catalog/shop/SortDropdown';
import Pagination from '../../components/catalog/shop/Pagination';
import BookingModal from '../../components/booking/BookingModal';
import {
  buildSidebarTree,
  collectVariantOptions,
  flattenCategories,
  mapRentDisplayName,
  normalizeText,
  resolveCategoryValueFromKeyword,
} from './catalogHelpers';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../hooks/useAuth';
import { getRouteByRole, isDashboardRole } from '../../utils/auth';
import { API_BASE_URL } from '../../config/env';

const DEFAULT_FILTERS = { occasion: '', category: '', color: '', size: '', price: '' };
const RENT_PAGE_SIZE = 12;
/** Khớp BE `getProducts`: limit tối đa 50 mỗi request — cần gọi nhiều trang để lấy đủ tổng SP. */
const PUBLIC_PRODUCT_API_LIMIT = 50;

const OCCASION_KEYWORDS = {
  tournament: ['giai dau', 'tournament', 'thi dau', 'cup', 'chuyen nghiep'],
  training: ['tap luyen', 'training', 'hoc', 'co ban', 'phong trao'],
  friendly: ['giao huu', 'friendly', 'giai tri', 'choi vui'],
};

const priceInRange = (price, range) => {
  if (!range) return true;
  if (range === 'low') return price < 300000;
  if (range === 'mid') return price >= 300000 && price <= 700000;
  if (range === 'high') return price > 700000;
  return true;
};

const rentStockScore = (product = {}) => {
  const rentable = Number(product?.rentableQuantity ?? 0);
  if (Number.isFinite(rentable) && rentable > 0) return rentable;
  return Number(product?.availableQuantity ?? 0);
};

const hasRentStock = (product) => rentStockScore(product) > 0;

const getLikeCount = (product = {}) => {
  const directValue = Number(
    product?.likeCount ??
      product?.likes ??
      product?.favoriteCount ??
      product?.wishlistCount ??
      product?.totalLikes
  );
  if (Number.isFinite(directValue) && directValue >= 0) return directValue;
  if (Array.isArray(product?.likedBy)) return product.likedBy.length;
  if (Array.isArray(product?.favorites)) return product.favorites.length;
  return 0;
};

const toApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const buildOccasionText = (product = {}) => {
  const tags = Array.isArray(product?.tags) ? product.tags.join(' ') : '';
  return normalizeText(
    [product?.name, product?.description, product?.category, product?.occasion, tags].filter(Boolean).join(' ')
  );
};

const isDateAvailable = (product, startDate, endDate) => {
  if (!startDate || !endDate) return true;

  if (typeof product?.isAvailable === 'boolean') return product.isAvailable;
  if (typeof product?.availabilityStatus === 'string') {
    return !['unavailable', 'booked', 'rented'].includes(product.availabilityStatus.toLowerCase());
  }
  return true;
};

export default function RentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isFavorite, isFavoriteLoading, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const isStaffOrOwner = isDashboardRole(user?.role);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('top_liked');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedBookingProduct, setSelectedBookingProduct] = useState(null);
  const [toast, setToast] = useState('');

  const searchKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('q') || '').trim();
  }, [location.search]);

  const categoryKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('category') || '').trim();
  }, [location.search]);

  const openBookingParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('openBooking') === '1';
  }, [location.search]);

  const sortParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = String(params.get('sort') || '').trim().toLowerCase();
    const allowed = new Set(['top_liked', 'newest', 'price_asc', 'price_desc', 'name_asc']);
    return allowed.has(value) ? value : '';
  }, [location.search]);

  const categoryTree = useMemo(() => buildSidebarTree(categories), [categories]);
  const flatCategories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const response = await fetch(toApiUrl('/categories?lang=vi&purpose=rent'));
        const payload = response.ok ? await response.json() : { categories: [] };
        if (!mounted) return;
        setCategories(Array.isArray(payload?.categories) ? payload.categories : []);
      } catch {
        if (mounted) setCategories([]);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (flatCategories.length === 0) return;
    if (!categoryKeyword) {
      setFilters((prev) => (prev.category ? { ...prev, category: '' } : prev));
      return;
    }
    const resolved = resolveCategoryValueFromKeyword({
      keyword: categoryKeyword,
      nodes: flatCategories,
      mode: 'rent',
    });
    if (resolved) {
      setFilters((prev) => ({ ...prev, category: resolved }));
    }
  }, [categoryKeyword, flatCategories]);

  useEffect(() => {
    if (openBookingParam) {
      setIsBookingOpen(true);
    }
  }, [openBookingParam]);

  useEffect(() => {
    if (sortParam) {
      setSortBy(sortParam);
    } else {
      setSortBy('top_liked');
    }
  }, [sortParam]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        const merged = [];
        let pageNum = 1;
        let totalPages = 1;

        const paramsForPage = (p) => {
          const params = new URLSearchParams({
            purpose: 'rent',
            lang: 'vi',
            limit: String(PUBLIC_PRODUCT_API_LIMIT),
            page: String(p),
          });
          if (searchKeyword) params.set('search', searchKeyword);
          if (filters.category) params.set('category', filters.category);
          if (startDate) params.set('startDate', startDate);
          if (endDate) params.set('endDate', endDate);
          return params;
        };

        while (mounted && pageNum <= totalPages) {
          const response = await fetch(toApiUrl(`/products?${paramsForPage(pageNum).toString()}`));
          const payload = response.ok ? await response.json() : { data: [], pagination: {} };
          if (!mounted) return;
          const batch = Array.isArray(payload?.data) ? payload.data : [];
          merged.push(...batch);
          totalPages = Math.max(1, Number(payload?.pagination?.totalPages ?? 1));
          pageNum += 1;
          // An toàn: tránh vòng lặp vô hạn nếu API lệch meta
          if (pageNum > 500) break;
        }

        if (mounted) setProducts(merged);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [searchKeyword, filters.category, startDate, endDate]);

  const { sizes, colors } = useMemo(() => collectVariantOptions(products), [products]);

  const filteredProducts = useMemo(() => {
    const keyword = normalizeText(searchKeyword);
    const list = products.filter((product) => {
      const bySearch = keyword
        ? normalizeText(`${product?.name || ''} ${product?.description || ''}`).includes(keyword)
        : true;
      const bySize = filters.size
        ? normalizeText(
            `${product?.size || ''} ${Array.isArray(product?.sizeOptions) ? product.sizeOptions.join(' ') : ''} ${
              Array.isArray(product?.sizes)
                ? product.sizes.map((row) => (typeof row === 'object' ? row?.size : row)).join(' ')
                : ''
            } ${
              Array.isArray(product?.colorVariants)
                ? product.colorVariants.map((variant) => variant?.size || '').join(' ')
                : ''
            }`
          ).includes(normalizeText(filters.size))
        : true;
      const byColor = filters.color
        ? normalizeText(
            `${product?.color || ''} ${
              Array.isArray(product?.colorVariants)
                ? product.colorVariants.map((variant) => variant?.name || variant?.color || '').join(' ')
                : ''
            }`
          ).includes(normalizeText(filters.color))
        : true;
      const byOccasion = filters.occasion
        ? OCCASION_KEYWORDS[filters.occasion]?.some((token) => buildOccasionText(product).includes(token))
        : true;
      const byPrice = priceInRange(Number(product?.baseRentPrice || product?.baseSalePrice || 0), filters.price);
      const byDate = isDateAvailable(product, startDate, endDate);

      return bySearch && bySize && byColor && byOccasion && byPrice && byDate;
    });

    list.sort((a, b) => {
      const aOk = hasRentStock(a);
      const bOk = hasRentStock(b);
      if (aOk !== bOk) return aOk ? -1 : 1;

      const stockDiff = rentStockScore(b) - rentStockScore(a);
      if (stockDiff !== 0) return stockDiff;

      const likeDiff = getLikeCount(b) - getLikeCount(a);
      if (likeDiff !== 0) return likeDiff;

      if (sortBy === 'price_asc') {
        return Number(a.baseRentPrice || 0) - Number(b.baseRentPrice || 0);
      }
      if (sortBy === 'price_desc') {
        return Number(b.baseRentPrice || 0) - Number(a.baseRentPrice || 0);
      }
      if (sortBy === 'name_asc') {
        return String(a.name || '').localeCompare(String(b.name || ''), 'vi');
      }
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });

    return list;
  }, [products, filters, sortBy, searchKeyword, startDate, endDate]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / RENT_PAGE_SIZE)),
    [filteredProducts.length]
  );

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, filters, sortBy, startDate, endDate]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * RENT_PAGE_SIZE;
    return filteredProducts.slice(start, start + RENT_PAGE_SIZE);
  }, [filteredProducts, page]);

  const favoriteIds = useMemo(() => {
    const ids = new Set();
    filteredProducts.forEach((product) => {
      if (isFavorite(product._id)) ids.add(product._id);
    });
    return ids;
  }, [filteredProducts, isFavorite]);

  const favoriteLoadingIds = useMemo(() => {
    const ids = new Set();
    filteredProducts.forEach((product) => {
      if (isFavoriteLoading(product._id)) ids.add(product._id);
    });
    return ids;
  }, [filteredProducts, isFavoriteLoading]);

  const outfitSuggestions = useMemo(() => {
    return filteredProducts.slice(0, 8).map((product, index) => ({
      id: `${product._id}-outfit-${index}`,
      name: `Set ${mapRentDisplayName(product.name || 'Đồ thể thao')} gợi ý`,
      imageUrl: product.imageUrl,
      totalPrice: Math.round(Number(product.baseRentPrice || product.baseSalePrice || 0) * 1.8),
      productId: product._id,
    }));
  }, [filteredProducts]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const handleToggleFavorite = async (product) => {
    const result = await toggleFavorite(product);
    if (!result.ok && result.reason === 'AUTH_REQUIRED') {
      showToast('Vui lòng đăng nhập để sử dụng chức năng yêu thích');
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!result.ok && result.reason === 'PENDING') return;
    if (!result.ok) {
      showToast(result.message || 'Không thể cập nhật yêu thích.');
      return;
    }
    showToast(result.added ? 'Đã thêm vào yêu thích.' : 'Đã xóa khỏi yêu thích.');
  };

  const handleRentNow = (product) => {
    if (isStaffOrOwner) {
      showToast('Tài khoản owner/staff không thể thuê hàng ở trang khách.');
      navigate(getRouteByRole(user?.role));
      return;
    }
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    navigate(`/products/${product._id}${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleBookFitting = (product = null) => {
    setSelectedBookingProduct(product || null);
    setIsBookingOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingOpen(false);
    setSelectedBookingProduct(null);
    const params = new URLSearchParams(location.search);
    if (params.has('openBooking')) {
      params.delete('openBooking');
      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'category') {
      const params = new URLSearchParams(location.search);
      if (!params.get('purpose')) params.set('purpose', 'rent');
      const normalized = String(value || '').trim();
      if (normalized) params.set('category', normalized);
      else params.delete('category');
      navigate(
        { pathname: '/buy', search: params.toString() ? `?${params.toString()}` : '' },
        { replace: true }
      );
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    const params = new URLSearchParams(location.search);
    params.set('purpose', 'rent');
    params.delete('category');
    navigate(
      { pathname: '/buy', search: params.toString() ? `?${params.toString()}` : '' },
      { replace: true }
    );
  };

  const selectedCategoryLabel =
    flatCategories.find((item) => item.value === filters.category)?.displayName || 'Tất cả sản phẩm';

  return (
    <div className="min-h-screen bg-[#f6f7ef] pb-20 text-[#10150f]">
      <Header active="rent" />

      <main className="mx-auto w-full max-w-[1280px] space-y-6 px-4 py-5 md:px-6 lg:px-8">
        <RentHero
          startDate={startDate}
          endDate={endDate}
          onChangeStartDate={setStartDate}
          onChangeEndDate={setEndDate}
        />

        <OutfitCarousel outfits={outfitSuggestions} onSelectOutfit={(outfit) => navigate(`/products/${outfit.productId}`)} />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#10150f]">Sản phẩm nổi bật cho thuê</h2>
            <p className="mt-1 text-sm text-[#596255] font-semibold">
              Danh mục: {mapRentDisplayName(selectedCategoryLabel)}
              <span className="text-slate-400"> · </span>
              <span className="font-bold text-[#10150f]">
                {loading ? 'Đang tải…' : `${filteredProducts.length} sản phẩm`}
              </span>
              {searchKeyword ? (
                <span className="text-[#8d9788]">{` (tìm “${searchKeyword}”)`}</span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {filters.category ? (
              <button
                type="button"
                onClick={() => handleFilterChange('category', '')}
                className="rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#10150f] transition hover:bg-[#ebe7dc]"
              >
                Xem tất cả sản phẩm
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#10150f] lg:hidden"
            >
              <SlidersHorizontal size={14} />
              Bộ lọc
            </button>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <FilterSidebar
            mode="rent"
            categories={flatCategories.map((item) => ({ ...item, displayName: mapRentDisplayName(item.displayName) }))}
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            sizeOptions={sizes}
            colorOptions={colors}
            className="hidden lg:block"
          />

          <div className="space-y-5">
            <ProductGrid
              mode="rent"
              products={paginatedProducts}
              loading={loading}
              favoriteIds={favoriteIds}
              favoriteLoadingIds={favoriteLoadingIds}
              onToggleFavorite={handleToggleFavorite}
              onQuickView={setQuickViewProduct}
              onPrimaryAction={handleRentNow}
              onSecondaryAction={handleBookFitting}
              emptyText="Không có sản phẩm phù hợp với bộ lọc thuê."
            />

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

          </div>
        </section>
      </main>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] p-4 lg:hidden" onClick={() => setIsMobileFilterOpen(false)}>
          <div
            className="mx-auto max-w-md rounded-[28px] bg-[#fffaf0] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-[rgba(16,21,15,0.08)] pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Bộ lọc thuê đồ</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(16,21,15,0.12)] bg-[#fffaf0] text-[#10150f] hover:bg-[#ebe7dc] transition"
              >
                <X size={14} />
              </button>
            </div>
            <FilterSidebar
              mode="rent"
              categories={flatCategories.map((item) => ({ ...item, displayName: mapRentDisplayName(item.displayName) }))}
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              sizeOptions={sizes}
              colorOptions={colors}
            />
          </div>
        </div>
      )}

      <QuickViewModal
        mode="rent"
        open={Boolean(quickViewProduct)}
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onPrimaryAction={(product) => {
          setQuickViewProduct(null);
          handleRentNow(product);
        }}
      />

      <StickyRentCTA count={filteredProducts.length} onClick={handleBookFitting} />

      <BookingModal
        open={isBookingOpen}
        onClose={closeBookingModal}
        selectedProduct={selectedBookingProduct}
        onSuccess={() => {
          showToast('Đặt lịch thuê vợt thành công.');
        }}
      />

      {toast && (
        <div className="fixed right-4 top-24 z-[80] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
