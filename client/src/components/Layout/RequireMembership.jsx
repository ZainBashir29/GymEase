import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios.js";

const RequireMembership = ({ children }) => {
  const [hasMembership, setHasMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkMembership = async () => {
      const fetchCurrent = () =>
        api.get(`/memberships/current?_t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

      try {
        await fetchCurrent();
        if (isMounted) setHasMembership(true);
      } catch {
        // If coming directly after payment or verification, or in case of brief propagation lag,
        // retry once after 800ms before redirecting
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          await fetchCurrent();
          if (isMounted) {
            setHasMembership(true);
            return;
          }
        } catch {
          // Final attempt failed
        }

        if (isMounted) setHasMembership(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkMembership();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
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
