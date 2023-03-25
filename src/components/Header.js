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
        <>
          <Link to="/register" className="header-button">
            REGISTER
          </Link>
          <Link to="/login" className="header-button">
            LOGIN
          </Link>
        </>
      )}
    </>
  );

  const productsView = (
    <>
      {localStorage.getItem("token") && !hasHiddenAuthButtons && (
        <Stack direction="row" spacing={2}>
          <img src="avatar.png" alt="User avatar"></img>
          <Button className="explore-button" variant="text" onClick={() => {}}>
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
          onClick={() => history.push('/')}
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
      {loginView}
      {productsView}
      {backToExploreView}
    </Box>
  );
};

export default Header;
