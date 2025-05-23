import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Button, Row, Col, Select, Typography } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/pt-br';
import NewAppointmentForm from '../components/NewAppointmentForm';
// ... existing code ...

moment.locale('pt-br');

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [appointments, setAppointments] = useState([]);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    // Fetch appointments, clients and services from your API or local storage
    fetchAppointments(currentDate.month(), currentDate.year());
    fetchClients();
    fetchServices();
  }, [currentDate]);
  
  const fetchAppointments = async (month, year) => {
    try {
      // Replace with your actual API call
      // const response = await api.get(`/appointments?month=${month}&year=${year}`);
      // setAppointments(response.data);
      
      // Mock data for demonstration
      setAppointments([
        {
          id: 1,
          startDateTime: moment().hour(10).minute(0),
          endDateTime: moment().hour(11).minute(0),
          clientId: 1,
          clientName: 'Maria Silva',
          serviceId: 1,
          serviceName: 'Corte de Cabelo'
        },
        // More appointments...
      ]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };
  
  const fetchClients = async () => {
    // Mock data for demonstration
    setClients([
      { id: 1, name: 'Maria Silva' },
      { id: 2, name: 'João Santos' },
      // More clients...
    ]);
  };
  
  const fetchServices = async () => {
    // Mock data for demonstration
    setServices([
      { id: 1, name: 'Corte de Cabelo', duration: 60, price: 50 },
      { id: 2, name: 'Manicure', duration: 45, price: 35 },
      // More services...
    ]);
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'month'));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => prev.clone().add(1, 'month'));
  };
  
  const handleSaveAppointment = (newAppointment) => {
    // In a real app, you would send this to your API
    // const saveAppointment = async () => {
    //   const response = await api.post('/appointments', newAppointment);
    //   setAppointments(prev => [...prev, response.data]);
    // };
    // saveAppointment();
    
    // For demonstration, we'll just add it to the current state
    setAppointments(prev => [...prev, newAppointment]);
  };
  
  const handleCreateClient = (newClient) => {
    // Logic to save new client
    setClients(prev => [...prev, newClient]);
    return newClient; // Return for select dropdown update
  };
  
  const handleCreateService = (newService) => {
    // Logic to save new service
    setServices(prev => [...prev, newService]);
    return newService; // Return for select dropdown update
  };
  
  const dateCellRender = (value) => {
    // Filter appointments for this day
    const dayAppointments = appointments.filter(appointment => 
      appointment.startDateTime.date() === value.date() && 
      appointment.startDateTime.month() === value.month() && 
      appointment.startDateTime.year() === value.year()
    );
    
    if (dayAppointments.length === 0) return null;
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayAppointments.map(appointment => (
          <li key={appointment.id}>
            <Badge 
              status="processing" 
              text={`${appointment.startDateTime.format('HH:mm')} - ${appointment.clientName}`} 
            />
          </li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="agenda-container">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={2}>Agenda</Typography.Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setShowNewAppointmentForm(true)}
          >
            Novo Agendamento
          </Button>
        </Col>
      </Row>
      
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button icon={<LeftOutlined />} onClick={handlePrevMonth} />
          <span style={{ margin: '0 16px', fontSize: 16 }}>
            {currentDate.format('MMMM YYYY').replace(/^\w/, c => c.toUpperCase())}
          </span>
          <Button icon={<RightOutlined />} onClick={handleNextMonth} />
        </Col>
        <Col>
          <Button onClick={() => setCurrentDate(moment())}>Hoje</Button>
        </Col>
      </Row>
      
      <Calendar 
        value={currentDate}
        dateCellRender={dateCellRender}
        onPanelChange={(date) => setCurrentDate(date)}
        mode="month"
      />
      
      <NewAppointmentForm 
        visible={showNewAppointmentForm}
        onClose={() => setShowNewAppointmentForm(false)}
        onSave={handleSaveAppointment}
        clients={clients}
        services={services}
        onCreateClient={handleCreateClient}
        onCreateService={handleCreateService}
      />
    </div>
  );
};

export default Agenda; 