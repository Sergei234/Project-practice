import { useEffect, useState, useCallback } from 'react';
import type { Language, Product, Profile, ScreenName } from './types/marketplace';
import { t } from './i18n/translations';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { PREVIEW_ONLY_PRODUCTS, SEED_PRODUCTS, DEFAULT_AVATAR } from './lib/seedData';
import { BottomNav } from './components/BottomNav';
import { HomeFeedScreen } from './components/HomeFeedScreen';
import { ItemDetailScreen } from './components/ItemDetailScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SellItemScreen } from './components/SellItemScreen';
import { MeetupModal } from './components/MeetupModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [screen, setScreen] = useState<ScreenName>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [meetupOpen, setMeetupOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 2800);
  }, []);

  const navigate = useCallback((next: ScreenName) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProducts(PREVIEW_ONLY_PRODUCTS);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showToast(error.message);
        setLoadingProducts(false);
        return;
      }

      if (!data || data.length === 0) {
        const { data: seeded, error: seedError } = await supabase
          .from('products')
          .insert(SEED_PRODUCTS)
          .select();

        if (!seedError && seeded) {
          setProducts(seeded as Product[]);
        } else {
          setProducts([]);
        }
      } else {
        setProducts(data as Product[]);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  const loadUserContext = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setProfile(null);
      setSavedIds(new Set());
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setProfile(null);
      setSavedIds(new Set());
      return;
    }

    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profData) {
      setProfile(profData as Profile);
    } else {
      const meta = user.user_metadata || {};
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email || '',
        nickname: meta.nickname || user.email?.split('@')[0] || 'Student',
        university: meta.university || 'KNU',
        major: `${meta.university || 'KNU'} Student`,
        manner_temp: 98.5,
        is_verified: true,
        avatar_url: DEFAULT_AVATAR,
      };
      await supabase.from('profiles').upsert(fallbackProfile);
      setProfile(fallbackProfile);
    }

    const { data: savedRows } = await supabase
      .from('saved_items')
      .select('product_id')
      .eq('user_id', user.id);

    if (savedRows) {
      setSavedIds(new Set(savedRows.map((r: { product_id: string }) => r.product_id)));
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    void loadUserContext();

    if (!isSupabaseConfigured || !supabase) return;

    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void loadUserContext();
    });

    return () => {
      authSub.subscription.unsubscribe();
    };
  }, [fetchProducts, loadUserContext]);

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    navigate('detail');

    if (isSupabaseConfigured && supabase && !product.id.startsWith('preview-')) {
      const nextViews = (product.views_count || 0) + 1;
      await supabase
        .from('products')
        .update({ views_count: nextViews })
        .eq('id', product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, views_count: nextViews } : p))
      );
    }
  };

  const handleToggleSave = async (productId: string) => {
    const copy = t(lang);
    if (!isSupabaseConfigured || !supabase) {
      showToast(copy.supabaseRequiredDesc);
      setSetupOpen(true);
      return;
    }

    if (!profile) {
      showToast(copy.signInRequiredAction);
      navigate('register');
      return;
    }

    const currentlySaved = savedIds.has(productId);
    const targetProduct = products.find((p) => p.id === productId);
    const nextLikes = Math.max(
      0,
      (targetProduct?.likes_count || 0) + (currentlySaved ? -1 : 1)
    );

    if (currentlySaved) {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', profile.id)
        .eq('product_id', productId);

      if (error) {
        showToast(error.message);
        return;
      }

      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    } else {
      const { error } = await supabase.from('saved_items').insert({
        user_id: profile.id,
        product_id: productId,
      });

      if (error) {
        showToast(error.message);
        return;
      }

      setSavedIds((prev) => new Set(prev).add(productId));
    }

    await supabase
      .from('products')
      .update({ likes_count: nextLikes })
      .eq('id', productId);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, likes_count: nextLikes } : p))
    );
  };

  const handleBumpProduct = async (productId: string) => {
    if (!supabase) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('products')
      .update({ created_at: now })
      .eq('id', productId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchProducts();
  };

  const handleUpdateProduct = async (
    productId: string,
    updates: Partial<Pick<Product, 'title' | 'price' | 'status' | 'meetup_spot'>>
  ) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      showToast(error.message);
      return;
    }
    await fetchProducts();
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
    setSavedIds(new Set());
    showToast(lang === 'ru' ? 'Вы вышли из аккаунта' : 'Signed out');
  };

  const showBottomNav = screen === 'home' || screen === 'profile';

  const activeDetailProduct =
    selectedProduct
      ? products.find((p) => p.id === selectedProduct.id) || selectedProduct
      : null;

  return (
    <div className="min-h-screen bg-slate-200/70 flex justify-center">
      {/* Mobile-First Centered Frame (max-w 430px on desktop, full width on mobile) */}
      <main className="w-full max-w-[430px] min-h-screen bg-[#F8FAFC] relative shadow-2xl shadow-slate-900/10 border-x border-slate-200/80">
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[390px] rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl text-center">
            {toast}
          </div>
        )}

        {screen === 'home' && (
          <HomeFeedScreen
            lang={lang}
            onChangeLang={setLang}
            products={products}
            loading={loadingProducts}
            profile={profile}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectProduct={handleSelectProduct}
            onOpenProfile={() => navigate('profile')}
            onOpenRegister={() => navigate('register')}
            onOpenSetupModal={() => setSetupOpen(true)}
            isSupabaseConfigured={isSupabaseConfigured}
          />
        )}

        {screen === 'detail' && activeDetailProduct && (
          <ItemDetailScreen
            lang={lang}
            onChangeLang={setLang}
            product={activeDetailProduct}
            profile={profile}
            isSaved={savedIds.has(activeDetailProduct.id)}
            onToggleSave={handleToggleSave}
            onBack={() => navigate('home')}
            onOpenMeetup={() => setMeetupOpen(true)}
            onOpenProfile={() => navigate('profile')}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            lang={lang}
            onChangeLang={setLang}
            onBack={() => navigate('home')}
            onSuccessAuth={async () => {
              await loadUserContext();
              navigate('profile');
            }}
            onOpenSetupModal={() => setSetupOpen(true)}
          />
        )}

        {screen === 'profile' && (
          <ProfileScreen
            lang={lang}
            onChangeLang={setLang}
            profile={profile}
            products={products}
            savedIds={savedIds}
            onSelectProduct={handleSelectProduct}
            onOpenRegister={() => navigate('register')}
            onOpenSell={() => navigate('sell')}
            onOpenSetupModal={() => setSetupOpen(true)}
            onSignOut={handleSignOut}
            onBumpProduct={handleBumpProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {screen === 'sell' && (
          <SellItemScreen
            lang={lang}
            onChangeLang={setLang}
            profile={profile}
            onBack={() => navigate('home')}
            onRequireAuth={() => {
              showToast(t(lang).signInRequiredAction);
              navigate('register');
            }}
            onPublished={async () => {
              await fetchProducts();
              showToast(
                lang === 'ru'
                  ? 'Объявление опубликовано!'
                  : 'Listing published to Campus Feed!'
              );
              navigate('home');
            }}
          />
        )}

        {showBottomNav && (
          <BottomNav
            lang={lang}
            activeScreen={screen}
            onNavigate={(target) => {
              if (target === 'sell' && !profile && isSupabaseConfigured) {
                showToast(t(lang).signInRequiredAction);
                navigate('register');
                return;
              }
              navigate(target);
            }}
            isVerified={Boolean(profile?.is_verified)}
          />
        )}

        <MeetupModal
          open={meetupOpen}
          onClose={() => setMeetupOpen(false)}
          product={activeDetailProduct}
          profile={profile}
          lang={lang}
          onRequireAuth={() => {
            showToast(t(lang).signInRequiredAction);
            navigate('register');
          }}
        />

        <SupabaseSetupModal
          open={setupOpen}
          onClose={() => setSetupOpen(false)}
          lang={lang}
        />
      </main>
    </div>
  );
}
