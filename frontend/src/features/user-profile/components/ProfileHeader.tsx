import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import ProfileImageUpload from "../../../shared/components/shared/ProfileImageUpload";
import { getProfileImageUrl, getUserInitials } from "../../../utils/userUtils";

// Helper to get display text without translation
const getDisplayText = (value: any): string => {
  if (typeof value === "string") return value;
  if (value?.name) return value.name;
  if (value?.key) return value.key;
  return "";
};

interface ProfileHeaderProps {
  userData: any;
  isEditing: boolean;
  canEdit: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  isUploadingImage: boolean;
}

export const ProfileHeader = ({
  userData,
  isEditing,
  canEdit,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onImageSelect,
  onImageRemove,
  isUploadingImage,
}: ProfileHeaderProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  return (
    <Paper
      sx={{
        p: 4,
        background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
        color: "white",
        borderRadius: 3,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {isEditing && canEdit ? (
          <Box sx={{ textAlign: "center" }}>
            <ProfileImageUpload
              currentImage={getProfileImageUrl(userData) || undefined}
              userName={`${userData.firstName} ${userData.lastName}`}
              onImageSelect={onImageSelect}
              onImageRemove={onImageRemove}
              loading={isUploadingImage}
              size={120}
            />
          </Box>
        ) : (
          <Avatar
            src={getProfileImageUrl(userData) || undefined}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "white",
              color: "primary.main",
              fontSize: "2.5rem",
              fontWeight: 700,
              border: "4px solid rgba(255,255,255,0.3)",
            }}
          >
            {getUserInitials(userData)}
          </Avatar>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {userData.firstName} {userData.lastName}
          </Typography>
          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            sx={{ 
              mb: 1,
              gap: 1,
              "& > *": {
                marginInlineStart: "0 !important",
              }
            }}
          >
            <Chip
              label={getDisplayText(userData.role)}
              sx={{
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                fontWeight: 600,
              }}
            />
            <Chip
              label={userData.status}
              sx={{
                bgcolor: alpha("#fff", 0.2),
                color: "white",
                fontWeight: 600,
              }}
            />
            {userData.isEmailVerified && (
              <Chip
                label={t("profile.verified")}
                sx={{
                  bgcolor: alpha("#10b981", 0.9),
                  color: "white",
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>
        </Box>
        {canEdit && (
          <Box>
            {isEditing ? (
              <Stack 
                direction="row" 
                spacing={1}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={onSaveClick}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": { bgcolor: alpha("#fff", 0.9) },
                  }}
                >
                  {t("common.save")}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={onCancelClick}
                  sx={{
                    borderColor: "white",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={onEditClick}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: alpha("#fff", 0.9) },
                }}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

