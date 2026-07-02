"use client";

import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { Check, Monitor, Moon, Sun } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface ThemeSwitcherProps {
  labels: {
    light: string;
    dark: string;
    system: string;
  };
}

export function ThemeSwitcher({ labels }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled className="justify-start">
            <Sun />
            <span className="group-data-[collapsible=icon]:hidden">
              {labels.light}
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const currentIcon =
    theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const CurrentIcon = currentIcon;

  const options = [
    { value: "light", label: labels.light, icon: Sun },
    { value: "dark", label: labels.dark, icon: Moon },
    { value: "system", label: labels.system, icon: Monitor },
  ] as const;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton asChild className="justify-start">
            <DropdownMenuTrigger>
              <CurrentIcon />
              <span className="group-data-[collapsible=icon]:hidden">
                {options.find((o) => o.value === theme)?.label ?? labels.system}
              </span>
            </DropdownMenuTrigger>
          </SidebarMenuButton>
          <DropdownMenuContent side="top" align="start" className="w-48">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <option.icon />
                  {option.label}
                </span>
                {theme === option.value && <Check className="text-accent" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
