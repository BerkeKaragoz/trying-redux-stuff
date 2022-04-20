import Main from "@/components/Main";
import { useAppDispatch } from "@/redux/utils";
import { Link } from "react-router-dom";

const Home = () => {
  const dispatch = useAppDispatch();

  return (
    <Main>
      <h1>Home</h1>
      <Link to="/chat">CHAT</Link>
    </Main>
  );
};

export default Home;
