import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
  useScrollTrigger,
  Slide,
  alpha,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Language as LanguageIcon,
  Logout,
  Dashboard as DashboardIcon,
  Favorite,
  KeyboardArrowDown,
  AdminPanelSettings,
  Person,
  Assignment,
  CardGiftcard,
  Menu as MenuIcon,
  Close as CloseIcon,
  LocalShipping,
  VolunteerActivism,
} from "@mui/icons-material";
import { useAuthStore } from "../../stores/authStore";
import { usePermission } from "../../hooks/usePermission";
import { getProfileImageUrl, getUserInitials, isUserVerified } from "../../../utils/userUtils";
import { NotificationCenter } from "../../../features/notifications/NotificationCenter";
import UserAvatar from "../shared/UserAvatar";
import { useWebSocket } from "../../../hooks/useWebSocket";
import { DonateButton } from "../../../features/payments/components/DonateButton";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, clearAuth, hasPermission } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useWebSocket();

  const trigger = useScrollTrigger();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const isAdmin = hasPermission("system.admin", "users.manage");
  const canViewDonations = usePermission([
    "donations.view",
    "donations.view.own",
  ]);
  const canViewRequests = usePermission(["requests.view", "requests.view.own"]);
  const canViewDeliveries = usePermission(["deliveries.view"]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setLangAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    handleClose();
  };

  const handleLogout = () => {
    clearAuth();
    handleClose();
    setMobileOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const handleMobileNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: alpha("#ffffff", 0.95),
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ py: 1 }}>
              {/* Logo */}
              <Box
                component={Link}
                to="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                    boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                  }}
                  aria-hidden="true"
                >
                  <Favorite sx={{ color: "white", fontSize: 24 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "Poppins",
                    fontWeight: 800,
                    color: "primary.main",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  KindLoop
                </Typography>
              </Box>

              {/* Desktop nav links - only rendered on lg+ */}
              {isAuthenticated && isDesktop && (
                <Box sx={{ display: "flex", gap: 1, marginInlineStart: 3 }}>
                  <Button
                    component={Link}
                    to="/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={{
                      color: isActive("/dashboard") ? "primary.main" : "text.primary",
                      fontWeight: isActive("/dashboard") ? 600 : 500,
                      "&:hover": { bgcolor: alpha("#359364", 0.08) },
                    }}
                  >
                    {t("nav.dashboard")}
                  </Button>

                  {canViewDonations && (
                    <Button
                      component={Link}
                      to="/donations"
                      sx={{
                        color: isActive("/donations") ? "primary.main" : "text.primary",
                        fontWeight: isActive("/donations") ? 600 : 500,
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.donations")}
                    </Button>
                  )}

                  {canViewRequests && (
                    <Button
                      component={Link}
                      to="/requests"
                      sx={{
                        color: isActive("/requests") ? "primary.main" : "text.primary",
                        fontWeight: isActive("/requests") ? 600 : 500,
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.requests")}
                    </Button>
                  )}

                  {canViewDeliveries && (
                    <Button
                      component={Link}
                      to="/deliveries"
                      sx={{
                        color: isActive("/deliveries") ? "primary.main" : "text.primary",
                        fontWeight: isActive("/deliveries") ? 600 : 500,
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("nav.deliveries") || "Deliveries"}
                    </Button>
                  )}
                </Box>
              )}

              <Box sx={{ flexGrow: 1 }} />

              {/* Right side actions */}
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
                {isAuthenticated ? (
                  <>
                    <NotificationCenter />

                    {isDesktop ? (
                      <>
                        <DonateButton size="small" />

                        <Button
                          onClick={handleMenu}
                          endIcon={<KeyboardArrowDown />}
                          aria-label={t("accessibility.userMenu")}
                          aria-haspopup="true"
                          aria-expanded={Boolean(anchorEl)}
                          sx={{
                            color: "text.primary",
                            textTransform: "none",
                            "&:hover": { bgcolor: alpha("#359364", 0.08) },
                          }}
                        >
                          <Box sx={{ marginInlineEnd: 1 }}>
                            <UserAvatar
                              src={getProfileImageUrl(user) || undefined}
                              initials={getUserInitials(user)}
                              size={36}
                              isVerified={isUserVerified(user)}
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            />
                          </Box>
                          <Box sx={{ textAlign: "start" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.2 }}
                            >
                              {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", lineHeight: 1 }}
                            >
                              {user?.role?.name || user?.role?.key}
                            </Typography>
                          </Box>
                        </Button>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                          aria-label="User menu"
                          disableScrollLock
                          PaperProps={{
                            sx: {
                              mt: 1,
                              minWidth: 200,
                              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
                            <DashboardIcon sx={{ marginInlineEnd: 2 }} fontSize="small" />
                            {t("nav.dashboard")}
                          </MenuItem>
                          <MenuItem component={Link} to="/profile" onClick={handleClose}>
                            <Person sx={{ marginInlineEnd: 2 }} fontSize="small" />
                            {t("nav.profile")}
                          </MenuItem>
                          <MenuItem component={Link} to="/my-requests" onClick={handleClose}>
                            <Assignment sx={{ marginInlineEnd: 2 }} fontSize="small" />
                            {t("nav.myRequests") || "My Requests"}
                          </MenuItem>
                          <MenuItem component={Link} to="/my-fulfilled-requests" onClick={handleClose}>
                            <CardGiftcard sx={{ marginInlineEnd: 2 }} fontSize="small" />
                            {t("nav.myFulfilledRequests") || "My Fulfilled Requests"}
                          </MenuItem>
                          {user?.role?.key === "driver" && (
                            <MenuItem component={Link} to="/my-deliveries" onClick={handleClose}>
                              <LocalShipping sx={{ marginInlineEnd: 2 }} fontSize="small" />
                              {t("nav.myDeliveries") || "My Deliveries"}
                            </MenuItem>
                          )}
                          {isAdmin && (
                            <MenuItem component={Link} to="/admin" onClick={handleClose}>
                              <AdminPanelSettings sx={{ marginInlineEnd: 2 }} fontSize="small" />
                              {t("admin.panelTitle")}
                            </MenuItem>
                          )}
                          <MenuItem onClick={handleLogout}>
                            <Logout sx={{ marginInlineEnd: 2 }} fontSize="small" />
                            {t("common.logout")}
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <IconButton
                        onClick={() => setMobileOpen(true)}
                        sx={{ color: "text.primary" }}
                        aria-label="Open menu"
                      >
                        <MenuIcon />
                      </IconButton>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      component={Link}
                      to="/login"
                      sx={{
                        color: "text.primary",
                        fontWeight: 500,
                        "&:hover": { bgcolor: alpha("#359364", 0.08) },
                      }}
                    >
                      {t("common.login")}
                    </Button>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/register"
                      sx={{
                        background:
                          "linear-gradient(135deg, #359364 0%, #24754f 100%)",
                        boxShadow: "0 4px 12px rgba(53, 147, 100, 0.3)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #24754f 0%, #1a5a3d 100%)",
                          boxShadow: "0 6px 16px rgba(53, 147, 100, 0.4)",
                        },
                      }}
                    >
                      {t("common.register")}
                    </Button>
                  </>
                )}

                <IconButton
                  onClick={handleLangMenu}
                  aria-label={t("accessibility.toggleLanguage")}
                  aria-haspopup="true"
                  aria-expanded={Boolean(langAnchorEl)}
                  sx={{
                    color: "text.primary",
                    "&:hover": { bgcolor: alpha("#359364", 0.08) },
                  }}
                >
                  <LanguageIcon />
                </IconButton>
                <Menu
                  anchorEl={langAnchorEl}
                  open={Boolean(langAnchorEl)}
                  onClose={handleClose}
                  aria-label="Language selection"
                  disableScrollLock
                  PaperProps={{
                    sx: {
                      mt: 1,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      minWidth: 150,
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleLanguageChange("en")}
                    selected={i18n.language === "en"}
                    sx={{ direction: "ltr", justifyContent: "flex-start" }}
                  >
                    🇺🇸 English
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleLanguageChange("he")}
                    selected={i18n.language === "he"}
                    sx={{ direction: "rtl", justifyContent: "flex-start" }}
                  >
                    🇮🇱 עברית
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </Slide>

      {/* Mobile drawer */}
      <Drawer
        anchor={i18n.language === "he" ? "right" : "left"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: { width: 280 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              src={getProfileImageUrl(user) || undefined}
              initials={getUserInitials(user)}
              size={40}
              isVerified={isUserVerified(user)}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.role?.name || user?.role?.key}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          <ListItemButton
            selected={isActive("/dashboard")}
            onClick={() => handleMobileNav("/dashboard")}
          >
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary={t("nav.dashboard")} />
          </ListItemButton>

          {canViewDonations && (
            <ListItemButton
              selected={isActive("/donations")}
              onClick={() => handleMobileNav("/donations")}
            >
              <ListItemIcon><VolunteerActivism /></ListItemIcon>
              <ListItemText primary={t("nav.donations")} />
            </ListItemButton>
          )}

          {canViewRequests && (
            <ListItemButton
              selected={isActive("/requests")}
              onClick={() => handleMobileNav("/requests")}
            >
              <ListItemIcon><Assignment /></ListItemIcon>
              <ListItemText primary={t("nav.requests")} />
            </ListItemButton>
          )}

          {canViewDeliveries && (
            <ListItemButton
              selected={isActive("/deliveries")}
              onClick={() => handleMobileNav("/deliveries")}
            >
              <ListItemIcon><LocalShipping /></ListItemIcon>
              <ListItemText primary={t("nav.deliveries") || "Deliveries"} />
            </ListItemButton>
          )}

          <Divider sx={{ my: 1 }} />

          <ListItemButton
            selected={isActive("/profile")}
            onClick={() => handleMobileNav("/profile")}
          >
            <ListItemIcon><Person /></ListItemIcon>
            <ListItemText primary={t("nav.profile")} />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/my-requests")}
            onClick={() => handleMobileNav("/my-requests")}
          >
            <ListItemIcon><Assignment /></ListItemIcon>
            <ListItemText primary={t("nav.myRequests") || "My Requests"} />
          </ListItemButton>

          <ListItemButton
            selected={isActive("/my-fulfilled-requests")}
            onClick={() => handleMobileNav("/my-fulfilled-requests")}
          >
            <ListItemIcon><CardGiftcard /></ListItemIcon>
            <ListItemText primary={t("nav.myFulfilledRequests") || "My Fulfilled Requests"} />
          </ListItemButton>

          {user?.role?.key === "driver" && (
            <ListItemButton
              selected={isActive("/my-deliveries")}
              onClick={() => handleMobileNav("/my-deliveries")}
            >
              <ListItemIcon><LocalShipping /></ListItemIcon>
              <ListItemText primary={t("nav.myDeliveries") || "My Deliveries"} />
            </ListItemButton>
          )}

          {isAdmin && (
            <ListItemButton
              selected={isActive("/admin")}
              onClick={() => handleMobileNav("/admin")}
            >
              <ListItemIcon><AdminPanelSettings /></ListItemIcon>
              <ListItemText primary={t("admin.panelTitle")} />
            </ListItemButton>
          )}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ px: 2, py: 1 }}>
            <DonateButton size="small" fullWidth />
          </Box>

          <Divider sx={{ my: 1 }} />

          <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon><Logout sx={{ color: "error.main" }} /></ListItemIcon>
            <ListItemText primary={t("common.logout")} />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
