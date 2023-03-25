import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import { useHistory, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();

  const loginView = (
    <>
      {!localStorage.getItem("token") && !hasHiddenAuthButtons && (
        <Stack direction="row" spacing={2}>
          <Button className="header-button" onClick={() => history.push("/login")}>
            LOGIN
          </Button>
          <Button className="header-button" variant="contained" onClick={() => history.push("/register")}>
            REGISTER
          </Button>
        </Stack>
      )}
    </>
  );

  const productsView = (
    <>
      {localStorage.getItem("token") && !hasHiddenAuthButtons && (
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar src="avatar.png" alt={localStorage.getItem("username")}/>
          <span>{localStorage.getItem("username") || ""}</span>
          <Button
            className="explore-button"
            variant="text"
            onClick={() => {
              localStorage.removeItem("username");
              localStorage.removeItem("token");
              localStorage.removeItem("balance");
              window.location.reload();
            }}
          >
            LOGOUT
          </Button>
        </Stack>
      )}
    </>
  );

  const backToExploreView = (
    <>
      {hasHiddenAuthButtons && (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
        >
          Back to explore
        </Button>
      )}
    </>
  );

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {loginView}
      {productsView}
      {backToExploreView}
    </Box>
  );
};

export default Header;
