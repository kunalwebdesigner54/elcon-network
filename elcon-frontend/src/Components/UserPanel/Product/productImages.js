import calcium from '../../../Assets/Pictures/calcium.jpeg';
import diabecare from '../../../Assets/Pictures/diabecare.jpeg';
import omega3 from '../../../Assets/Pictures/omega3.jpeg';
import pads from '../../../Assets/Pictures/pads.jpeg';
import fourpads from '../../../Assets/Pictures/fourpads.jpeg';
import watch from '../../../Assets/Pictures/watch.jpeg';
import smartwatch from '../../../Assets/Pictures/smartwatch.jpeg';
import goldheadphones from '../../../Assets/Pictures/goldheadphones.jpeg';
import headphones from '../../../Assets/Pictures/headphones.jpeg';
import laptop from '../../../Assets/Pictures/laptop.jpeg';
import airpods from '../../../Assets/Pictures/airpods.jpeg';
import slimfit from '../../../Assets/Pictures/slimfit.jpeg';
import fallbackOne from '../../../Assets/Pictures/ai1.jpeg';

const productImages = {
  calcium,
  diabecare,
  omega3,
  pads,
  fourpads,
  watch,
  smartwatch,
  goldheadphones,
  headphones,
  laptop,
  airpods,
  slimfit,
};

const nameFallbacks = [
  { match: /calcium/i, image: calcium },
  { match: /diabe/i, image: diabecare },
  { match: /omega/i, image: omega3 },
  { match: /pad/i, image: pads },
  { match: /watch/i, image: smartwatch },
  { match: /head ?phone/i, image: headphones },
  { match: /head ?pod|ear ?pod|air ?pod/i, image: airpods },
  { match: /laptop/i, image: laptop },
  { match: /slim fit/i, image: slimfit },
];

const isRenderableImageSource = (value) => {
  return typeof value === 'string' && (
    value.startsWith('data:image/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/')
  );
};

export const getProductImages = (productOrKey) => {
  if (typeof productOrKey === 'string') {
    return isRenderableImageSource(productOrKey) ? [productOrKey] : [];
  }

  const sources = Array.isArray(productOrKey?.images) ? productOrKey.images.filter(Boolean) : [];

  if (sources.length) {
    return sources;
  }

  if (isRenderableImageSource(productOrKey?.imageKey)) {
    return [productOrKey.imageKey];
  }

  return [];
};

export const resolveProductImage = (productOrKey) => {
  const images = getProductImages(productOrKey);
  if (images.length) {
    return images[0];
  }

  const key = typeof productOrKey === 'string' ? productOrKey : productOrKey?.imageKey;
  const name = typeof productOrKey === 'string'
    ? productOrKey
    : productOrKey?.productName || productOrKey?.name || '';

  if (key && productImages[key]) {
    return productImages[key];
  }

  const fallback = nameFallbacks.find((entry) => entry.match.test(name));
  return fallback?.image || fallbackOne;
};

export default productImages;