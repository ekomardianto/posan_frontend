import React from 'react';
import { Coffee } from 'lucide-react';
import StationOrderBoard from '../../components/orders/StationOrderBoard.jsx';
import { fetchBaristaOrders } from '../../services/orderService.js';

export default function BaristaOrdersPage() {
  return (
    <StationOrderBoard
      station="barista"
      fetchOrdersFunction={fetchBaristaOrders}
      title="Antrean Minuman Barista"
      subtitle="Kelola pesanan espresso, signature mocktail, latte, dan minuman lainnya langsung ke mesin kopi."
      stationIcon={Coffee}
      themeColor="#8C5E3C"
    />
  );
}
