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

const buildDetails = (product) => {
  const name = product?.productName || product?.name || 'Product';
  const category = product?.category || 'Health Care Products';
  const price = product?.price ?? 350;
  const mrp = product?.mrp ?? 375;
  const productCode = product?.productCode || `PDT-${String(product?.id || 101).padStart(3, '0')}`;
  const hsnCode = product?.hsnCode || (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? '8517' : '4440');
  const levelPoint = product?.levelPoint ?? product?.levelPlan ?? (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? 100 : 200);
  const bvPoint = product?.bvPoint ?? product?.bv ?? 0;
  const size = product?.size || (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? 'Standard' : 'XL');
  const color = product?.color || (/electronic|watch|head|laptop|phone|pod/i.test(`${name} ${category}`) ? 'Black' : 'Green');

  return [
    { label: 'PRODUCT NAME', value: name },
    { label: 'PRODUCT CODE', value: productCode },
    { label: 'CATEGORY', value: category },
    { label: 'HSN CODE', value: hsnCode },
    { label: 'M.R.P PRICE', value: `₹ ${mrp} (Inclusive of all taxes)` },
    { label: 'DP PRICE', value: `₹ ${price} (Inclusive of all taxes)` },
    { label: 'DELIVERY CHARGE', value: 'free' },
    { label: 'LEVEL POINT', value: String(levelPoint) },
    { label: 'B.V POINT', value: String(bvPoint) },
    { label: 'SIZE', value: size },
    { label: 'COLOR', value: color },
    { label: 'WEIGHT', value: product?.weight || '500gm' },
    { label: 'DIMENSION', value: product?.dimension || '300mm x 200mm x 100mm' }
  ];
};

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const details = useMemo(() => buildDetails(product), [product]);

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

    addCartItem(product._id || product.id || product.productCode, 1)
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
            {activeTab !== 'pdf' ? (
              <>
                <p className="product-tab-lead">{activeTab === 'description' ? descriptionText : activeTab === 'specification' ? specificationText : featuresText}</p>
                {activeTab === 'description' ? (
                  <p className="product-tab-copy">{product?.features || activeTabData.content[1]}</p>
                ) : (
                  <ul className="product-tab-list">
                    {(String(activeTab === 'specification' ? specificationText : featuresText)
                      .split('\n')
                      .filter(Boolean)).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="product-pdf-panel">
                <p className="product-tab-copy">{activeTabData.content[0]}</p>
                <p className="product-tab-copy">{activeTabData.content[1]}</p>
                <button type="button" className="product-pdf-btn">
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="product-details-footer">
          <button type="button" className="product-details-cart-btn" onClick={handleAddToCart}>
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;