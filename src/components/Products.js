import { Search } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import Cart from "./Cart";
import ProductCard from "./ProductCard";
import "./Products.css";

export const fetchCart = async (token) => {
  try {
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${config.endpoint}/cart`, options);
    const cart = response.data;
    return cart;
  } catch (err) {
    console.log(err);
  }
};

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState();
  const [filteredProducts, setFilteredProducts] = useState([]);

  const performAPICall = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setIsLoading(false);
      return response.data;
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details.",
        {
          variant: "error",
        }
      );
      setIsLoading(false);
    }
  };

  const fetchCartData = async () => {
    const cartData = await fetchCart(localStorage.getItem("token"));
    setCart(cartData);
  };

  useEffect(() => {
    if (products.length) return;
    performAPICall()
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(() => setIsLoading(false));
    fetchCartData();
  }, [products]);

  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts([...response.data]);
    } catch (error) {
      setFilteredProducts([...[]]);
    }
  };

  const debounceSearch = (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);
    clearTimeout(debounceTimeout);
    const newDebounceTimeout = setTimeout(() => {
      performSearch(searchText);
    }, 500);
    setDebounceTimeout(newDebounceTimeout);
  };

  const handleAddToCart = async (productId, qty) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return enqueueSnackbar("Login to add an item to the Cart", {
          variant: "error",
        });
      }
      const response = await axios.post(
        `${config.endpoint}/cart`,
        {
          productId: productId,
          qty: qty,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuantity = async (productId, qty) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }
      const cartItemIndex = cart.findIndex(
        (item) => item.productId === productId
      );
  
      if (cartItemIndex !== -1) {
        qty += cart[cartItemIndex].qty;
        if (qty < 0) {
          qty = 0;
        }
      }
      await handleAddToCart(productId, qty);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCartOnProductCard = async (id, qty) => {
    const cartItem = cart.find((item) => item.productId === id);
    if (cartItem && cartItem.qty) {
      return enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        {
          variant: "warning",
        }
      );
    }
    await handleAddToCart(id, qty);
  };

  return (
    <div>
      <Header>
        <TextField
          size="small"
          className="search-desktop"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          value={searchText}
          onChange={(event) => debounceSearch(event, debounceTimeout)}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        value={searchText}
        onChange={(event) => debounceSearch(event, debounceTimeout)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />

      <Grid container spacing={2} direction="row" justifyContent="center">
        <Grid item xs={12} md={localStorage.getItem("token") ? 9 : 12}>
          <Grid
            container
            key="products-container"
            spacing={2}
            direction="row"
            justifyContent="center"
            alignItems="center"
          >
            <Grid item xs={12} className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress
                  color="primary"
                  size={40}
                  className="loading-products"
                />
                <Typography position="absolute">Loading Products...</Typography>
              </Box>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <Grid
                  item
                  xs={6}
                  md={3}
                  lg={3}
                  className="product-grid"
                  key={product._id}
                >
                  <ProductCard
                    product={product}
                    handleAddToCart={async () =>
                      await handleCartOnProductCard(product._id, 1)
                    }
                  />
                </Grid>
              ))
            ) : (
              <Typography position="absolute">No products found</Typography>
            )}
          </Grid>
        </Grid>
        {localStorage.getItem("token") ? (
          <Grid item xs={12} md={3}>
            <Cart
              products={products}
              items={cart}
              handleQuantity={async (id, qty) => await handleQuantity(id, qty)}
            />
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
