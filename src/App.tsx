import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AppRoutes from "@/Routes";
import { useEffect } from "react";
import { setupPeerAG } from "@/redux/actions";
import { useAppDispatch, useAppSelector } from "@/redux/utils";

const App: React.FC<{}> = () => {
  const dispatch = useAppDispatch();
  const isClientPeerOpen = useAppSelector((state) => state.peer.isOpen);

  useEffect(() => {
    if (!isClientPeerOpen) {
      dispatch(setupPeerAG.pend());
    }
  }, [dispatch]);

  return (
    <>
      <Header />
      <AppRoutes />
      <Footer />
    </>
  );
};

export default App;
