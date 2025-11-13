import { useNavigate } from "react-router-dom";

export const useDashboard = () => {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const handleViewAll = () => {
    navigate("/purchase");
  };

  return {
    handleCardClick,
    handleViewAll,
  };
};