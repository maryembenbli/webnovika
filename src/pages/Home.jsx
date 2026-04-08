import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoriesAPI } from '../api/categories.api';
import { ProductsAPI } from '../api/products.api';
import { AppShell } from '../components/AppShell';
import { useLocale } from '../context/locale.context';
import { formatCurrency, imgUrl, normalize } from '../utils/format';

const heroPhrases = [
  'Collection mise en avant pour attirer le client des la premiere visite.',
  'Des produits choisis pour une presentation plus elegante et plus commerciale.',
  'Commande simple, visuel fort et categories faciles a explorer.',
  'Une vitrine moderne qui met vos meilleures offres au premier plan.',
];

const trustItems = [
  {
    title: 'Livraison rapide',
    text: 'Expedition rapide et suivi simple de la commande.',
    icon: '?',
  },
  {
    title: 'Paiement a la livraison',
    text: 'Le client commande facilement avec un parcours rassurant.',
    icon: '¤',
  },
  {
    title: 'Produits verifies',
    text: 'Une selection claire pour donner confiance des le premier ecran.',
    icon: '?',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [productData, categoryData] = await Promise.all([ProductsAPI.list(), CategoriesAPI.list()]);
        if (!mounted) return;
        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData.filter((item) => item?.isActive !== false) : []);
      } catch (requestError) {
        console.error(requestError);
        if (mounted) setError(t('homeError'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  const filtered = useMemo(() => {
    const needle = normalize(query);

    return products.filter((product) => {
      const title = normalize(product.title || product.name);
      const brand = normalize(product.brand);
      const matchesSearch = !needle || title.includes(needle) || brand.includes(needle);

      const productCategories = Array.isArray(product.categories)
        ? product.categories.map((item) => normalize(item?.name || item?.slug || item))
        : [];

      const matchesCategory = activeCategory === 'all' || productCategories.includes(normalize(activeCategory));
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, products, query]);

  const heroCategories = useMemo(() => {
    const withImages = categories.filter((category) => category?.image);
    return (withImages.length ? withImages : categories).slice(0, 5);
  }, [categories]);

  useEffect(() => {
    if (!heroCategories.length) return undefined;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroCategories.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroCategories]);

  useEffect(() => {
    if (activeSlide >= heroCategories.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, heroCategories]);

  const activeHeroCategory = heroCategories[activeSlide] || null;
  const activeHeroName = String(activeHeroCategory?.name || activeHeroCategory?.slug || t('all'));
  const activeHeroDescription =
    activeHeroCategory?.description?.trim() || heroPhrases[activeSlide % heroPhrases.length];

  const topCategories = useMemo(() => categories.slice(0, 8), [categories]);

  return (
    <AppShell searchValue={query} onSearchChange={setQuery}>
      <section className='hero heroShowcase'>
        <div className='heroInner heroShowcaseInner'>
          <div className='heroVisualCard'>
            {activeHeroCategory?.image ? (
              <img
                src={imgUrl(activeHeroCategory.image)}
                alt={activeHeroName}
                className='heroVisualImage'
                loading='eager'
              />
            ) : null}
            <div className='heroVisualOverlay' />
            <div className='heroVisualContent'>
              <span className='heroCategoryPill'>{activeHeroName}</span>
              <h1 className='heroTitle heroMainTitle'>{activeHeroName}</h1>
              <p className='heroMainText'>{activeHeroDescription}</p>
              <button
                className='primaryBtn heroPrimaryCta'
                type='button'
                onClick={() => setActiveCategory(activeHeroName)}
              >
                Decouvrir la collection
              </button>
            </div>
          </div>

          <div className='heroSlideRail'>
            {heroCategories.map((category, index) => {
              const name = String(category.name || category.slug || '');
              return (
                <button
                  key={String(category._id || category.id || name)}
                  type='button'
                  className={`heroSlideThumb ${index === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                >
                  <div className='heroSlideThumbMedia'>
                    {category.image ? (
                      <img src={imgUrl(category.image)} alt={name} loading='lazy' />
                    ) : (
                      <div className='heroSlideFallback'>{name}</div>
                    )}
                  </div>
                  <div className='heroSlideThumbText'>
                    <strong>{name}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className='container trustStripWrap'>
        <div className='trustStrip'>
          {trustItems.map((item) => (
            <div className='trustItem' key={item.title}>
              <div className='trustIcon'>{item.icon}</div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className='container'>
        <section className='surface categoriesShowcase'>
          <div className='sectionHead sectionHeadStack sectionCentered'>
            <div>
              <h2 className='sectionTitle'>Nos Categories</h2>
              <div className='sectionMeta'>Choisissez une categorie avec son visuel pour filtrer rapidement le catalogue.</div>
            </div>
          </div>

          <div className='categoryVisualGrid'>
            {topCategories.map((category) => {
              const name = String(category.name || category.slug || '');
              const count = products.filter((product) =>
                Array.isArray(product.categories)
                  ? product.categories
                      .map((item) => normalize(item?.name || item?.slug || item))
                      .includes(normalize(name))
                  : false
              ).length;

              return (
                <button
                  key={String(category._id || category.id || category.name)}
                  type='button'
                  className={`categoryVisualCard categoryPosterCard ${activeCategory === name ? 'active' : ''}`}
                  onClick={() => setActiveCategory(name)}
                >
                  <div className='categoryVisualMedia categoryPosterMedia'>
                    {category.image ? (
                      <img src={imgUrl(category.image)} alt={name} loading='lazy' />
                    ) : (
                      <div className='categoryVisualFallback'>{name}</div>
                    )}
                    <div className='categoryPosterOverlay' />
                    <div className='categoryPosterText'>
                      <strong>{name}</strong>
                      <span>{count} produit(s)</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className='surface'>
          <div className='sectionHead sectionHeadStack'>
            <div>
              <h2 className='sectionTitle'>{t('sectionCatalogue')}</h2>
              <div className='sectionMeta'>
                {loading ? t('loading') : t('sectionAvailableProducts', { count: filtered.length })}
              </div>
            </div>

            <div className='catBar'>
              <button
                type='button'
                className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                {t('all')}
                <span className='chipCount'>{products.length}</span>
              </button>

              {categories.map((category) => {
                const name = String(category.name || category.slug || '');
                const count = products.filter((product) =>
                  Array.isArray(product.categories)
                    ? product.categories
                        .map((item) => normalize(item?.name || item?.slug || item))
                        .includes(normalize(name))
                    : false
                ).length;

                return (
                  <button
                    key={String(category._id || category.id || category.name)}
                    type='button'
                    className={`chip ${activeCategory === name ? 'active' : ''}`}
                    onClick={() => setActiveCategory(name)}
                  >
                    {name}
                    <span className='chipCount'>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className='errorBox'>
              <div>{error}</div>
              <button className='ghostBtn ghostBtnMuted' type='button' onClick={() => window.location.reload()}>
                {t('reload')}
              </button>
            </div>
          ) : loading ? (
            <div className='grid'>
              {Array.from({ length: 8 }).map((_, index) => (
                <div className='card sk' key={index}>
                  <div className='skImg' />
                  <div className='skLine' />
                  <div className='skLine sm' />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className='empty'>{t('noProductsFound')}</div>
          ) : (
            <div className='grid'>
              {filtered.map((product) => {
                const id = String(product._id || product.id);
                const title = product.title || product.name || t('productDefault');
                const price = Number(product.price ?? 0);
                const oldPrice = Number(product.oldPrice ?? 0);
                const cover = Array.isArray(product.images) ? product.images[0] : product.image;
                const inStock = Number(product.stock ?? 0) > 0;

                return (
                  <button key={id} className='card cardModern' type='button' onClick={() => navigate(`/product/${id}`)}>
                    <div className='cardImg'>
                      {cover ? <img src={imgUrl(cover)} alt={title} loading='lazy' /> : <div className='placeholder'>{t('noImage')}</div>}
                      <div className={`badge ${inStock ? 'ok' : 'out'}`}>{inStock ? t('inStock') : t('outOfStock')}</div>
                    </div>

                    <div className='cardBody'>
                      <div className='cardTitle'>{title}</div>
                      <div className='cardRow'>
                        <div className='priceBox'>
                          <div className='price'>{formatCurrency(price, locale)} DT</div>
                          {oldPrice > price ? <div className='oldPrice'>{formatCurrency(oldPrice, locale)} DT</div> : null}
                        </div>
                        <div className='cta'>{t('details')}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <footer className='footer'>
          <div>© {new Date().getFullYear()} {t('brandName')}</div>
          <div className='footerLinks'>
            <span>{t('footerCatalogue')}</span>
            <span>{t('footerOrders')}</span>
            <span>{t('footerSupport')}</span>
          </div>
        </footer>
      </main>
    </AppShell>
  );
}
