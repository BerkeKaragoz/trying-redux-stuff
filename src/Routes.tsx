import Home from "@/modules/Home";
import React from "react";
import { Route, Routes, RoutesProps } from "react-router";
import Chat from "@/modules/Chat";

type Props = {
  location?: RoutesProps["location"];
};

const AppRoutes = ({ location }: Props) => (
  <Routes>
    <Route index element={<Home />} />
    <Route path="/chat" element={<Chat />} />

    <Route path="*" element={<h1>404 Not Found</h1>} />
  </Routes>
);

export default AppRoutes;
