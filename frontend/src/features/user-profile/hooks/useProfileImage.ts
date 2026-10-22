import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../shared/stores/authStore";

export const useProfileImage = (userId: string) => {
  const queryClient = useQueryClient();
  const { user: currentUser, setUser } = useAuthStore();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  // Profile image upload mutation (doesn't trigger re-approval)
  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profileImage", file);
      const response = await api.post("/users/upload-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      
      // Update auth store if this is the current user
      if (currentUser && currentUser.id === userId && data.profileImage) {
        setUser({
          ...currentUser,
          profileImage: data.profileImage,
        });
      }
      
      toast.success("Profile image updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to upload profile image"
      );
    },
  });

  // Profile image remove mutation
  const removeProfileImageMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/users/remove-profile-image");
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      
      // Update auth store if this is the current user
      if (currentUser && currentUser.id === userId) {
        setUser({
          ...currentUser,
          profileImage: undefined,
        });
      }
      
      toast.success("Profile image removed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to remove profile image"
      );
    },
  });

  const handleProfileImageSelect = (file: File) => {
    uploadProfileImageMutation.mutate(file);
  };

  const handleProfileImageRemove = () => {
    removeProfileImageMutation.mutate();
  };

  const handleViewImage = (url: string) => {
    setSelectedImageUrl(url);
    setImageViewerOpen(true);
  };

  return {
    uploadProfileImageMutation,
    removeProfileImageMutation,
    handleProfileImageSelect,
    handleProfileImageRemove,
    imageViewerOpen,
    setImageViewerOpen,
    selectedImageUrl,
    handleViewImage,
  };
};

