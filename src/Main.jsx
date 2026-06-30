import { lazy, Suspense, useEffect } from "react";
import AppLoader from "./Pages/AppLoader";
import NoInternetOverlay from "./Components/NoInternetOverlay";
import GlobalBackButtonPrevention from "./Components/GlobalBackButtonPrevention";

const App = lazy(() => import("./App"));

const Main = () => {
  const handleKeyDown = (e) => {
    if (e.target.tagName === "INPUT" && e.target.type === "number") {
      const input = e.target;
      const value = Number(input.value);

      const invalidKeys = ["e", "E", "+", "-"];

      if (invalidKeys.includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "." && input.value === "") {
        e.preventDefault();
      }

      if (e.key === "." && input.value.includes(".")) {
        e.preventDefault();
      }

      // Prevent ArrowDown below 0
      if (e.key === "ArrowDown") {
        if (value <= 0 || input.value === "") {
          e.preventDefault();
        }
      }
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <Suspense fallback={<AppLoader  />}>
      <GlobalBackButtonPrevention />
      <NoInternetOverlay>
        <App />
      </NoInternetOverlay>
    </Suspense>
  );
};
export default Main;
