import { Suspense } from "react";
import LinearLoader from "./LinearLoader";

export default function LazyLoad({ children }) {
  return <Suspense fallback={<LinearLoader />}>{children}</Suspense>;
}
