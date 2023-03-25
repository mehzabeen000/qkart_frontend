import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import './Login.css'

const Login = () => {
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const login = async (formData) => {
    setLoading(true);
    if (!validateInput(formData)) return;
    try {
      const response = await axios.post(`${config.endpoint}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });
      enqueueSnackbar("Logged in", { variant: "success" });
      setLoading(false);
      const { token, username, balance } = response.data;
      persistLogin(token, username, balance)
      history.push("/"); 
      window.location.reload();
      // return response.data;
    } catch (error) {
      if (error.response.status === 400 && error.response) {
        return enqueueSnackbar(error.response.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check the backend is running, reachable and return valid JSON",
          { variant: "error" }
        );
      }
      setLoading(false);
    }
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    }
    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">

        <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Enter Username"
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />
          <Button
            className="button"
            variant="contained"
            onClick={async () => {
              await login(formData);
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "LOGIN TO QKART"}
          </Button>
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to='/register'>
              Register Now
            </Link>
          </p>

        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
