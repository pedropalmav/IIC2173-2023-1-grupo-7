import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Layout from './Layout';

import L from 'leaflet';
import icon from './assets/marker.png';
import 'leaflet/dist/leaflet.css';
import './styles/map.css';

const API_HOST = 'https://api.ticketseller.lat';
// const API_HOST = 'http://localhost:8000';

// Define a custom icon
const markerIcon = new L.Icon({
  iconUrl: icon,
  iconSize: [25, 25],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

const Map = () => {
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      let allTickets = [];
      let page = 1;
      let lastPage = 1;
      
      while (page <= lastPage) {
        const response = await fetch(`${API_HOST}/events?page=${page}`);
        const data = await response.json();
        allTickets = allTickets.concat(data.tickets);
        lastPage = data.lastPage;
        page++;
      }
      setTickets(allTickets);
    };
    
    fetchData();
    }, []);

    return (
      <Layout>
          <h1>Show Tickets</h1>
          <div className='leaflet-container'>
            <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {tickets.map(ticket => (
                <Marker position={[ticket.latitude, ticket.longitude]} key={ticket.event_id} icon={markerIcon}>
                  <Popup>
                    <h3>{ticket.name}</h3>
                    <p>Date: {ticket.date}</p>
                    <p>Price: {ticket.price}</p>
                    <p>Quantity: {ticket.quantity}</p>
                    <p>Location: {ticket.location}</p>
                    <p>Latitude: {ticket.latitude}</p>
                    <p>Longitude: {ticket.longitude}</p>
                  </Popup>
                </Marker>
            ))}
            </MapContainer>
          </div>
      </Layout>
    );
  };
  
  export default Map;
