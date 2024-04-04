import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import axios from "axios";
  
const API_HOST = "https://api.ticketseller.lat";
// const API_HOST = 'http://localhost:8000';

const Home = () => {
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const statusResponse = await axios.get(`${API_HOST}/workers_status`);
      setStatus(statusResponse.data.status);
    };
    fetchStatus();
  }, []);

  return (
    <Layout>
      <h1>Home Page</h1>
      
      <ul>
        <li>Verification workers service status: <b>{status ? "available" : "unavailable"}</b></li>
      </ul>
      
    </Layout>
  );
};
  
export default Home;
