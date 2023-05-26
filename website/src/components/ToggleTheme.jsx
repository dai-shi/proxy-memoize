import React, { useEffect, useState } from 'react';

const htmlEl = globalThis.document?.getElementsByTagName('html')[0];

function changeTheme(mode) {
  if (mode === 'dark') {
    localStorage.setItem('theme', 'dark');
    htmlEl.classList.add('dark');
  } else {
    localStorage.setItem('theme', 'light');
    htmlEl.classList.remove('dark');
  }
}

export default function ToggleTheme() {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setMode('dark');
    } else {
      setMode('light');
    }
  }, []);

  const handleOnClick = () => {
    if (mode === 'light') {
      changeTheme('dark');
      setMode('dark');
    } else {
      changeTheme('light');
      setMode('light');
    }
  };
  return (
    <button
      className='relative rounded-25px border border-hex-ECF5FF border-2 w-221px h-50px flex justify-between items-center cursor-pointer p-2 dark:(bg-black border-0) <lg:w-107px <lg:h-38px <lg:rounded-19px <lg:p-1 <md:border-none <md:w-24px <md:h-24px'
      id='toggleTheme'
      onClick={handleOnClick}
    >
      <div
        className={`z-0 absolute  transition-all duration-500 ease-in-out w-1/2 h-85% rounded-24px bg-indigo dark:(bg-full-black) <lg:left:2px <md:w-100% <md:h-100% <md:rounded-full ${
          mode === 'light'
            ? 'left-6px <lg:left-4px <md:left-0px'
            : 'left-106px <lg:left-50px <md:left-0px <md:opacity-0'
        }`}
        id='switch'
      ></div>
      <div
        className={`z-1 relative flex flex-row justify-center gap-2 items-center w-109px <lg:w-50px <lg:gap-0 ${
          mode === 'dark' ? '<md:hidden' : ''
        }`}
      >
        <img
          src='/proxy-memoize/light-icon.svg'
          alt='light icon'
          className=''
        />
        <p className='font-Dm font-bold text-12px text-white dark:(text-light-gray) <lg:hidden'>
          Light
        </p>
      </div>
      <div
        className={`z-1 relative flex flex-row justify-center gap-2 items-center w-109px <lg:w-50px <lg:gap-0 ${
          mode === 'light' ? '<md:hidden' : ''
        }`}
      >
        <img src='/proxy-memoize/dark-icon.svg' alt='dark icon' className='' />
        <p className='font-Dm font-bold text-12px pt-1px text-black dark:(text-light-gray) <lg:hidden'>
          Dark
        </p>
      </div>
    </button>
  );
}
