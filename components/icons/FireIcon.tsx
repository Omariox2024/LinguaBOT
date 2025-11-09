
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const FireIcon: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.4,2.7c-1-1.8-3.3-2.3-4.9-1.1c-1.6,1.2-2,3.5-1.1,5.1l-1.1,1.1c-0.6,0.6-0.6,1.5,0,2.1s1.5,0.6,2.1,0l1.1-1.1 c1.6,1.2,3.9,0.7,5.1-1.1c0.8-1.1,0.8-2.6,0-3.7l3.1-3.1c0.2-0.2,0.2-0.5,0-0.7s-0.5-0.2-0.7,0l-3.1,3.1 C13.2,5.2,13.4,3.9,12.4,2.7z" />
    <path d="M8.9,13.2c-0.1,0.1-0.1,0.3,0,0.4l4,4c0.1,0.1,0.3,0.1,0.4,0l0,0c0.1-0.1,0.1-0.3,0-0.4l-4-4 C9.2,13.1,9,13.1,8.9,13.2L8.9,13.2z" />
    <path d="M14.5,18.7c-2.3,2.3-6.1,2.3-8.5,0c-2.3-2.3-2.3-6.1,0-8.5" />
  </svg>
);

export default FireIcon;
