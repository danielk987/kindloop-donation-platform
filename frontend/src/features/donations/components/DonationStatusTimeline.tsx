import { Box, Typography, Paper, alpha } from "@mui/material";
import { CheckCircle, Circle, RadioButtonUnchecked } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { DonationStatus } from "../types/donation.types";

interface DonationStatusTimelineProps {
  currentStatus: DonationStatus;
  needsDelivery?: boolean;
}

interface StatusStep {
  status: DonationStatus | string;
  label: string;
  description: string;
  optional?: boolean;
}

export const DonationStatusTimeline = ({
  currentStatus,
  needsDelivery = false,
}: DonationStatusTimelineProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const allStatuses: StatusStep[] = [
    {
      status: DonationStatus.PENDING,
      label: t("donations.status.pending") || "Pending",
      description: t("donations.statusDesc.pending") || "Donation created, waiting for request",
    },
    {
      status: DonationStatus.REQUESTED,
      label: t("donations.status.requested") || "Requested",
      description: t("donations.statusDesc.requested") || "User has requested this donation",
    },
    {
      status: DonationStatus.APPROVED,
      label: t("donations.status.approved") || "Approved",
      description: t("donations.statusDesc.approved") || "Request has been approved",
    },
    {
      status: "waiting_for_delivery",
      label: t("donations.status.waitingForDelivery") || "Waiting for Delivery",
      description: t("donations.statusDesc.waitingForDelivery") || "Waiting for driver assignment",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.IN_TRANSIT,
      label: t("donations.status.inTransit") || "In Transit",
      description: t("donations.statusDesc.inTransit") || "Delivery in progress",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.DELIVERED,
      label: t("donations.status.delivered") || "Delivered",
      description: t("donations.statusDesc.delivered") || "Donation has been delivered",
      optional: !needsDelivery,
    },
    {
      status: DonationStatus.COMPLETED,
      label: t("donations.status.completed") || "Completed",
      description: t("donations.statusDesc.completed") || "Donation process is complete",
    },
  ];

  const relevantStatuses = needsDelivery
    ? allStatuses
    : allStatuses.filter(step => !step.optional);

  const statusOrder = relevantStatuses.map(step => step.status);
  const currentIndex = statusOrder.indexOf(currentStatus);
  const activeStep = currentIndex === -1 ? 0 : currentIndex;

  const isRejected = currentStatus === DonationStatus.REJECTED;
  const isCancelled = currentStatus === DonationStatus.CANCELLED;

  if (isRejected || isCancelled) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: alpha("#f44336", 0.1),
          border: "1px solid",
          borderColor: alpha("#f44336", 0.3),
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {isRejected ? t("donations.status.rejected") : t("donations.status.cancelled")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isRejected
            ? t("donations.statusDesc.rejected") || "This donation request was rejected"
            : t("donations.statusDesc.cancelled") || "This donation was cancelled"}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, bgcolor: alpha("#359364", 0.02) }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {t("donations.statusTimeline") || "Donation Progress"}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {relevantStatuses.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isLast = index === relevantStatuses.length - 1;

          return (
            <Box key={step.status} sx={{ display: "flex", flexDirection: isRTL ? "row-reverse" : "row" }}>
              {/* Icon + connector column */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 32 }}>
                {/* Circle icon */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isCompleted || isActive ? "#359364" : alpha("#000", 0.1),
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle sx={{ fontSize: 24, color: "white" }} />
                  ) : isActive ? (
                    <Circle sx={{ fontSize: 12 }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 16, color: alpha("#000", 0.3) }} />
                  )}
                </Box>
                {/* Connector line */}
                {!isLast && (
                  <Box
                    sx={{
                      width: 2,
                      flexGrow: 1,
                      minHeight: 24,
                      bgcolor: isCompleted ? "#359364" : alpha("#000", 0.12),
                    }}
                  />
                )}
              </Box>

              {/* Label + description */}
              <Box sx={{ paddingInlineStart: 2, pb: isLast ? 0 : 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    color: isCompleted || isActive ? "#000" : alpha("#000", 0.5),
                    lineHeight: "24px",
                  }}
                >
                  {step.label}
                </Typography>
                {isActive && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {step.description}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
