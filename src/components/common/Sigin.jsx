import { useSelector } from "react-redux";

const companyFinalSiginImage = () => {
  const imageUrls = useSelector((state) => state?.company?.companyImage);
  const userSiginPath = useSelector(
    (state) => state?.company?.companyDetails?.company_sign
  );
  const userBaseUrl = imageUrls?.find(
    (img) => img.image_for == "Company"
  )?.image_url;
  const noImageUrl = imageUrls?.find(
    (img) => img.image_for === "No Image"
  )?.image_url;
  const cacheBuster = `?v=${Date.now()}`;
  const SiginImagePath = userSiginPath
    ? `${userBaseUrl}${userSiginPath}${cacheBuster}`
    : noImageUrl;
  return SiginImagePath;
};

export default companyFinalSiginImage;
