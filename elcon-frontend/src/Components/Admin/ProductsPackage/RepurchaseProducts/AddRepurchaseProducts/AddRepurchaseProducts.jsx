import '../../../Common/AdminLayout.css';
import './AddRepurchaseProducts.css';
import { useNavigate } from 'react-router-dom';
import { createAdminProduct } from '../../../../../api/productsService';

function AddRepurchaseProducts() {
  const navigate = useNavigate();

  const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Unable to read image file'));
      reader.readAsDataURL(file);
    });
  };

  const validateProductForm = (form) => {
    const requiredFields = [
      ['category', 'Category'],
      ['productName', 'Product Name'],
      ['productCode', 'Product Code'],
      ['hsnCode', 'HSN Code'],
      ['stock', 'Stock'],
      ['mrpPrice', 'M.R.P Price'],
      ['dpPrice', 'DP Price'],
      ['deliveryCharge', 'Delivery Charge'],
      ['levelPoint', 'Level Point'],
      ['bvPoint', 'B.V Point'],
      ['size', 'Size'],
      ['color', 'Color'],
      ['weight', 'Weight'],
      ['dimension', 'Dimension'],
      ['description', 'Description'],
      ['specifications', 'Specifications'],
      ['features', 'Features & Benefits'],
      ['quantity', 'Quantity'],
    ];

    const missingFields = requiredFields
      .filter(([fieldName]) => {
        const field = form.elements.namedItem(fieldName);
        return !field || String(field.value ?? '').trim() === '';
      })
      .map(([, label]) => label);

    const imageInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    const selectedImages = imageInputs.filter((input) => input.files && input.files.length > 0);

    if (missingFields.length || selectedImages.length !== 5) {
      const alertParts = [];

      if (missingFields.length) {
        alertParts.push(`Please enter/select: ${missingFields.join(', ')}`);
      }

      if (selectedImages.length !== 5) {
        alertParts.push('Please select all 5 product images.');
      }

      window.alert(alertParts.join('\n'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!validateProductForm(form)) {
      return;
    }

    const formData = new FormData(form);
    const imageInputs = Array.from(form.querySelectorAll('input[type="file"]'));
    const images = await Promise.all(imageInputs.map((input) => readFileAsDataUrl(input.files[0])));

    const payload = {
      type: 'repurchase',
      category: formData.get('category'),
      productName: formData.get('productName'),
      productCode: formData.get('productCode'),
      hsnCode: formData.get('hsnCode'),
      status: formData.get('stock') === 'Out of Stock' ? 'HIDDEN' : 'SHOWING',
      mrp: formData.get('mrpPrice'),
      dpPrice: formData.get('dpPrice'),
      shipping: formData.get('deliveryCharge') || 'free',
      levelPoint: formData.get('levelPoint'),
      bvPoint: formData.get('bvPoint'),
      size: formData.get('size'),
      color: formData.get('color'),
      weight: formData.get('weight'),
      dimension: formData.get('dimension'),
      description: formData.get('description'),
      specifications: formData.get('specifications'),
      features: formData.get('features'),
      quantity: formData.get('quantity') || '0',
      imageKey: images[0] || '',
      images,
    };

    try {
      await createAdminProduct(payload);
      navigate('/products-package/repurchase-products');
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Unable to add repurchase product');
    }
  };

  const contentFieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '110px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #d6dbe5',
    font: 'inherit',
    resize: 'vertical',
    background: '#fff'
  };

  const contentGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginTop: '14px'
  };

  const imageUploadGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    width: '100%'
  };

  const imageUploadFieldStyle = {
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <section className="panel admin-add-product-panel">
      <h2 className="section-title admin-add-product-title">ADD REPURCHASE PRODUCTS</h2>

      <form className="admin-add-product-card" onSubmit={handleSubmit}>
        <div className="admin-add-product-grid">
          <div className="admin-add-product-left">
            <div className="admin-add-product-table" role="group" aria-label="basic-product-details">
              <label className="admin-add-product-row">
                <span>Category</span>
                <select name="category" defaultValue="Healthcare">
                  <option value="Healthcare">Healthcare</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mens Fashion">Mens Fashion</option>
                  <option value="Electronics Appliances">Electronics Appliances</option>
                </select>
              </label>
              <label className="admin-add-product-row">
                <span>Product Name</span>
                <input name="productName" type="text" defaultValue="Elcon Calcium - 60 Tab" />
              </label>
              <label className="admin-add-product-row">
                <span>Product Code</span>
                <input name="productCode" type="text" defaultValue="PDT-101" />
              </label>
              <label className="admin-add-product-row">
                <span>HSN Code</span>
                <input name="hsnCode" type="text" defaultValue="4440" />
              </label>
              <label className="admin-add-product-row">
                <span>Stock</span>
                <select name="stock" defaultValue="In Stock">
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </label>
              <div className="admin-add-product-row" style={{ alignItems: 'flex-start' }}>
                <span>Product Images</span>
                <div style={imageUploadGridStyle}>
                  <label className="admin-add-product-row">
                    <span>Image 1</span>
                    <input type="file" accept="image/*" style={imageUploadFieldStyle} />
                  </label>
                  <label className="admin-add-product-row">
                    <span>Image 2</span>
                    <input type="file" accept="image/*" style={imageUploadFieldStyle} />
                  </label>
                  <label className="admin-add-product-row">
                    <span>Image 3</span>
                    <input type="file" accept="image/*" style={imageUploadFieldStyle} />
                  </label>
                  <label className="admin-add-product-row">
                    <span>Image 4</span>
                    <input type="file" accept="image/*" style={imageUploadFieldStyle} />
                  </label>
                  <label className="admin-add-product-row">
                    <span>Image 5</span>
                    <input type="file" accept="image/*" style={imageUploadFieldStyle} />
                  </label>
                </div>
              </div>
              <div style={contentGridStyle}>
                <label className="admin-add-product-row">
                  <span>Description</span>
                  <textarea
                    name="description"
                    rows="5"
                    defaultValue="Elcon Calcium product details and description."
                    style={contentFieldStyle}
                  />
                </label>
                <label className="admin-add-product-row">
                  <span>Specifications</span>
                  <textarea
                    name="specifications"
                    rows="5"
                    defaultValue="Type: Product Listing\nLayout: Image gallery with specification table\nTheme: User panel responsive card design\nInteraction: Card click, tabs, and carousel controls"
                    style={contentFieldStyle}
                  />
                </label>
                <label className="admin-add-product-row">
                  <span>Features &amp; Benefits</span>
                  <textarea
                    name="features"
                    rows="5"
                    defaultValue="Responsive layout for desktop, tablet, and mobile screens.\nTabbed content area that updates without changing the page.\nImage carousel with arrow controls for fast product preview.\nClean CTA area that keeps the purchase flow simple."
                    style={contentFieldStyle}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="admin-add-product-right">
            <div className="admin-add-product-table" role="group" aria-label="pricing-product-details">
              <label className="admin-add-product-row">
                <span>M.R.P Price</span>
                <input name="mrpPrice" type="text" defaultValue="375" />
              </label>
              <label className="admin-add-product-row">
                <span>DP Price</span>
                <input name="dpPrice" type="number" defaultValue="350" />
              </label>
              <label className="admin-add-product-row">
                <span>Delivery Charge</span>
                <input name="deliveryCharge" type="text" defaultValue="free" />
              </label>
              <label className="admin-add-product-row">
                <span>Level Point</span>
                <input name="levelPoint" type="number" defaultValue="200" />
              </label>
              <label className="admin-add-product-row">
                <span>B.V Point</span>
                <input name="bvPoint" type="number" defaultValue="0" />
              </label>
              <label className="admin-add-product-row">
                <span>Size</span>
                <input name="size" type="text" defaultValue="XL" />
              </label>
              <label className="admin-add-product-row">
                <span>Color</span>
                <input name="color" type="text" defaultValue="Green" />
              </label>
              <label className="admin-add-product-row">
                <span>Weight</span>
                <input name="weight" type="text" defaultValue="500gm" />
              </label>
              <label className="admin-add-product-row">
                <span>Dimension</span>
                <input name="dimension" type="text" defaultValue="300mm x 200mm x 100mm" />
              </label>
              <input name="quantity" type="hidden" defaultValue="500" />
            </div>
          </div>
        </div>

        <div className="admin-add-product-actions">
          <button type="reset" className="btn-danger admin-add-product-btn-reset">
            Reset
          </button>
          <button type="submit" className="btn-primary admin-add-product-btn-submit">
            Add
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddRepurchaseProducts;
