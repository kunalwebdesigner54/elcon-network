import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductDetails.css';
import fallbackOne from '../../../../Assets/Pictures/ai1.jpeg';
import fallbackTwo from '../../../../Assets/Pictures/ai2.jpeg';
import fallbackThree from '../../../../Assets/Pictures/ai3.jpeg';
import fallbackFour from '../../../../Assets/Pictures/ai6.jpeg';
import fallbackFive from '../../../../Assets/Pictures/ai7.jpeg';
import { addCartItem, getProductById } from '../../../../api/productsService';
import { getProductImages, resolveProductImage } from '../productImages';

const tabConfig = {
  description: {
    title: 'DESCRIPTION',
    content: [
      'This product is presented in a clean, premium layout that helps the user review the item before purchase.',
      'The section is designed to keep the focus on product information, pricing, and purchase readiness while keeping the same visual theme used throughout the user panel.'
    ]
  },
  specification: {
    title: 'SPECIFICATION',
    content: [
      'Type: Product Listing',
      'Layout: Image gallery with specification table',
      'Theme: User panel responsive card design',
      'Interaction: Card click, tabs, and carousel controls'
    ]
  },
  features: {
    title: 'FEATURES & BENEFITS',
    content: [
      'Responsive layout for desktop, tablet, and mobile screens.',
      'Tabbed content area that updates without changing the page.',
      'Image carousel with arrow controls for fast product preview.',
      'Clean CTA area that keeps the purchase flow simple.'
    ]
  },
  pdf: {
    title: 'DOWNLOAD PDF',
    content: [
      'Use this tab to download the product sheet or brochure in PDF format.',
      'The button below can be connected to your real PDF file later without changing the layout.'
    ]
  }
};

const normalizeOptionalValue = (value) => {
  const normalizedValue = String(value ?? '').trim();
  return normalizedValue && normalizedValue !== '-' ? normalizedValue : '';
};

const getOptions = (value) => normalizeOptionalValue(value)
  .split(',')
  .map((option) => option.trim())
  .filter(Boolean);

