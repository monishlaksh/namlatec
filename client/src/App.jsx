import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HotelsPage from "./pages/HotelsPage";
import HotelDetailPage from "./pages/HotelDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HotelsPage />} />
      <Route path="/hotels/:id" element={<HotelDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
