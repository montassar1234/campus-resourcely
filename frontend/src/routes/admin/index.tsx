import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  component: AdminIndexRoute,
});

function AdminIndexRoute() {
  const navigate = useNavigate();
  const { admin, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    navigate({ to: admin ? "/admin/dashboard" : "/admin/auth", replace: true });
  }, [admin, ready, navigate]);

  return null;
}
