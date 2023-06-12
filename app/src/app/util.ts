import React, { useEffect } from "react";

/**
 * Hook that alerts clicks outside of the passed ref
 */
export const useOutsideAlerter = (
  ref: React.RefObject<any>,
  callback: () => void
): void => {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};
