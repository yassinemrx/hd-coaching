type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const base = (className?: string, size = 20, strokeWidth = 2) => ({
  className,
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4" />
    <path d="M9 22V12h6v10" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const DumbbellIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="m6.5 6.5 11 11" />
    <path d="m21 21-1-1" />
    <path d="m3 3 1 1" />
    <path d="m18 22 4-4" />
    <path d="m2 6 4-4" />
    <path d="m3 10 7-7" />
    <path d="m14 21 7-7" />
  </svg>
);

export const SaladIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M7 21h10" />
    <path d="M5 21h.01" />
    <path d="M19 21h.01" />
    <path d="M2 14h20" />
    <path d="M2 14a10 10 0 0 1 20 0" />
    <path d="M12 4v.01" />
  </svg>
);

export const ChartIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const PencilIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const TargetIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const CameraIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M12 3v6m0 6v6M3 12h6m6 0h6M5.5 5.5l4.2 4.2m4.6 4.6 4.2 4.2M18.5 5.5l-4.2 4.2m-4.6 4.6-4.2 4.2" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const AppleIcon = (p: IconProps) => (
  <svg {...base(p.className, p.size, p.strokeWidth)}>
    <path d="M19 7c-3 0-3 2-5 2s-2-2-5-2c-3 0-5 2-5 6 0 6 4 9 5 9 1 0 2-1 3-1s2 1 3 1c1 0 5-3 5-9 0-4-1-6-1-6Z" />
    <path d="M12 7c0-2 1-3 3-3" />
  </svg>
);
