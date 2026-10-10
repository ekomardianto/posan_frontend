import React from 'react';
import { Utensils } from 'lucide-react';
import StationOrderBoard from '../../components/orders/StationOrderBoard.jsx';
import { fetchKitchenOrders } from '../../services/orderService.js';

export default function KitchenOrdersPage() {
  return (
    <StationOrderBoard
      station="kitchen"
      fetchOrdersFunction={fetchKitchenOrders}
      title="Antrean Masakan Kitchen"
      subtitle="Kelola pesanan makanan berat, snack, croissant, dan pastry hangat langsung dari dapur POSAN."
      stationIcon={Utensils}
      themeColor="#EA580C"
    />
  );
}
