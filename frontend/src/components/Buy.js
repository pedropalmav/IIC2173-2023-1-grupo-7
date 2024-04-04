import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { useAuth0 } from "@auth0/auth0-react";

const API_HOST = 'https://api.ticketseller.lat';
// const API_HOST = 'http://localhost:8000';

const Buy = () => {
  const [tickets, setTickets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState([]);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    fetch(`${API_HOST}/events?page=${currentPage}`)
        .then(response => response.json())
        .then(data => {
          const filteredTickets = data.tickets.filter(ticket => ticket.availableTickets && ticket.availableTickets.amount !== null);
    
          setTickets(filteredTickets);
          setLastPage(data.lastPage);
        })
        .catch(error => console.error(error));
    }, [currentPage, user]);
    
    const handleTicketClick = async (ticket) => {
      try{
        if (!isAuthenticated) {
          alert('Please log in to buy tickets.');
          return;
        }
        const quantity = prompt(`How many ${ticket.name} tickets do you want to buy?`);
        const quantityInt = parseInt(quantity);
        const event_id_encoded = encodeURIComponent(ticket.event_id.trim());
        const user_id_encoded = encodeURIComponent(user.sub.trim());
  
        const token = await getAccessTokenSilently();

        const options = { 
          method: 'POST',
          headers: {Authorization: `Bearer ${token}`}
         };
        
        const response = await fetch(`${API_HOST}/buy?event_id=${event_id_encoded}&quantity=${quantityInt}&user_id=${user_id_encoded}&email=${user.email}`, options);   
                
        if (response.status === 201) {
          alert("Ticket bought successfully. When the payment is confirmed, you will receive an email with the ticket.");
        } else {
          alert('Error buying ticket. Please try again later');
        }        
      }
    catch (error) {
      console.error(error);
    }
    };
    
  const nextPage = () => {
    if (currentPage < lastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Layout>
      <h1>Buy tickets</h1>
      <div>
        <ul>
          {tickets.map(ticket => (
            <li key={ticket.event_id}>
              <button onClick={() => handleTicketClick(ticket)}>{ticket.name}</button>
              <p>Date: {ticket.date}</p>
              <p>Price: {ticket.price}</p>
              <p>Quantity: {ticket.quantity}</p>
              <p>Location: {ticket.location}</p>
              <p>Latitude: {ticket.latitude}</p>
              <p>Longitude: {ticket.longitude}</p>
            </li>
          ))}
        </ul>
        <div>
          <button onClick={previousPage}>Previous</button>&nbsp;
          <span>Page {currentPage} of {lastPage}</span>
          &nbsp;<button onClick={nextPage}>Next</button>
        </div>
      </div>
    </Layout>
  );
};

export default Buy;
