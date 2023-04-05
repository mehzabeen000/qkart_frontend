import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  const handleAdd = async () => {
    if (newAddress.value.trim() === "") {
      return;
    }

    await addAddress(token, newAddress);
    handleNewAddress((currNewAddress) => ({
      ...currNewAddress,
      value: "",
      isAddingNewAddress: false,
    }));
  };

  const handleCancel = () => {
    handleNewAddress("");
    handleNewAddress((currNewAddress) => ({
      ...currNewAddress,
      value: "",
      isAddingNewAddress: false,
    }));
  };

  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        value={newAddress.value}
        minRows={4}
        onChange={(e) =>
          handleNewAddress((currNewAddress) => ({
            ...currNewAddress,
            value: e.target.value,
          }))
        }
        placeholder="Enter your complete address"
      />
      <Stack direction="row" my="1rem">
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
        <Button variant="text" onClick={handleCancel}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    if (!token) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    const totalCost = getTotalCartValue(items);
    if (
      totalCost > localStorage.getItem("balance") ||
      !localStorage.getItem("balance")
    ) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }

    if (addresses.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }

    if (!addresses.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addresses.selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        localStorage.setItem(
          "balance",
          localStorage.getItem("balance") - getTotalCartValue(items)
        );
        return true;
      } else {
        enqueueSnackbar(response.data.message, {
          variant: "warning",
        });
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const token = localStorage.getItem("token");
      if (!token) {
        enqueueSnackbar("Please login to view your addresses", {
          variant: "info",
        });
        history.push("/");
      } else {
        try {
          await getAddresses(token);
        } catch (error) {
          enqueueSnackbar(
            "Failed to fetch addresses. Please check that the backend is running and reachable.",
            { variant: "error" }
          );
        }
      }

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {addresses.all.length === 0 ? (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              ) : (
                addresses.all.map((address) => (
                  <Box
                    onClick={() => {
                      setAddresses({ ...addresses, selected: address._id });
                    }}
                    key={address._id}
                    className={`address-item shipping-container ${
                      addresses.selected === address._id
                        ? "selected"
                        : "not-selected"
                    }`}
                    padding="1rem"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography>{address.address}</Typography>
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      onClick={async () =>
                        await deleteAddress(token, address._id)
                      }
                    >
                      Delete
                    </Button>
                  </Box>
                ))
              )}
            </Box>

            {!newAddress.isAddingNewAddress ? (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={async () => {
                  await addAddress(token, newAddress);
                }}
              />
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              onClick={async () => {
                if (!validateRequest(items, addresses)) return;
                const checkoutSuccessful = await performCheckout(
                  token,
                  items,
                  addresses
                );
                if (checkoutSuccessful) {
                  enqueueSnackbar("Order placed successfully", {
                    variant: "success",
                  });
                  history.push("/thanks");
                }
              }}
              variant="contained"
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
