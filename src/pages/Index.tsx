import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after splash
    const timer = setTimeout(() => {
      navigate("/home");
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return null;
};

export default Index;
