export interface LayoutProps {
  children: React.ReactNode;
}

export interface NavbarProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
