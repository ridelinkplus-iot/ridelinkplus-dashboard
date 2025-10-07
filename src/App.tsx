import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Crud from "./temp.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Crud ClassName="bg-black" />
      </div>
    </>
  );
}

export default App;
