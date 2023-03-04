import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import Client from "./components/Client";
import Pharmacist from "./components/Pharmacist";
import DoctorInterface from "./components/DoctorInterface";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="doctor" element={<DoctorInterface />} />
          <Route path="client" element={<Client />} />
          <Route path="pharmacist" element={<Pharmacist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
