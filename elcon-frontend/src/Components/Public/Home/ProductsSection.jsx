import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductsSection.css';

const productsData = [
  {
    title: 'Web Design Project',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600'
  },
  {
    title: 'Marketing Project',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600'
  },
  {
    title: 'SEO Project',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600'
  },
  {
    title: 'App Development',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600'
  }
];

function NextArrow(props) {
  const { onClick } = props;
  return (
    <div className="product-slider-arrow product-slider-next" onClick={onClick}>
      <i className="fa-solid fa-chevron-right"></i>
    </div>
  );
}

function PrevArrow(props) {
  const { onClick } = props;
  return (
    <div className="product-slider-arrow product-slider-prev" onClick={onClick}>
      <i className="fa-solid fa-chevron-left"></i>
    </div>
  );
}

function ProductsSection() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    <section className="home-products-section">
      <div className="public-container">
        <div className="home-products-header">
          <h2>Our Products</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae risus nec dui venenatis
            dignissim. Aenean vitae metus in augue pretium ultrices.
          </p>
        </div>

        <div className="products-slider-wrapper">
          <Slider {...settings}>
            {productsData.map((product, index) => (
              <div key={index} className="product-slide-item">
                <div className="product-card">
                  <div className="product-img-wrap">
                    <img src={product.image} alt={product.title} />
                  </div>
                  <div className="product-card-body">
                    <h3>{product.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default ProductsSection;
