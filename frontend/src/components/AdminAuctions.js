import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const API_HOST = 'https://api.ticketseller.lat';
// const API_HOST = 'http://localhost:8000';

const AdminAuctions = () => {
  const [tickets, setTickets] = useState([]);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.sub?.trim() !== "auth0|6499edf47232ab62b7b2f38f") {
      alert("ERROR: User is not authorized to see this page");
      navigate("/"); // Redirect to the desired page
      return;
    }

    fetch(`${API_HOST}/events`)
      .then(response => response.json())
      .then(data => {
        const filteredTickets = data.tickets.filter(ticket => ticket.availableTickets && ticket.availableTickets.amount !== null);
        setTickets(filteredTickets);
      })
      .catch(error => console.error(error));
  }, [user]);

  const handleAuctionClick = async (ticket) => {
    try {
      const quantity = prompt(`How many ${ticket.name} tickets do you want to auction?`);
      const quantityInt = parseInt(quantity);
      const event_id_encoded = encodeURIComponent(ticket.event_id.trim());

      const token = await getAccessTokenSilently();

      const options = {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(`${API_HOST}/auctions`, { event_id: event_id_encoded, quantity: quantityInt }, options);

      if (response.status === 201) {
        alert("Auction created successfully.");
      } else {
        alert('Error creating auction. Please try again later');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <h1>Auction Tickets</h1>
      <div>
        <ul>
          {tickets.map(ticket => (
            <li key={ticket.event_id}>
              <button onClick={() => handleAuctionClick(ticket)}>Auction</button>
              <p>Name: {ticket.name}</p>
              <p>Date: {ticket.date}</p>
              <p>Price: {ticket.price}</p>
              <p>Quantity: {ticket.quantity}</p>
              <p>Location: {ticket.location}</p>
              <p>Latitude: {ticket.latitude}</p>
              <p>Longitude: {ticket.longitude}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default AdminAuctions;
