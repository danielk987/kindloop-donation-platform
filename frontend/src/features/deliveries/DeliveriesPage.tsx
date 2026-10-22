import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
  Divider,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  LocalShipping,
  LocationOn,
  Person,
  Inventory,
  CalendarToday,
  Visibility,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { Donation, DonationStatus } from "../donations/types/donation.types";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { getUserInitials, getProfileImageUrl } from "../../utils/userUtils";

const DeliveriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const queryClient = useQueryClient();

  // Debounce logic: Delay the API call until the user stops typing for 500ms
  useEffect(() => {
  // Set a timer to update debouncedSearch after 500ms
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    // Cleanup function: Cancel the timer if the user types again before 500ms pass
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch donations that need delivery
  const { data: donationsData, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["available-deliveries-donations", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", DonationStatus.APPROVED);
     if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "50");

      const response = await api.get(`/donations?${params.toString()}`);
      // Filter to only show donations with delivery location and no assigned driver
      const deliveries = response.data.data.filter(
        (d: Donation) => d.deliveryLocation && !d.assignedDriverId
      );
      return deliveries;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Fetch requests that need delivery (waiting_for_delivery status)
  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["available-deliveries-requests", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", "waiting_for_delivery");
      if (debouncedSearch) params.append("search", debouncedSearch);
      params.append("limit", "50");

      const response = await api.get(`/requests?${params.toString()}`);
      // Filter to only show requests with no assigned driver
      const deliveries = response.data.data.filter(
        (r: any) => r.needsDelivery && !r.assignedDriverId
      );
      return deliveries.map((r: any) => ({ ...r, type: 'request' }));
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const isLoading = isLoadingDonations || isLoadingRequests;
  const donations = donationsData || [];
  const requests = requestsData || [];
  const data = [...donations.map((d: Donation) => ({ ...d, type: 'donation' })), ...requests];

  // Assign self to delivery (donation or request)
  const assignMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'donation' | 'request' }) => {
      const endpoint = type === 'donation' 
        ? `/donations/${id}/assign-driver`
        : `/requests/${id}/assign-driver`;
      const response = await api.post(endpoint);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-deliveries-donations"] });
      queryClient.invalidateQueries({ queryKey: ["available-deliveries-requests"] });
      toast.success("Delivery assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign delivery");
    },
  });

  const handleOpenAssignDialog = (delivery: any) => {
    setSelectedDonation(delivery);
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedDonation(null);
  };

  const handleConfirmAssign = () => {
    if (selectedDonation) {
      assignMutation.mutate({ 
        id: selectedDonation._id, 
        type: (selectedDonation as any).type || 'donation'
      });
      handleCloseAssignDialog();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <LocalShipping sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("deliveries.availableDeliveries") || "Available Deliveries"}
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          {t("deliveries.subtitle") ||
            "View and assign yourself to approved donations that need delivery"}
        </Typography>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder={t("deliveries.searchPlaceholder") || "Search by title, location..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Stats */}
      <Box sx={{ mb: 3 }}>
        <Chip
          label={`${data?.length || 0} ${
            t("deliveries.available") || "deliveries available"
          }`}
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Deliveries Grid */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !data || data.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <LocalShipping sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("deliveries.noDeliveries") || "No deliveries available"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("deliveries.checkBackLater") || "Check back later for new delivery opportunities"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {data.map((item: any) => {
            const isRequest = item.type === "request";
            const requester = isRequest ? item.requesterId : item.requestedBy;
            const pickupAddr = isRequest
              ? item.fulfilledBy?.address
                ? { address: item.fulfilledBy.address.street, city: item.fulfilledBy.address.city }
                : null
              : item.pickupLocation;
            const deliveryAddr = isRequest
              ? item.deliveryAddress
                ? { address: item.deliveryAddress.street, city: item.deliveryAddress.city }
                : null
              : item.deliveryLocation;
            const createdDate = isRequest ? item.createdAt : item.requestedAt;

            return (
            <Grid item xs={12} md={6} lg={4} key={item._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={isRequest ? t("deliveries.request") || "Request" : item.type}
                      size="small"
                      color={isRequest ? "secondary" : "primary"}
                      variant="outlined"
                    />
                    {!isRequest && item.quantity && (
                      <Chip
                        icon={<Inventory />}
                        label={`${item.quantity} ${item.unit}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {isRequest && item.category && (
                      <Chip
                        label={t(`requests.categories.${item.category}`) || item.category}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {pickupAddr && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
                      >
                        <LocationOn fontSize="small" />
                        {t("deliveries.pickup") || "Pickup"}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {pickupAddr.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pickupAddr.city}
                      </Typography>
                    </Box>
                  )}

                  {deliveryAddr && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
                      >
                        <LocalShipping fontSize="small" />
                        {t("deliveries.delivery") || "Delivery"}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {deliveryAddr.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {deliveryAddr.city}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={getProfileImageUrl(requester) || undefined}
                      sx={{ width: 40, height: 40 }}
                    >
                      {getUserInitials(requester)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("deliveries.requestedBy") || "Requested by"}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {requester?.firstName} {requester?.lastName}
                      </Typography>
                    </Box>
                  </Box>

                  {createdDate && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 2 }}
                    >
                      <CalendarToday fontSize="small" />
                      {formatDistanceToNow(new Date(createdDate), { addSuffix: true })}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate(isRequest ? `/requests/${item._id}` : `/donations/${item._id}`)}
                    startIcon={<Visibility />}
                  >
                    {t("donations.viewDetails") || "View Details"}
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenAssignDialog(item)}
                    disabled={assignMutation.isPending}
                    startIcon={<LocalShipping />}
                  >
                    {t("deliveries.assignToMe") || "Assign to Me"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Assignment Confirmation Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <LocalShipping sx={{ color: "primary.main", fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Confirm Delivery Assignment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please review the delivery details
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {selectedDonation && (() => {
            const sel = selectedDonation as any;
            const isReq = sel.type === "request";
            const requester = isReq ? sel.requesterId : sel.requestedBy;
            const pickupAddr = isReq
              ? sel.fulfilledBy?.address
                ? { address: sel.fulfilledBy.address.street, city: sel.fulfilledBy.address.city }
                : null
              : sel.pickupLocation;
            const deliveryAddr = isReq
              ? sel.deliveryAddress
                ? { address: sel.deliveryAddress.street, city: sel.deliveryAddress.city }
                : null
              : sel.deliveryLocation;

            return (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  {isReq ? (t("deliveries.request") || "Request") : (t("deliveries.donation") || "Donation")}
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {sel.title}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    label={isReq ? (t("deliveries.request") || "Request") : sel.type}
                    size="small"
                    color={isReq ? "secondary" : "primary"}
                  />
                  {!isReq && sel.quantity && (
                    <Chip icon={<Inventory />} label={`${sel.quantity} ${sel.unit}`} size="small" />
                  )}
                  {isReq && sel.category && (
                    <Chip label={t(`requests.categories.${sel.category}`) || sel.category} size="small" />
                  )}
                </Stack>
              </Box>

              <Divider />

              {pickupAddr && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
                  >
                    <LocationOn fontSize="small" />
                    {t("deliveries.pickupLocation") || "Pickup Location"}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {pickupAddr.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pickupAddr.city}
                  </Typography>
                </Box>
              )}

              {deliveryAddr && (
                <Box
                  sx={{
                    bgcolor: alpha("#3b82f6", 0.05),
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha("#3b82f6", 0.2),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="primary.main"
                    fontWeight={600}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
                  >
                    <LocalShipping fontSize="small" />
                    {t("deliveries.deliveryDestination") || "Delivery Destination"}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {deliveryAddr.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {deliveryAddr.city}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  {t("deliveries.requestedBy") || "Requested by"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={getProfileImageUrl(requester) || undefined}
                    sx={{ width: 48, height: 48 }}
                  >
                    {getUserInitials(requester)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {requester?.firstName} {requester?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {requester?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
            );
          })()}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCloseAssignDialog}
            variant="outlined"
            color="inherit"
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssign}
            variant="contained"
            color="primary"
            disabled={assignMutation.isPending}
            startIcon={assignMutation.isPending ? <CircularProgress size={16} /> : <LocalShipping />}
            sx={{ minWidth: 140 }}
          >
            {assignMutation.isPending ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeliveriesPage;

