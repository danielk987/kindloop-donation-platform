import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Container,
  Box,
  Button,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../shared/stores/authStore";
import { usePermission } from "../../shared/hooks/usePermission";
import ConfirmationDialog from "../../shared/components/shared/ConfirmationDialog";
import ImageViewerModal from "../../shared/components/shared/ImageViewerModal";
import { useUserProfile, useDocumentUpload, useProfileImage } from "./hooks";
import {
  ProfileHeader,
  ContactInformation,
  AddressSection,
  BusinessInfoSection,
  DriverInfoSection,
  DocumentsSection,
  DonorRatingSection,
} from "./components";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [imageViewerTitle, setImageViewerTitle] = useState("");

  // If no userId provided, use current user's ID
  const effectiveUserId = userId || currentUser?.id;

  const canEditUsers = usePermission(["users.edit"]);
  const isOwnProfile = !userId || currentUser?.id === userId;
  const canEdit = isOwnProfile || canEditUsers;

  // Use custom hooks
  const {
    userData,
    isLoading,
    isEditing,
    setIsEditing,
    showConfirmDialog,
    setShowConfirmDialog,
    formData,
    handleFieldChange,
    handleNestedFieldChange,
    handleSave,
    handleConfirmSave,
    handleCancelEdit,
    updateMutation,
  } = useUserProfile(effectiveUserId);

  const { handleFileUpload, handleDeleteDocument } = useDocumentUpload(
    effectiveUserId!
  );

  const {
    uploadProfileImageMutation,
    removeProfileImageMutation,
    handleProfileImageSelect,
    handleProfileImageRemove,
    imageViewerOpen,
    setImageViewerOpen,
    selectedImageUrl,
    handleViewImage,
  } = useProfileImage(effectiveUserId!);

  if (isLoading) {
    return (
      <Container sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">
          {t("profile.userNotFound")}
        </Typography>
      </Container>
    );
  }

  const isBusinessUser =
    userData.role?.key === "business" || userData.businessInfo?.businessName;
  const isDriverUser =
    userData.role?.key === "driver" || userData.driverInfo?.licenseNumber;
  
  // Check if viewing public profile (limited data)
  const isPublicView = !isOwnProfile && !canEditUsers && !userData.email;

  const handleViewDocument = (url: string, title: string) => {
    setImageViewerTitle(title);
    handleViewImage(url);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          {t("common.back")}
        </Button>

        {/* Profile Header */}
        <ProfileHeader
          userData={userData}
          isEditing={isEditing}
          canEdit={canEdit}
          onEditClick={() => setIsEditing(true)}
          onSaveClick={handleSave}
          onCancelClick={handleCancelEdit}
          onImageSelect={handleProfileImageSelect}
          onImageRemove={handleProfileImageRemove}
          isUploadingImage={uploadProfileImageMutation.isPending || removeProfileImageMutation.isPending}
        />
      </Box>

      {isPublicView ? (
        /* Public Profile View - Limited Information */
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("profile.publicProfile")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("profile.publicProfileDescription")}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Left Column - Personal Info */}
          <Grid item xs={12} md={8}>
            {/* Contact Information */}
            <Box sx={{ mb: 3 }}>
              <ContactInformation
                formData={formData}
                userData={userData}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
                onNestedFieldChange={handleNestedFieldChange}
              />
            </Box>

            {/* Address */}
            <Box sx={{ mb: 3 }}>
              <AddressSection
                formData={formData}
                isEditing={isEditing}
                onNestedFieldChange={handleNestedFieldChange}
              />
            </Box>

            {/* Business Info */}
            {isBusinessUser && (
              <Box sx={{ mb: 3 }}>
                <BusinessInfoSection
                  formData={formData}
                  isEditing={isEditing}
                  onNestedFieldChange={handleNestedFieldChange}
                />
              </Box>
            )}

          {/* Driver Info */}
          {isDriverUser && (
            <Box sx={{ mb: 3 }}>
              <DriverInfoSection
                formData={formData}
                userData={userData}
                userId={effectiveUserId!}
                isEditing={isEditing}
                onNestedFieldChange={handleNestedFieldChange}
              />
            </Box>
          )}

          {/* Donor Rating */}
          {userData.donorRating && userData.donorRating > 0 && (
            <Box sx={{ mb: 3 }}>
              <DonorRatingSection
                userId={effectiveUserId!}
                donorRating={userData.donorRating}
                donorRatingCount={userData.donorRatingCount || 0}
              />
            </Box>
          )}
        </Grid>

          {/* Right Column - Documents */}
          <Grid item xs={12} md={4}>
            <DocumentsSection
              userData={userData}
              isEditing={isEditing}
              onFileUpload={handleFileUpload}
              onDeleteDocument={handleDeleteDocument}
              onViewDocument={handleViewDocument}
            />
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSave}
        title={t("profile.confirmUpdateTitle")}
        message={t("profile.confirmUpdateMessage")}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        type="warning"
        loading={updateMutation.isPending}
      />

      {/* Image Viewer */}
      <ImageViewerModal
        open={imageViewerOpen}
        onClose={() => {
          setImageViewerOpen(false);
          setImageViewerTitle("");
        }}
        imageUrl={selectedImageUrl}
        title={imageViewerTitle || t("profile.viewImage")}
      />
    </Container>
  );
};

export default UserProfilePage;
