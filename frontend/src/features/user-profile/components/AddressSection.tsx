import { Box, Paper, Typography, Grid, TextField } from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import AddressAutocomplete from "../../../shared/components/forms/AddressAutocomplete";

interface AddressSectionProps {
  formData: any;
  isEditing: boolean;
  onNestedFieldChange: (parent: string, field: string, value: any) => void;
}

export const AddressSection = ({
  formData,
  isEditing,
  onNestedFieldChange,
}: AddressSectionProps) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <LocationOn color="primary" />
        <Typography variant="h6" fontWeight={700}>
          {t("profile.address")}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {isEditing ? (
            <AddressAutocomplete
              type="city"
              value={formData.address.city}
              onChange={(value) => onNestedFieldChange("address", "city", value)}
              label={t("profile.city")}
              disabled={!isEditing}
            />
          ) : (
            <TextField
              fullWidth
              label={t("profile.city")}
              value={formData.address.city}
              disabled={!isEditing}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {isEditing ? (
            <AddressAutocomplete
              type="street"
              value={formData.address.street}
              onChange={(value) => onNestedFieldChange("address", "street", value)}
              label={t("profile.street")}
              cityContext={formData.address.city}
              disabled={!isEditing}
            />
          ) : (
            <TextField
              fullWidth
              label={t("profile.street")}
              value={formData.address.street}
              disabled={!isEditing}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t("profile.zipCode")}
            value={formData.address.zipCode}
            onChange={(e) =>
              onNestedFieldChange("address", "zipCode", e.target.value)
            }
            disabled={!isEditing}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

