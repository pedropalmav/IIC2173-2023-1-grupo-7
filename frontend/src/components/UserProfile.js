import React, { useEffect, useState } from "react";
import Layout from './Layout';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const API_HOST = 'https://api.ticketseller.lat';
// const API_HOST = 'http://localhost:8000';

const Profile = () => {
  const [tickets, setTickets] = useState([]);
  const [moneyToAdd, setMoneyToAdd] = useState(0);
  const [balance, setBalance] = useState(null);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  
    useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!isAuthenticated || !user || !user.sub) {
          navigate("/"); // Redirect to the desired page
          return;
        }
  
        const token = await getAccessTokenSilently();
  
        // Fetch tickets
        const user_id_encoded = encodeURIComponent(user.sub.trim());
  
        const options = {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await fetch(`${API_HOST}/requests/${user_id_encoded}`, options);
  
        const data = await response.json();
        if (response.status === 403) {
          alert('ERROR: User is not authorized to access this resource');
          return;
        }
        setTickets(data);
      } catch (error) {
        console.error(error);
        navigate("/"); // Redirect to the desired page
      }
    };
  
    const fetchProfile = async () => {
      if (user) {
        await checkBalance(user); // Fetch initial balance
  
        // Fetch tickets only after the balance is fetched
        fetchTickets();
      }
    };
  
    fetchProfile();
  }, [getAccessTokenSilently, isAuthenticated, user]);
  
  const addMoney = async () => {
    try {
      const token = await getAccessTokenSilently();

      await axios.post(`${API_HOST}/add_money`, {
        user_id: user.sub,
        money: parseFloat(moneyToAdd)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await checkBalance(user);
      alert('Money added successfully');
    } catch (error) {
      console.error(error);
      navigate("/"); // Redirect to the desired page
    }
  };

  const checkBalance = async (user) => {
    try {
      if (!user || !user.sub) {
        return;
      }

  
      const token = await getAccessTokenSilently();
      const user_id_encoded = encodeURIComponent(user.sub.trim());
  
      const options = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
  
      const response = await axios.get(`${API_HOST}/check_balance/?user_id=${user_id_encoded}`, options);
  
      if (response.status === 200) {
        setBalance(response.data); // Update the balance state
      }
  
    } catch (error) {
      console.error(error);
      navigate("/"); // Redirect to the desired page
    }
  };

  const handleMoneyChange = (event) => {
    setMoneyToAdd(event.target.value);
  };

  return (
    <Layout>
      <div>
        {user && Object.keys(user).length !== 0 ? (
          <div>
            <h1>User Profile</h1>
            <p>Email: {user.email}</p>
            <p>Money in wallet: {balance !== null ? balance : 0}</p>
            <input type="number" value={moneyToAdd} onChange={handleMoneyChange} />
            <button onClick={addMoney}>Add Money</button>
            {tickets.length !== 0? (
              <div>
                <h2>Tickets Bought:</h2>
                <ul>
                  {tickets.map((ticket) => (
                    <li key={ticket.Request.event.event_id}>
                      <p>Name: {ticket.Request.event.name}</p>
                      <p>Date: {ticket.Request.event.date}</p>
                      <p>Price: {ticket.Request.event.price}</p>
                      <p>Quantity: {ticket.Request.quantity}</p>
                      <p>Location: {ticket.Request.event.location}</p>
                      <p>Latitude: {ticket.Request.event.latitude}</p>
                      <p>Longitude: {ticket.Request.event.longitude}</p>
                      <p>Estado: {ticket.Request.valid === null ? "Confirmación pendiente" : ticket.Request.valid ? "Compra confirmada" : "Compra rechazada"}</p>
                      {
                        ticket.Request.pdf ? (<a href={ticket.Request.pdf} target="_blank" rel="noreferrer">Ver entrada</a>) : (<p>Entrada no disponible</p>)
                      }
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <h2>User has not bought tickets</h2>
            )}
          </div>
        ) : (
          <h2>User is not login</h2>
        )}
      </div>
    </Layout>
  );
  
};

export default Profile;
