import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.category}
        </Typography>
        <Rating name="product-rating" value={product.rating} readOnly />
        <Typography variant="h6" color="text.secondary">
          ${product.cost}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => handleAddToCart(product)}
          startIcon={<AddShoppingCartOutlined />}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
