import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Avatar,
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  LocationOn,
  Inventory,
  Map as MapIcon,
  Visibility,
  TrendingFlat,
  CheckCircle,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../lib/axios";
import { Donation, DonationStatus } from "../donations/types/donation.types";
import { getUserInitials, getProfileImageUrl } from "../../utils/userUtils";
import { RouteMapDialog } from "./components/RouteMapDialog";

const MyDeliveriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRouteDialog, setShowRouteDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Donation | null>(null);

  // Fetch deliveries I'm assigned to (donations + requests)
  const { data: donationsData, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["my-deliveries-donations"],
    queryFn: async () => {
      const response = await api.get("/donations?assignedToMe=true");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["my-deliveries-requests"],
    queryFn: async () => {
      const response = await api.get("/requests?assignedToMe=true&limit=50");
      return response.data.data;
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const isLoading = isLoadingDonations || isLoadingRequests;
  const donations: Donation[] = donationsData || [];
  const requests: any[] = requestsData || [];
  
  // Combine both donations and requests for delivery
  const deliveries: any[] = [
    ...donations.map((d: Donation) => ({ ...d, type: 'donation' })),
    ...requests.map((r: any) => ({ ...r, type: 'request' }))
  ];

  // Filter by status
  const filteredDeliveries =
    statusFilter === "all"
      ? deliveries
      : deliveries.filter((d) => d.status === statusFilter);

  // Count by status
  const counts = {
    all: deliveries.length,
    waiting: deliveries.filter((d) => d.status === DonationStatus.WAITING_FOR_DELIVERY || d.status === "waiting_for_delivery").length,
    approved: deliveries.filter((d) => d.status === DonationStatus.APPROVED).length,
    in_transit: deliveries.filter((d) => d.status === DonationStatus.IN_TRANSIT || d.status === "in_transit").length,
    delivered: deliveries.filter((d) => d.status === DonationStatus.DELIVERED || d.status === "delivered").length,
    completed: deliveries.filter((d) => d.status === DonationStatus.COMPLETED || d.status === "completed").length,
  };

  // Mutation for marking in transit
  const markInTransitMutation = useMutation({
    mutationFn: async ({ id, itemType }: { id: string; itemType: string }) => {
      const endpoint = itemType === "request"
        ? `/requests/${id}/in-transit`
        : `/donations/${id}/mark-in-transit`;
      const method = itemType === "request" ? "post" : "patch";
      const response = await api[method](endpoint);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-deliveries-donations"] });
      queryClient.invalidateQueries({ queryKey: ["my-deliveries-requests"] });
      toast.success(t("myDeliveries.statusUpdatedInTransit"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("myDeliveries.updateStatusError"));
    },
  });

  // Mutation for marking delivered
  const markDeliveredMutation = useMutation({
    mutationFn: async ({ id, itemType }: { id: string; itemType: string }) => {
      const endpoint = itemType === "request"
        ? `/requests/${id}/delivered`
        : `/donations/${id}/mark-delivered`;
      const method = itemType === "request" ? "post" : "patch";
      const response = await api[method](endpoint);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-deliveries-donations"] });
      queryClient.invalidateQueries({ queryKey: ["my-deliveries-requests"] });
      toast.success(t("myDeliveries.deliveryComplete"));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("myDeliveries.updateStatusError"));
    },
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <LocalShipping sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight={700}>
            {t("myDeliveries.title") || "My Deliveries"}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t("myDeliveries.subtitle") || "Track and manage your assigned deliveries"}
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`${t("common.all")} (${counts.all})`} value="all" />
          <Tab label={`${t("donations.status.waiting_for_delivery")} (${counts.waiting})`} value={DonationStatus.WAITING_FOR_DELIVERY} />
          <Tab label={`${t("donations.status.approved")} (${counts.approved})`} value={DonationStatus.APPROVED} />
          <Tab label={`${t("donations.status.in_transit")} (${counts.in_transit})`} value={DonationStatus.IN_TRANSIT} />
          <Tab label={`${t("donations.status.delivered")} (${counts.delivered})`} value={DonationStatus.DELIVERED} />
          <Tab label={`${t("donations.status.completed")} (${counts.completed})`} value={DonationStatus.COMPLETED} />
        </Tabs>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && filteredDeliveries.length === 0 && (
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
            {t("myDeliveries.noDeliveries") || "No deliveries found"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusFilter === "all"
              ? t("myDeliveries.assignFirst") ||
                "Go to Deliveries page to assign yourself to available deliveries"
              : t("myDeliveries.noInStatus") || "No deliveries in this status"}
          </Typography>
        </Box>
      )}

      {/* Deliveries Grid */}
      {!isLoading && filteredDeliveries.length > 0 && (
        <Grid container spacing={3}>
          {filteredDeliveries.map((item: any) => {
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

            return (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
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
                  <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                    <Stack direction="row" spacing={0.5}>
                      <Chip
                        label={t(`donations.status.${item.status}`)}
                        size="small"
                        color={
                          item.status === DonationStatus.COMPLETED
                            ? "success"
                            : item.status === DonationStatus.IN_TRANSIT
                            ? "warning"
                            : item.status === DonationStatus.APPROVED || item.status === "waiting_for_delivery"
                            ? "info"
                            : "default"
                        }
                        sx={{
                          ...(item.status === DonationStatus.COMPLETED && {
                            color: 'white',
                            '& .MuiChip-label': { color: 'white' }
                          })
                        }}
                      />
                      {isRequest && (
                        <Chip label={t("deliveries.request") || "Request"} size="small" color="secondary" variant="outlined" />
                      )}
                    </Stack>
                    
                    {(item.status === DonationStatus.WAITING_FOR_DELIVERY || item.status === "waiting_for_delivery") && (
                      <Chip
                        icon={markInTransitMutation.isPending ? <CircularProgress size={14} /> : <TrendingFlat sx={{ fontSize: 16 }} />}
                        label={t("donations.status.in_transit")}
                        size="small"
                        onClick={() => markInTransitMutation.mutate({ id: item._id, itemType: item.type })}
                        disabled={markInTransitMutation.isPending}
                        sx={{ 
                          bgcolor: 'warning.main',
                          color: 'white',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'warning.dark' },
                          '& .MuiChip-label': { color: 'white', px: 1 },
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    )}
                    {item.status === DonationStatus.IN_TRANSIT && (
                      <Chip
                        icon={markDeliveredMutation.isPending ? <CircularProgress size={14} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                        label={t("donations.status.delivered")}
                        size="small"
                        onClick={() => markDeliveredMutation.mutate({ id: item._id, itemType: item.type })}
                        disabled={markDeliveredMutation.isPending}
                        sx={{ 
                          bgcolor: 'success.main',
                          color: 'white',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'success.dark' },
                          '& .MuiChip-label': { color: 'white', px: 1 },
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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
                        {t("myDeliveries.pickup")}
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
                        {t("myDeliveries.delivery")}
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

                  {requester && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        src={getProfileImageUrl(requester) || undefined}
                        sx={{ width: 32, height: 32 }}
                      >
                        {getUserInitials(requester)}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t("myDeliveries.deliveringTo")}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {requester.firstName} {requester.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1.5 }}>
                  {deliveryAddr && pickupAddr && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<MapIcon />}
                      onClick={() => {
                        setSelectedDelivery(item);
                        setShowRouteDialog(true);
                      }}
                    >
                      {t("myDeliveries.viewRoute")}
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => navigate(isRequest ? `/requests/${item._id}` : `/donations/${item._id}`)}
                  >
                    {t("common.viewDetails")}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            );
          })}
        </Grid>
      )}

      {/* Route Map Dialog */}
      {selectedDelivery && (() => {
        const sel = selectedDelivery as any;
        const isReq = sel.type === "request";
        const pickup = isReq
          ? sel.fulfilledBy?.address
            ? { address: sel.fulfilledBy.address.street, city: sel.fulfilledBy.address.city }
            : null
          : sel.pickupLocation;
        const delivery = isReq
          ? sel.deliveryAddress
            ? { address: sel.deliveryAddress.street, city: sel.deliveryAddress.city }
            : null
          : sel.deliveryLocation;

        return pickup && delivery ? (
          <RouteMapDialog
            open={showRouteDialog}
            onClose={() => {
              setShowRouteDialog(false);
              setSelectedDelivery(null);
            }}
            pickupLocation={pickup}
            deliveryLocation={delivery}
            donationTitle={sel.title}
          />
        ) : null;
      })()}
    </Container>
  );
};

export default MyDeliveriesPage;

