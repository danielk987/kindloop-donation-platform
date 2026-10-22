import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { Add, Edit, Delete, VpnKey, Close, Refresh } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRoles,
  deleteRole,
  createRole,
  updateRole,
  addPermissionToRole,
  removePermissionFromRole,
  getPermissionsByCategory,
  type Role,
  type Permission,
} from "../../../shared/services/userService";
import { toast } from "react-toastify";

const RoleManagement = () => {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openPermissions, setOpenPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleKey, setRoleKey] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
    refetchOnMount: "always", // Always refetch when tab is visited
  });

  const { data: permissionsData } = useQuery({
    queryKey: ["permissions-by-category"],
    queryFn: getPermissionsByCategory,
    enabled: openDialog || openPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete role");
    },
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
      handleCloseDialog();
    },
  });

  const addPermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: string; permId: string }) =>
      addPermissionToRole(roleId, permId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Permission added to role");
    },
  });

  const removePermMutation = useMutation({
    mutationFn: ({ roleId, permId }: { roleId: string; permId: string }) =>
      removePermissionFromRole(roleId, permId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Permission removed from role");
    },
  });

  const handleCreate = () => {
    setSelectedRole(null);
    setRoleName("");
    setRoleKey("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setOpenDialog(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleKey(role.key);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions.map((p: any) => p._id));
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
  };

  const handleSubmit = () => {
    if (!roleName || !roleKey || !roleDescription) {
      toast.error("Please fill in all fields");
      return;
    }

    const roleData = {
      name: roleName,
      key: roleKey.toLowerCase().replace(/\s+/g, "_"),
      description: roleDescription,
      permissions: selectedPermissions,
      isActive: true,
    };

    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole._id, data: roleData as any });
    } else {
      createMutation.mutate(roleData as any);
    }
  };

  const handleDelete = (role: Role) => {
    if (role.isSystemRole) {
      toast.error("Cannot delete system role");
      return;
    }
    if (
      window.confirm(
        `Delete role "${role.name}"? This action cannot be undone.`
      )
    ) {
      deleteMutation.mutate(role._id);
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setOpenPermissions(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            {t("admin.roles.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data?.data?.length || 0} {t("admin.roles.noRoles").replace("No roles found", "total roles")}
          </Typography>
        </Box>
        <Stack direction="row" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
            sx={{
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha("#359364", 0.04),
              },
            }}
          >
            {t("admin.refresh")}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
              boxShadow: "0 4px 12px rgba(53, 147, 100, 0.25)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(53, 147, 100, 0.35)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s",
            }}
          >
            {t("admin.roles.createRole")}
          </Button>
        </Stack>
      </Stack>

      {/* Table */}
      <TableContainer
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#f8fafc",
                borderBottom: "2px solid",
                borderColor: "divider",
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  py: 2,
                }}
              >
                {t("admin.name")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("admin.roleKey")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("admin.description")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("admin.permissions")}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("admin.systemRole")}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {t("admin.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  <Typography variant="body2">{t("admin.loading")}</Typography>
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  <Typography variant="body2">{t("admin.roles.noRoles", "No roles found")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((role: Role) => (
                <TableRow
                  key={role._id}
                  hover
                  sx={{
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: alpha("#359364", 0.03),
                      transform: "scale(1.001)",
                    },
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                      {role.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={role.key}
                      size="small"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: alpha("#6366f1", 0.1),
                        color: "#6366f1",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={`${role.permissions.length} permissions`}
                      size="small"
                      sx={{
                        bgcolor: alpha("#359364", 0.12),
                        color: "#359364",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    {role.isSystemRole ? (
                      <Chip
                        label={t("admin.yes")}
                        size="small"
                        color="warning"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <Chip
                        label={t("admin.no")}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                          borderRadius: "6px",
                          bgcolor: alpha("#94a3b8", 0.1),
                          color: "#64748b",
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2.5 }}>
                    <Stack direction="row" gap={0.5} justifyContent="flex-end">
                      <Tooltip title={t("admin.editRole")} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(role)}
                          sx={{
                            color: "#3b82f6",
                            bgcolor: alpha("#3b82f6", 0.08),
                            "&:hover": {
                              bgcolor: alpha("#3b82f6", 0.16),
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s",
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!role.isSystemRole && (
                        <Tooltip title={t("admin.deleteRole")} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(role)}
                            sx={{
                              color: "#ef4444",
                              bgcolor: alpha("#ef4444", 0.08),
                              "&:hover": {
                                bgcolor: alpha("#ef4444", 0.16),
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {selectedRole ? t("admin.editRole") : t("admin.createNewRole")}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("admin.roleName")}
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t("admin.roleKey")}
                value={roleKey}
                onChange={(e) => setRoleKey(e.target.value)}
                fullWidth
                required
                disabled={selectedRole?.isSystemRole}
                helperText={t("admin.roles.keyHelper", "Lowercase, no spaces (use underscores)")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("admin.description")}
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                {t("admin.selectPermissions")}:
              </Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 2,
                }}
              >
                {permissionsData?.data?.map((category: any) => (
                  <Box key={category.category} sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      textTransform="capitalize"
                      color="primary"
                      sx={{ mb: 1 }}
                    >
                      {category.category}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 0.5,
                      }}
                    >
                      {category.permissions.map((perm: Permission) => (
                        <FormControlLabel
                          key={perm._id}
                          control={
                            <Checkbox
                              checked={selectedPermissions.includes(perm._id)}
                              onChange={() => togglePermission(perm._id)}
                              size="small"
                            />
                          }
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Typography variant="body2" noWrap>
                                {perm.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{
                                  fontSize: "0.7rem",
                                  opacity: 0.7,
                                }}
                              >
                                ({perm.key})
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
            sx={{
              background: "linear-gradient(135deg, #359364 0%, #24754f 100%)",
            }}
          >
            {selectedRole ? t("common.save") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={openPermissions}
        onClose={() => setOpenPermissions(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              {selectedRole?.name} - Permissions
            </Typography>
            <IconButton onClick={() => setOpenPermissions(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {selectedRole?.permissions.map((perm: any) => (
              <ListItem key={perm._id}>
                <ListItemText primary={perm.name} secondary={perm.key} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() =>
                      removePermMutation.mutate({
                        roleId: selectedRole._id,
                        permId: perm._id,
                      })
                    }
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPermissions(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
