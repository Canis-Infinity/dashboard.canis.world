// @ts-nocheck
import {
  History,
  Inbox,
  Link2,
  LayoutDashboard,
  PawPrint,
  UserRound,
} from "lucide-react";

export const WORLD_NAVIGATION = [
  {
    section: "status",
    title: "今日狀態",
    description: "管理首頁的心情、近況與出沒地點。",
  },
  {
    section: "profile",
    title: "角色介紹",
    description: "管理 Canis World 的公開角色簡介。",
  },
  {
    section: "entries",
    title: "日常紀錄",
    description: "管理日常文字、照片、精選與公開狀態。",
  },
  {
    section: "content",
    title: "頁面文案",
    description: "管理首頁導覽、內容提醒與區塊文案。",
  },
  {
    section: "faqs",
    title: "常見問題",
    description: "管理問題、回答與顯示順序。",
  },
  {
    section: "features",
    title: "資訊卡片",
    description: "管理首頁底部的資訊卡片。",
  },
  {
    section: "footer",
    title: "頁尾版權",
    description: "管理頁尾擁有者、連結與權利文字。",
  },
].map((item) => ({
  ...item,
  href: `/canis-world/${item.section}`,
  icon: PawPrint,
}));

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
    items: [
      {
        title: "網站管理",
        href: "/canis-world/status",
        icon: PawPrint,
        children: WORLD_NAVIGATION,
      },
    ],
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

export function getNavigationLinks(items) {
  return items.flatMap((item) => item.children || [item]);
}

export function findNavigationItem(pathname) {
  return NAVIGATION_GROUPS.flatMap((group) =>
    getNavigationLinks(group.items),
  ).find((item) => item.href === pathname);
}
