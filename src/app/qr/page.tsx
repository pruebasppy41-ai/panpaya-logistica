import QrDesigner from '@/components/qr/QrDesigner';

export const metadata = {
  title: 'Generador QR | Pan Pa Ya',
  description: 'Crea códigos QR personalizados con diseños artísticos',
};

export default function QrPage() {
  return <QrDesigner />;
}
