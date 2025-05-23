import React, { createContext, useState, useEffect, useContext } from 'react';
import moment from 'moment';

const AppointmentContext = createContext();

export const useAppointments = () => useContext(AppointmentContext);

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load data from localStorage on mount
    const loadData = () => {
      try {
        const storedAppointments = localStorage.getItem('appointments');
        const storedClients = localStorage.getItem('clients');
        const storedServices = localStorage.getItem('services');
        
        if (storedAppointments) {
          // Parse dates back to moment objects
          const parsedAppointments = JSON.parse(storedAppointments).map(app => ({
            ...app,
            startDateTime: moment(app.startDateTime),
            endDateTime: moment(app.endDateTime)
          }));
          setAppointments(parsedAppointments);
        }
        
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }
        
        if (storedServices) {
          setServices(JSON.parse(storedServices));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      // Convert moment objects to ISO strings for storage
      const appointmentsToStore = appointments.map(app => ({
        ...app,
        startDateTime: app.startDateTime.toISOString(),
        endDateTime: app.endDateTime.toISOString()
      }));
      
      localStorage.setItem('appointments', JSON.stringify(appointmentsToStore));
      localStorage.setItem('clients', JSON.stringify(clients));
      localStorage.setItem('services', JSON.stringify(services));
    }
  }, [appointments, clients, services, loading]);
  
  const addAppointment = (appointment) => {
    setAppointments(prev => [...prev, appointment]);
    return appointment;
  };
  
  const updateAppointment = (id, updatedData) => {
    setAppointments(prev => 
      prev.map(app => app.id === id ? { ...app, ...updatedData } : app)
    );
  };
  
  const deleteAppointment = (id) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };
  
  const addClient = (client) => {
    const newClient = { ...client, id: client.id || Date.now() };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };
  
  const addService = (service) => {
    const newService = { ...service, id: service.id || Date.now() };
    setServices(prev => [...prev, newService]);
    return newService;
  };
  
  const getAppointmentsByMonth = (month, year) => {
    return appointments.filter(app => 
      app.startDateTime.month() === month && 
      app.startDateTime.year() === year
    );
  };
  
  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        clients,
        services,
        loading,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addClient,
        addService,
        getAppointmentsByMonth
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
}; 