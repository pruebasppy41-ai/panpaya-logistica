import LogisticaLayout from "@/components/LogisticaLayout";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LogisticaLayout>{children}</LogisticaLayout>;
}
