import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexRoute,
});

function AdminIndexRoute() {
  const navigate = useNavigate();
  const { admin } = useAuth();

  useEffect(() => {
    navigate({ to: admin ? "/admin/dashboard" : "/admin/auth", replace: true });
  }, [admin, navigate]);

  return null;
}
