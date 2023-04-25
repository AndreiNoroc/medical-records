import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";
import DoctorAction from "./components/doctor/DoctorAction";
import ClientInterface from "./components/client/ClientInterface";
import PharmacistGetData from "./components/pharmacist/PharmacistGet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="doctor" element={<DoctorAction />} />
          <Route path="client" element={<ClientInterface />} />
          <Route path="pharmacist" element={<PharmacistGetData />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
