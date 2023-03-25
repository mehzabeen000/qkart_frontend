import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${config.endpoint}/auth/register`,
        formData
      );
      if (response.data.success) {
        enqueueSnackbar("Registration successful", { variant: "success" });
      } else {
        enqueueSnackbar(response.data.message, { variant: "error" });
      }
    } catch (error) {
      if (error.response.status) {
        enqueueSnackbar("Username is already taken", { variant: "error" });
      } else {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    } else if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    } else if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    } else if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
      });
      return false;
    } else if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "warning" });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      username: event.target.username.value,
      password: event.target.password.value,
      confirmPassword: event.target.confirmPassword.value,
    };
    if (validateInput(formData)) {
      await register(formData);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <form onSubmit={handleFormSubmit}>
        <Box className="content">
          <Stack spacing={2} className="form">
            <h2 className="title">Register</h2>
            <TextField
              id="username"
              label="Username"
              variant="outlined"
              title="Username"
              name="username"
              placeholder="Enter Username"
              fullWidth
            />
            <TextField
              id="password"
              variant="outlined"
              label="Password"
              name="password"
              type="password"
              helperText="Password must be atleast 6 characters length"
              fullWidth
              placeholder="Enter a password with minimum 6 characters"
            />
            <TextField
              id="confirmPassword"
              variant="outlined"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              fullWidth
            />
            <Button
              className="button"
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register Now"}
            </Button>
            <p className="secondary-action">
              Already have an account?{" "}
              <a className="link" href="#">
                Login here
              </a>
            </p>
          </Stack>
        </Box>
      </form>
      <Footer />
    </Box>
  );
};

export default Register;
