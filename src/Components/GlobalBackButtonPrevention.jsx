import { useLayoutEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

/** How many same-URL entries to stack on load so Back cannot reach Google/referrer quickly. */
const INITIAL_TRAP_LAYERS = 40;
/** After each blocked Back, add this many entries so repeated Back keeps burning traps, not the real history. */
const REPLENISH_LAYERS = 3;

/**
 * Blocks browser Back from leaving the SPA (e.g. second Back jumping to Google).
 * A shallow stack (2 dummy entries) is exhausted after one or two Back presses;
 * we seed many layers and replenish on each popstate.
 */
function GlobalBackButtonPrevention() {
  const location = useLocation();
  const navigate = useNavigate();
  const locRef = useRef(location);
  locRef.current = location;

  useLayoutEffect(() => {
    const loc = locRef.current;
    const url = `${loc.pathname}${loc.search}${loc.hash}`;
    for (let i = 0; i < INITIAL_TRAP_LAYERS; i++) {
      window.history.pushState(null, "", url);
    }
  }, []);

  useLayoutEffect(() => {
    const onPopState = () => {
      const loc = locRef.current;
      const url = `${loc.pathname}${loc.search}${loc.hash}`;

      for (let i = 0; i < REPLENISH_LAYERS; i++) {
        window.history.pushState(null, "", url);
      }

      flushSync(() => {
        navigate(
          {
            pathname: loc.pathname,
            search: loc.search,
            hash: loc.hash,
            state: loc.state,
          },
          { replace: true }
        );
      });
    };

    window.addEventListener("popstate", onPopState, true);
    return () => window.removeEventListener("popstate", onPopState, true);
  }, [navigate]);

  return null;
}

export default GlobalBackButtonPrevention;
