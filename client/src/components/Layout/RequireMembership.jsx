import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios.js";

const RequireMembership = ({ children }) => {
  const [hasMembership, setHasMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        await api.get("/memberships/current");
        setHasMembership(true);
      } catch {
        setHasMembership(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMembership();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!hasMembership) {
    return (
      <Navigate to="/pricing" replace state={{ requiresMembership: true }} />
    );
  }

  return children;
};

export default RequireMembership;
