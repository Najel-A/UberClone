import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // or whatever routing you use

export default function Protected({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  return <>{children}</>;
}
