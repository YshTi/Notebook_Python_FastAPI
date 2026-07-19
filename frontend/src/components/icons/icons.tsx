import React from 'react';

export function IconArrowDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M9.449 12.031c0.134 0 0.237 0.041 0.341 0.145l6.208 6.244 6.243-6.244c0.104-0.103 0.192-0.133 0.299-0.129 0.126 0.005 0.234 0.048 0.349 0.163 0.104 0.104 0.145 0.207 0.145 0.341s-0.041 0.236-0.145 0.34l-6.559 6.559c-0.072 0.072-0.129 0.107-0.167 0.122-0.047 0.020-0.101 0.031-0.165 0.031-0.033 0-0.062-0.004-0.090-0.009l-0.077-0.022-0.070-0.040c-0.028-0.019-0.059-0.046-0.095-0.082l-6.592-6.591c-0.098-0.098-0.133-0.191-0.129-0.318 0.005-0.143 0.053-0.255 0.163-0.365 0.104-0.104 0.206-0.144 0.34-0.145z"></path>
    </svg>
  );
}

export function IconArrowUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M15.999 11.605c0.125 0 0.227 0.038 0.333 0.145l6.591 6.592c0.109 0.109 0.145 0.208 0.145 0.324s-0.035 0.215-0.145 0.324c-0.104 0.104-0.207 0.145-0.341 0.145s-0.236-0.041-0.34-0.145l-0.001-0.001-6.244-6.207-6.241 6.241c-0.104 0.104-0.192 0.133-0.299 0.129-0.126-0.005-0.234-0.047-0.349-0.161-0.104-0.104-0.145-0.207-0.145-0.341s0.040-0.237 0.145-0.341l6.559-6.559c0.107-0.107 0.207-0.144 0.332-0.145z"></path>
    </svg>
  );
}

export function IconNotesBlank(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props}>
      <use href="/sprite.svg#icon-notes-blank" />
    </svg>
  );
}

export function IconWarning(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
