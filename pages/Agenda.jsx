import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Button, Row, Col, Select, Typography } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import NewAppointmentForm from '../components/NewAppointmentForm';
// ... existing code ...

// Configurar dayjs para usar o locale pt-br
dayjs.locale('pt-br');

// Helpers para manipulação de datas
const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

const formatTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date);
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Converter Date para dayjs
const dateToDay = (date) => {
  return dayjs(date);
};

// Converter dayjs para Date
const dayToDate = (day) => {
  return day.toDate();
};

const Agenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    // Fetch appointments, clients and services from your API or local storage
    fetchAppointments(currentDate.getMonth(), currentDate.getFullYear());
    fetchClients();
    fetchServices();
  }, [currentDate]);
  
  const fetchAppointments = async (month, year) => {
    try {
      // Replace with your actual API call
      // const response = await api.get(`/appointments?month=${month}&year=${year}`);
      // setAppointments(response.data);
      
      // Mock data for demonstration
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(10, 0, 0);
      
      const endTime = new Date(now);
      endTime.setHours(11, 0, 0);
      
      setAppointments([
        {
          id: 1,
          startDateTime: startTime,
          endDateTime: endTime,
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
    setCurrentDate(prev => addMonths(prev, -1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
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
    // Converter o valor dayjs para Date
    const valueDate = value.toDate();
    
    // Filter appointments for this day
    const dayAppointments = appointments.filter(appointment => {
      const appDate = appointment.startDateTime;
      return (
        appDate.getDate() === valueDate.getDate() && 
        appDate.getMonth() === valueDate.getMonth() && 
        appDate.getFullYear() === valueDate.getFullYear()
      );
    });
    
    if (dayAppointments.length === 0) return null;
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayAppointments.map(appointment => (
          <li key={appointment.id}>
            <Badge 
              status="processing" 
              text={`${formatTime(appointment.startDateTime)} - ${appointment.clientName}`} 
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
            {formatDate(currentDate)}
          </span>
          <Button icon={<RightOutlined />} onClick={handleNextMonth} />
        </Col>
        <Col>
          <Button onClick={() => setCurrentDate(new Date())}>Hoje</Button>
        </Col>
      </Row>
      
      <Calendar 
        value={dateToDay(currentDate)}
        dateCellRender={dateCellRender}
        onPanelChange={(date) => setCurrentDate(date.toDate())}
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