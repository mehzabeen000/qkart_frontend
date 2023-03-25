import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
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
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      return response.data;
    } catch (error) {
      enqueueSnackbar(
        "Something went wrong. Check the backend console for more details.",
        {
          variant: "error",
        }
      );
    }
  };

  useEffect(() => {
    setIsLoading(true);
    performAPICall()
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setIsLoading(false);
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
      const errorMessage = "Failed to search products";
      enqueueSnackbar(errorMessage, { variant: "error" });
      throw new Error(errorMessage);
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
          <CircularProgress
            color="primary"
            size={40}
            className="loading-products"
          />
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
          <>No products found</>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;
