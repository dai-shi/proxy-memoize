import React, { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    innerWidth: globalThis?.innerWidth,
    innerHeight: globalThis?.innerHeight,
  });

  function handleWindowResize() {
    const { innerWidth, innerHeight } = window;
    setWindowSize({ innerWidth, innerHeight });
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return { height: windowSize?.innerHeight, width: windowSize?.innerWidth };
};
export { useWindowSize };
