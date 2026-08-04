// @ts-nocheck
import {
  History,
  Inbox,
  Link2,
  LayoutDashboard,
  PawPrint,
  UserRound,
} from "lucide-react";

export const NAVIGATION_GROUPS = [
  {
    label: "總覽",
    items: [{ title: "儀表板", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Canis Den",
    items: [
      { title: "個人資料", href: "/profile", icon: UserRound },
      { title: "連結管理", href: "/links", icon: Link2 },
    ],
  },
  {
    label: "Canis World",
    items: [{ title: "網站管理", href: "/canis-world", icon: PawPrint }],
  },
  {
    label: "互動",
    items: [{ title: "聯絡表單", href: "/contacts", icon: Inbox }],
  },
  {
    label: "系統",
    items: [{ title: "事件紀錄", href: "/event-logs", icon: History }],
  },
];

export function findNavigationItem(pathname) {
  return NAVIGATION_GROUPS.flatMap((group) => group.items).find(
    (item) => item.href === pathname,
  );
}
