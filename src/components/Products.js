import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState();
  const [searchText, setSearchText] = useState("");
  const { enqueueSnackbar } = useSnackbar();

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

  useEffect(() => {
    if (products.length) return;
    performAPICall()
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(() => setIsLoading(false));
  }, [products]);

  const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      setFilteredProducts([...response.data]);
    } catch (error) {
      setFilteredProducts([...[]]);
      // const errorMessage = "No Products Found";
      // enqueueSnackbar(errorMessage, { variant: "error" });
      // throw new Error(errorMessage);
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
      <Grid
        container
        key='products-container'
        spacing={2}
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} className="product-grid">
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
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
             <Typography position='absolute'>Loading Products...</Typography>
          </Box>
        ) : filteredProducts.length ? (
          filteredProducts.map((product) => (
            <Grid
              item
              xs={6}
              md={3}
              lg={3}
              className="product-grid"
              key={product.id}
            >
              <ProductCard product={product} />
            </Grid>
          ))
        ) : (
          <Typography position='absolute'>No products found</Typography>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
