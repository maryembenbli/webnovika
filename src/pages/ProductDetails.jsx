import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrdersAPI } from '../api/orders.api';
import { ProductsAPI } from '../api/products.api';
import { AppShell } from '../components/AppShell';
import { useLocale } from '../context/locale.context';
import { formatCurrency, imgUrl } from '../utils/format';

function QuantityPicker({ value, onChange }) {
  return (
    <div className='qty'>
      <button type='button' className='qtyBtn' onClick={() => onChange(Math.max(1, value - 1))}>-</button>
      <div className='qtyVal'>{value}</div>
      <button type='button' className='qtyBtn' onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

function ProductGallery({ images, title, noImageLabel }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [images]);

  const main = images[active] || images[0];

  return (
    <div className='gallery'>
      <div className='galleryMain'>
        <div className='galleryStage'>
          {main ? <img src={main} alt={title} /> : <div className='placeholder'>{noImageLabel}</div>}
        </div>
      </div>

      {images.length > 1 ? (
        <div className='thumbs'>
          {images.map((src, index) => (
            <button
              type='button'
              key={`${src}-${index}`}
              className={`thumb ${index === active ? 'active' : ''}`}
              onClick={() => setActive(index)}
            >
              <img src={src} alt={`${title}-${index + 1}`} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    email: '',
    note: '',
  });
  const submittedRef = useRef(false);
  const draftHashRef = useRef('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    ProductsAPI.byId(id)
      .then((data) => {
        if (mounted) setProduct(data);
      })
      .catch((error) => {
        console.error(error);
        if (mounted) setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const title = product?.title || product?.name || t('productDefault');
  const productId = String(product?._id || product?.id || '');
  const unitPrice = Number(product?.price || 0);
  const deliveryFee = Number(product?.deliveryFee || 0);
  const oldPrice = Number(product?.oldPrice || 0);
  const inStock = Number(product?.stock ?? 0) > 0;
  const hasPromo = oldPrice > unitPrice;

  const images = useMemo(() => {
    const rawImages = [
      ...(Array.isArray(product?.images) ? product.images : []),
      ...(product?.image ? [product.image] : []),
    ];
    return rawImages.filter(Boolean).map(imgUrl);
  }, [product]);

  const subtotal = unitPrice * qty;
  const total = subtotal + deliveryFee;

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const buildAbandonedPayload = () => {
    const phone = form.phone.trim();
    if (!productId || phone.length < 6) return null;

    return {
      customerName: form.fullName.trim() || undefined,
      phone,
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
      customerNote: form.note.trim() || undefined,
      source: 'product-page',
      items: [
        {
          product: productId,
          quantity: qty,
          price: unitPrice,
          deliveryFee,
        },
      ],
    };
  };

  const saveAbandonedOrder = async ({ useBeacon = false } = {}) => {
    if (submittedRef.current) return;
    const payload = buildAbandonedPayload();
    if (!payload) return;

    const draftHash = JSON.stringify(payload);
    if (!useBeacon && draftHashRef.current === draftHash) return;
    draftHashRef.current = draftHash;

    if (useBeacon) {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/orders/abandoned', blob);
        return;
      }

      fetch('/api/orders/abandoned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
      return;
    }

    try {
      await OrdersAPI.saveAbandoned(payload);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const payload = buildAbandonedPayload();
    if (!payload || submittedRef.current) {
      return undefined;
    }

    saveTimerRef.current = setTimeout(() => {
      saveAbandonedOrder();
    }, 1200);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [form, qty, productId, unitPrice, deliveryFee]);

  useEffect(() => {
    const persistDraft = () => {
      saveAbandonedOrder({ useBeacon: true });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistDraft();
      }
    };

    window.addEventListener('pagehide', persistDraft);
    window.addEventListener('beforeunload', persistDraft);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', persistDraft);
      window.removeEventListener('beforeunload', persistDraft);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [form, qty, productId, unitPrice, deliveryFee]);

  const submitOrder = async () => {
    if (!productId) return window.alert(t('productNotFound'));
    if (!form.fullName.trim() || !form.phone.trim() || !form.city.trim() || !form.address.trim()) {
      return window.alert(t('requiredFields'));
    }

    const payload = {
      customerName: form.fullName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim() || undefined,
      address: form.address.trim() || undefined,
      email: form.email.trim() || undefined,
      customerNote: form.note.trim() || undefined,
      items: [
        {
          product: productId,
          quantity: qty,
          price: unitPrice,
          deliveryFee,
        },
      ],
    };

    try {
      setSending(true);
      submittedRef.current = true;
      await OrdersAPI.create(payload);
      draftHashRef.current = '';
      window.alert(t('orderSuccess'));
      setForm({ fullName: '', phone: '', city: '', address: '', email: '', note: '' });
      setQty(1);
      navigate('/cart');
    } catch (error) {
      submittedRef.current = false;
      console.error(error);
      window.alert(t('orderFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <main className='container pageSection'>
        {loading ? (
          <div className='surface'>{t('loading')}</div>
        ) : !product ? (
          <div className='surface'>
            <div className='empty'>{t('productNotFound')}</div>
            <button type='button' className='ghostBtn' onClick={() => navigate('/')}>
              {t('backToShop')}
            </button>
          </div>
        ) : (
          <>
            <div className='breadcrumb'>
              <button type='button' className='linkBtn' onClick={() => navigate('/')}>
                {t('breadcrumbShop')}
              </button>
              <span className='crumbSep'>/</span>
              <span className='crumbCurrent'>{title}</span>
            </div>

            <div className='pdLayout'>
              <section className='pdCard'>
                <div className='pdTopRow'>
                  <span className={`pill2 ${inStock ? 'ok' : 'out'}`}>{inStock ? t('availability') : t('unavailable')}</span>
                  <span className='brandTag2'>{product?.brand || t('defaultBrand')}</span>
                </div>

                <div className='pdMarketplaceGrid'>
                  <div className='pdGalleryColumn'>
                    <ProductGallery images={images} title={title} noImageLabel={t('noImage')} />
                  </div>

                  <div className='pdSummaryColumn'>
                    <h1 className='pdTitle'>{title}</h1>

                    <div className='pdPriceRow'>
                      <div className='pdPrice'>{formatCurrency(unitPrice, locale)} DT</div>
                      {hasPromo ? <div className='pdOldPrice'>{formatCurrency(oldPrice, locale)} DT</div> : null}
                    </div>

                    <div className='pdMetaGrid'>
                      <div className='pdMetaItem'>
                        <span>{t('delivery')}</span>
                        <strong>{formatCurrency(deliveryFee, locale)} DT</strong>
                      </div>
                      <div className='pdMetaItem'>
                        <span>{t('quantity')}</span>
                        <strong>{qty}</strong>
                      </div>
                      <div className='pdMetaItem'>
                        <span>{t('total')}</span>
                        <strong>{formatCurrency(total, locale)} DT</strong>
                      </div>
                    </div>

                    <div className='pdHighlights'>
                      <div className='pdHighlight'>Paiement a la livraison</div>
                      <div className='pdHighlight'>Produit verifie</div>
                      <div className='pdHighlight'>Livraison rapide</div>
                    </div>
                  </div>
                </div>
              </section>

              <aside className='orderCard'>
                <div className='orderHeader'>
                  <div className='orderTitle2'>{t('orderNow')}</div>
                  <div className='orderHint'>{t('orderHint')}</div>
                </div>

                <div className='formGrid'>
                  <div className='field'>
                    <label>{t('fullName')}</label>
                    <input value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                  </div>
                  <div className='field'>
                    <label>{t('phone')}</label>
                    <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </div>
                  <div className='field'>
                    <label>{t('city')}</label>
                    <input value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                  </div>
                  <div className='field'>
                    <label>Email</label>
                    <input type='email' value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                  </div>
                  <div className='field full'>
                    <label>{t('address')}</label>
                    <textarea rows='3' value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                  </div>
                  <div className='field full'>
                    <label>{t('customerNote')}</label>
                    <textarea rows='3' value={form.note} onChange={(e) => updateField('note', e.target.value)} />
                  </div>
                </div>

                <div className='orderBottom'>
                  <div className='rowBetween'>
                    <span className='muted'>{t('quantity')}</span>
                    <QuantityPicker value={qty} onChange={setQty} />
                  </div>

                  <div className='totals2'>
                    <div className='trow'>
                      <span>{t('subtotal')}</span>
                      <span>{formatCurrency(subtotal, locale)} DT</span>
                    </div>
                    <div className='trow'>
                      <span>{t('delivery')}</span>
                      <span>{formatCurrency(deliveryFee, locale)} DT</span>
                    </div>
                    <div className='trow total'>
                      <span>{t('total')}</span>
                      <span>{formatCurrency(total, locale)} DT</span>
                    </div>
                  </div>

                  <button type='button' className='primaryWide' onClick={submitOrder} disabled={sending || !inStock}>
                    {sending ? t('send') : t('validateOrder')}
                  </button>
                  <button type='button' className='ghostWide' onClick={() => navigate('/')}>
                    {t('continueShopping')}
                  </button>
                </div>
              </aside>

              <section className='pdDescCard pdDescPanel'>
                <div className='pdSectionTitle'>{t('description')}</div>
                {product?.description ? (
                  <div className='pdRichText' dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className='pdText'>{t('noDescription')}</p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
