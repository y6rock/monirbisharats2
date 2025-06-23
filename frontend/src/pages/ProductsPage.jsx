import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { BsCart } from 'react-icons/bs';
import './ProductsPage.css'; // Import the new CSS file

// Helper to get currency symbol
const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€',
  };
  return symbols[currencyCode] || '$';
};

const ProductsPage = () => {
  const { currency } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([
    { category_id: 'All Products', name: 'All Products' }
  ]);
  const [manufacturers, setManufacturers] = useState([]);
  const location = useLocation();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const getInitialCategory = () => {
    const params = new URLSearchParams(location.search);
    const categoryName = params.get('category');
    if (categoryName) {
      // Since categories are not dynamically fetched anymore, we can simplify this
      return categoryName;
    }
    return 'All Products';
  };

  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [priceRange, setPriceRange] = useState(100000);
  const [selectedManufacturers, setSelectedManufacturers] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false); // State for mobile filters

  // Update selectedCategory if URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryName = params.get('category');
    setSelectedCategory(categoryName || 'All Products');
  }, [location.search]);

  useEffect(() => {
    // Fetch products
    axios.get('/api/products')
      .then(res => {
        console.log('ProductsPage: Products fetched from backend:', res.data);
        setProducts(res.data);
      })
      .catch(err => console.error('ProductsPage: Error fetching products:', err));

    // Fetch categories
    axios.get('/api/categories/public')
      .then(res => {
        console.log('ProductsPage: Categories fetched from backend:', res.data);
        setCategories([
          { category_id: 'All Products', name: 'All Products' },
          ...res.data
        ]);
      })
      .catch(err => console.error('ProductsPage: Error fetching categories:', err));

    // Fetch manufacturers (assuming a /api/manufacturers endpoint exists or can be derived)
    // For now, let's use a placeholder if no dedicated API exists
    const dummyManufacturers = [
      { id: 'gaming_desktops', name: 'Gaming Desktops' },
      { id: 'apple', name: 'Apple' },
      { id: 'samsung', name: 'Samsung' },
      { id: 'dell', name: 'Dell' },
      { id: 'lenovo', name: 'Lenovo' },
      { id: 'asus', name: 'ASUS' },
      { id: 'hp', name: 'HP' },
    ];
    setManufacturers(dummyManufacturers);

  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Also update URL to reflect the selected category
    const params = new URLSearchParams(location.search);
    if (category === 'All Products') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Use navigate to update URL without full page reload
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
  };

  const handleManufacturerChange = (e) => {
    const { value, checked } = e.target;
    setSelectedManufacturers(prev =>
      checked ? [...prev, value] : prev.filter(m => m !== value)
    );
  };

  const filteredProducts = products.filter(product => {
    const categoryObject = categories.find(c => c.category_id === product.category_id);
    const categoryName = categoryObject ? categoryObject.name : '';
    const matchesCategory = selectedCategory === 'All Products' || categoryName === selectedCategory;
    const matchesPrice = parseFloat(product.price) <= parseFloat(priceRange);
    const matchesManufacturer = selectedManufacturers.length === 0 || selectedManufacturers.includes(product.manufacturer_id);
    // Assuming product has a manufacturer_id. For now, this will just filter by the dummy manufacturers.
    return matchesCategory && matchesPrice && matchesManufacturer;
  });

  const FilterSidebar = () => (
    <div className={`filters-sidebar ${filtersOpen ? 'open' : ''}`}>
      <button className="filter-close-button" onClick={() => setFiltersOpen(false)}>&times;</button>
      <div className="filter-group">
        <h3>Price Range</h3>
        <input type="range" min="0" max="100000" value={priceRange} onChange={handlePriceChange} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>{getCurrencySymbol(currency)}0</span>
          <span>{getCurrencySymbol(currency)}{priceRange}</span>
        </div>
      </div>
      <div className="filter-group">
        <h3>Manufacturer</h3>
        {manufacturers.map(manufacturer => (
          <div key={manufacturer.id}>
            <label>
              <input type="checkbox" value={manufacturer.id} checked={selectedManufacturers.includes(manufacturer.id)} onChange={handleManufacturerChange} />
              {manufacturer.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="products-page-container">
      <div className="products-hero-section">
        <h1>Premium Computers for Work and Play</h1>
        <p>Discover our extensive range of high-quality products and cutting-edge technology solutions</p>
        <button className="shop-now-button">Shop Now</button>
      </div>

      <div className="categories-filter">
        <h3>Categories</h3>
        <div className="categories-filter-buttons">
          {categories.map(cat => (
            <button
              key={cat.category_id}
              onClick={() => handleCategoryChange(cat.name)}
              className={`category-button ${selectedCategory === cat.name ? 'active' : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="products-page-layout">
        <FilterSidebar />
        <div className="product-grid-container">
          <button className="mobile-filter-button" onClick={() => setFiltersOpen(true)}>Show Filters</button>
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.product_id} className="product-card">
                <div className="product-image-container">
                  {product.image ? (
                    <img src={product.image.startsWith('/uploads') ? `http://localhost:3001${product.image}` : product.image} alt={product.name} className="product-image" />
                  ) : (
                    <div className="product-placeholder-image">Product Image</div>
                  )}
                </div>
                <div>
                  <p className="category-name">{categories.find(c => c.category_id === product.category_id)?.name || 'N/A'}</p>
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-info">{product.short_description || 'Little Info (One Line)'}</p>
                  <p className="product-price">{getCurrencySymbol(currency)}{parseFloat(product.price).toFixed(2)}</p>
                  <div className="product-card-actions">
                    <button className="details-button" onClick={() => navigate(`/products/${product.product_id}`)}>For details</button>
                    <button className="add-to-cart-button" onClick={() => addToCart(product)}>
                      <BsCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 