const buildDetails = (product, stockStatus) => {
  const name = product?.productName || product?.name || 'Product';
  const category = product?.category || 'Health Care Products';
  const price = product?.price ?? 350;
  const mrp = product?.mrp ?? 375;
  const productCode = product?.productCode || `PDT-${String(product?.id || 101).padStart(3, '0')}`;
  const hsnCode = product?.hsnCode || (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? '8517' : '4440');
  const levelPoint = product?.levelPoint ?? product?.levelPlan ?? (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? 100 : 200);
  const bvPoint = product?.bvPoint ?? product?.bv ?? 0;
  const optionalDetails = [
    { label: 'SIZE', value: normalizeOptionalValue(product?.size) },
    { label: 'COLOR', value: normalizeOptionalValue(product?.color) },
    { label: 'WEIGHT', value: normalizeOptionalValue(product?.weight) },
    { label: 'DIMENSION', value: normalizeOptionalValue(product?.dimension) }
  ];

  return [
    { label: 'STOCK STATUS', value: stockStatus },
    { label: 'PRODUCT NAME', value: name },
    { label: 'PRODUCT CODE', value: productCode },
    { label: 'CATEGORY', value: category },
    { label: 'HSN CODE', value: hsnCode },
    { label: 'GST - %', value: '18' },
    { label: 'M.R.P PRICE', value: `₹ ${mrp} (Inclusive of all taxes)` },
    { label: 'DP PRICE', value: `₹ ${price} (Inclusive of all taxes)` },
    { label: 'DELIVERY CHARGE', value: 'free' },
    { label: 'COUPON AMOUNT', value: String(levelPoint) },
    { label: 'B.V POINT', value: String(bvPoint) },
    ...optionalDetails.filter((detail) => detail.value)
  ];
};

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      const productIdentifier =
        location.state?.product?.id ||
        location.state?.product?._id ||
        location.state?.product?.productCode ||
        new URLSearchParams(location.search).get('productId');

      if (product?.description || product?.specifications || product?.features) {
        return;
      }

      if (!productIdentifier) {
        return;
      }

      try {
        const response = await getProductById(productIdentifier);
        setProduct(response.product);
      } catch (error) {
        setProduct(location.state?.product || null);
      }
    };

    loadProduct();
  }, [location.state, location.search, product]);

  const galleryImages = useMemo(() => {
    const productImages = getProductImages(product);

    if (productImages.length) {
      return productImages.slice(0, 5);
    }

    return [
      resolveProductImage(product) || fallbackOne,
      fallbackTwo,
      fallbackThree,
      fallbackFour,
      fallbackFive
    ].filter(Boolean).slice(0, 5);
  }, [product]);

  const stockStatus = useMemo(() => {
    return (product?.quantity !== undefined && product?.quantity !== null && product?.quantity !== '')
      ? (Number(product.quantity) > 0 ? 'In Stock' : 'Out of Stock')
      : (product?.stock === 'Out of Stock' ? 'Out of Stock' : 'In Stock');
  }, [product]);

  const details = useMemo(() => buildDetails(product, stockStatus), [product, stockStatus]);
  const sizeOptions = getOptions(product?.size);
  const colorOptions = getOptions(product?.color);

  const activeTabData = tabConfig[activeTab];
  const descriptionText = product?.description || activeTabData.content[0];
  const specificationText = product?.specifications || activeTabData.content[0];
  const featuresText = product?.features || activeTabData.content[0];

  const handlePrevious = () => {
    setActiveImageIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  const handleAddToCart = () => {
    if (!product?.id && !product?._id && !product?.productCode) {
      navigate('/user/product/my_cart');
      return;
    }

    if ((sizeOptions.length > 1 && !selectedSize) || (colorOptions.length > 1 && !selectedColor)) {
      window.alert('Please select the available size and color before adding this product to cart.');
      return;
    }

    addCartItem(product._id || product.id || product.productCode, 1, { selectedSize, selectedColor })
      .then(() => {
        navigate('/user/product/my_cart');
      })
      .catch(() => {
        navigate('/user/product/my_cart');
      });
  };

  return (
    <div className="product-details-page user-product-page">
      <div className="user-panel product-details-shell">

        <h2 className="product-details-page-title">Product Details</h2>

        <div className="product-details-grid">
          <section className="product-preview-card">
            <div className="carousel-frame">
              <button type="button" className="carousel-arrow carousel-arrow-left" onClick={handlePrevious} aria-label="Previous image">
                <span aria-hidden="true">‹</span>
              </button>

              <div className="carousel-image-wrap">
                <img
                  src={galleryImages[activeImageIndex]}
                  alt={product?.productName || product?.name || 'Product preview'}
                  className="carousel-image"
                />
              </div>

              <button type="button" className="carousel-arrow carousel-arrow-right" onClick={handleNext} aria-label="Next image">
                <span aria-hidden="true">›</span>
              </button>
            </div>

            <div className="carousel-dots" aria-label="Product image thumbnails">
              {galleryImages.map((image, index) => (
                <button
                  key={image + index}
                  type="button"
                  className={`carousel-dot ${index === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                />
              ))}
            </div>
          </section>

          <section className="product-spec-card">
            <table className="product-spec-table">
              <tbody>
                {details.map((detail) => (
                  <tr key={detail.label}>
                    <th>{detail.label}</th>
                    <td>{detail.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <section className="product-tabs-card">
          {(sizeOptions.length > 1 || colorOptions.length > 1) && (
            <div className="product-variant-picker">
              {sizeOptions.length > 1 && (
                <label>
                  Size
                  <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} required>
                    <option value="">Select size</option>
                    {sizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                  {selectedSize && <span className="product-variant-selected">✓ Selected: {selectedSize}</span>}
                </label>
              )}
              {colorOptions.length > 1 && (
                <label>
                  Color
                  <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} required>
                    <option value="">Select color</option>
                    {colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}
                  </select>
                  {selectedColor && <span className="product-variant-selected">✓ Selected: {selectedColor}</span>}
                </label>
              )}
            </div>
          )}
          <div className="product-tabs-nav" role="tablist" aria-label="Product details tabs">
            {Object.entries(tabConfig).map(([key, tab]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                className={`product-tab-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="product-tab-panel" role="tabpanel">
            {activeTab === 'description' && (
              <p className="product-tab-lead">{descriptionText}</p>
            )}

            {(activeTab === 'specification' || activeTab === 'features') && (
              <ul className="product-tab-list">
                {(String(activeTab === 'specification' ? specificationText : featuresText)
                  .split('\n')
                  .filter(Boolean)).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
              </ul>
            )}

            {activeTab === 'pdf' && (
              <div className="product-pdf-panel">
                <p className="product-tab-copy">{activeTabData.content[0]}</p>
                {product?.brochurePdf ? (
                  <a href={product.brochurePdf} download="Brochure.pdf" target="_blank" rel="noreferrer" className="product-pdf-btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                    Download PDF
                  </a>
                ) : (
                  <p style={{ marginTop: '20px', color: '#ff4d4d' }}>No Brochure PDF available for this product.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="product-details-footer">
          <button
            type="button"
            className="product-details-cart-btn"
            onClick={handleAddToCart}
            disabled={stockStatus === 'Out of Stock'}
            style={{ opacity: stockStatus === 'Out of Stock' ? 0.5 : 1, cursor: stockStatus === 'Out of Stock' ? 'not-allowed' : 'pointer' }}
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
