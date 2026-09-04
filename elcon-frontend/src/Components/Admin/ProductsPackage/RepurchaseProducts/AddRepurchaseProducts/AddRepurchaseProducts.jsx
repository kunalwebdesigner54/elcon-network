import '../../../Common/AdminLayout.css';
import './AddRepurchaseProducts.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { createAdminProduct, updateAdminProduct } from '../../../../../api/productsService';

function AddRepurchaseProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product || null;
  const isEditMode = location.state?.mode === 'edit';

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
      ['hsnCode', 'HSN Code']
    ];

    const missingFields = requiredFields
      .filter(([fieldName]) => {
        const field = form.elements.namedItem(fieldName);
        return !field || String(field.value ?? '').trim() === '';
      })
      .map(([, label]) => label);

    const imageInputs = Array.from(form.querySelectorAll('input[type="file"][accept="image/*"]'));
    const selectedImages = imageInputs.filter((input) => input.files && input.files.length > 0);

    if (missingFields.length || (!isEditMode && selectedImages.length === 0)) {
      const alertParts = [];

      if (missingFields.length) {
        alertParts.push(`Please enter/select: ${missingFields.join(', ')}`);
      }

      if (!isEditMode && selectedImages.length === 0) {
        alertParts.push('Please select at least 1 product image.');
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
    const imageInputs = Array.from(form.querySelectorAll('input[type="file"][accept="image/*"]'));
    const images = [];
    for (const input of imageInputs) {
      if (input.files && input.files.length > 0) {
        images.push(await readFileAsDataUrl(input.files[0]));
      }
    }

    const pdfInput = form.querySelector('input[type="file"][accept="application/pdf"]');
    const brochurePdf = (pdfInput && pdfInput.files.length > 0) ? await readFileAsDataUrl(pdfInput.files[0]) : '';

    const payload = {
      type: 'repurchase',
      category: formData.get('category'),
      productName: formData.get('productName'),
      productCode: formData.get('productCode'),
      hsnCode: formData.get('hsnCode'),
      gst: formData.get('gst') || '18',
      status: Number(formData.get('quantity')) <= 0 ? 'HIDDEN' : 'SHOWING',
      mrp: formData.get('mrpPrice'),
      dpPrice: formData.get('dpPrice'),
      discount: formData.get('discount'),
      shipping: formData.get('deliveryCharge') || 'free',
      levelPoint: formData.get('levelPoint'),
      bvPoint: formData.get('bvPoint'),
      reserveAmount: formData.get('reserveAmount'),
      size: formData.get('size'),
      color: formData.get('color'),
      weight: formData.get('weight'),
      dimension: formData.get('dimension'),
      description: formData.get('description'),
      specifications: formData.get('specifications'),
      features: formData.get('features'),
      quantity: formData.get('quantity') || '0',
    };

    if (images.length > 0) {
      payload.imageKey = images[0];
      payload.images = images;
    }

    if (brochurePdf) {
      payload.brochurePdf = brochurePdf;
    }

    try {
      if (isEditMode) {
        const id = product._id || product.id || product.productId || product.productCode;
        console.log('Update Admin Product Payload:', payload);
        await updateAdminProduct(id, payload);
        window.alert('Product updated successfully!');
      } else {
        console.log('Create Admin Product Payload:', payload);
        await createAdminProduct(payload);
        window.alert('Product created successfully!');
      }
      navigate('/products-package/repurchase-products');
    } catch (error) {
      window.alert(error?.response?.data?.message || `Unable to ${isEditMode ? 'update' : 'add'} repurchase product`);
    }
  };

  const contentFieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '110px',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    font: 'inherit',
    resize: 'vertical',
    background: 'transparent',
    color: 'var(--text-main)'
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
      <h2 className="section-title admin-add-product-title">{isEditMode ? 'EDIT' : 'ADD'} REPURCHASE PRODUCTS</h2>

      <form className="admin-add-product-card" onSubmit={handleSubmit}>
        <div className="admin-add-product-grid">
          <div className="admin-add-product-left">
            <div className="admin-add-product-table" role="group" aria-label="basic-product-details">
              <label className="admin-add-product-row">
                <span>Category</span>
                <select name="category" defaultValue={product?.category || "Healthcare"}>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mens Fashion">Mens Fashion</option>
                  <option value="Electronics Appliances">Electronics Appliances</option>
                </select>
              </label>
              <label className="admin-add-product-row">
                <span>Product Name</span>
                <input name="productName" type="text" defaultValue={product?.productName || product?.name || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>Product Code</span>
                <input name="productCode" type="text" defaultValue={product?.productCode || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>HSN Code</span>
                <input name="hsnCode" type="text" defaultValue={product?.hsnCode || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>GST %</span>
                <input name="gst" type="number" defaultValue={product?.gst || "18"} />
              </label>
              <label className="admin-add-product-row">
                <span>Stock</span>
                <input name="quantity" type="number" defaultValue={product?.quantity ?? ""} required />
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
              <div className="admin-add-product-row" style={{ alignItems: 'flex-start', marginTop: '14px' }}>
                <span>Download PDF (Brochure)</span>
                <input type="file" name="brochurePdf" accept="application/pdf" style={imageUploadFieldStyle} />
              </div>
              <div style={contentGridStyle}>
                <label className="admin-add-product-row">
                  <span>Description</span>
                  <textarea
                    name="description"
                    rows="5"
                    defaultValue={product?.description || ""}
                    style={contentFieldStyle}
                  />
                </label>
                <label className="admin-add-product-row">
                  <span>Specifications</span>
                  <textarea
                    name="specifications"
                    rows="5"
                    defaultValue={product?.specifications || ""}
                    style={contentFieldStyle}
                  />
                </label>
                <label className="admin-add-product-row">
                  <span>Features &amp; Benefits</span>
                  <textarea
                    name="features"
                    rows="5"
                    defaultValue={product?.features || ""}
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
                <input name="mrpPrice" type="text" defaultValue={product?.mrp ?? ""} />
              </label>
              <label className="admin-add-product-row">
                <span>DP Price</span>
                <input name="dpPrice" type="number" defaultValue={product?.dpPrice ?? ""} />
              </label>
              <label className="admin-add-product-row">
                <span>Coupon Discount</span>
                <input name="discount" type="number" defaultValue={product?.discount ?? "0"} />
              </label>
              <label className="admin-add-product-row">
                <span>Delivery Charge</span>
                <input name="deliveryCharge" type="text" defaultValue={product?.shipping ?? "free"} />
              </label>
              <label className="admin-add-product-row">
                <span>Level Point</span>
                <input name="levelPoint" type="number" defaultValue={product?.levelPoint ?? "0"} />
              </label>
              <label className="admin-add-product-row">
                <span>B.V Point</span>
                <input name="bvPoint" type="number" defaultValue={product?.bvPoint ?? "0"} />
              </label>
              <label className="admin-add-product-row">
                <span>Reserve Amount</span>
                <input name="reserveAmount" type="number" defaultValue={product?.reserveAmount ?? "0"} />
              </label>
              <label className="admin-add-product-row">
                <span>Size</span>
                <input name="size" type="text" placeholder="Optional (e.g. S,M,L)" defaultValue={product?.size || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>Color</span>
                <input name="color" type="text" placeholder="Optional (e.g. Red,Blue)" defaultValue={product?.color || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>Weight</span>
                <input name="weight" type="text" placeholder="Optional" defaultValue={product?.weight || ""} />
              </label>
              <label className="admin-add-product-row">
                <span>Dimension</span>
                <input name="dimension" type="text" placeholder="Optional" defaultValue={product?.dimension || ""} />
              </label>
            </div>
          </div>
        </div>

        <div className="admin-add-product-actions">
          {!isEditMode && (
            <button type="reset" className="btn-danger admin-add-product-btn-reset">
              Reset
            </button>
          )}
          <button type="submit" className="btn-primary admin-add-product-btn-submit">
            {isEditMode ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddRepurchaseProducts;
