import React, { useState } from 'react';
import { Button, Form, Modal, TimePicker, DatePicker, Input, Select } from 'antd';

const NewAppointmentForm = ({ visible, onClose, onSave, clients, services }) => {
  const [form] = Form.useForm();
  const [showQuickClientForm, setShowQuickClientForm] = useState(false);
  const [showQuickServiceForm, setShowQuickServiceForm] = useState(false);
  
  const handleSubmit = (values) => {
    // Combine date and time values
    const startDateTime = values.date.clone().set({
      hour: values.startTime.hour(),
      minute: values.startTime.minute()
    });
    
    const endDateTime = values.date.clone().set({
      hour: values.endTime.hour(),
      minute: values.endTime.minute()
    });
    
    const appointment = {
      ...values,
      startDateTime,
      endDateTime,
      id: Date.now() // Temporary ID for new appointment
    };
    
    onSave(appointment);
    form.resetFields();
    onClose();
  };
  
  const handleQuickClientSave = (newClient) => {
    // Add new client logic goes here
    setShowQuickClientForm(false);
  };
  
  const handleQuickServiceSave = (newService) => {
    // Add new service logic goes here
    setShowQuickServiceForm(false);
  };
  
  return (
    <Modal
      title="Novo Agendamento"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Data" name="date" rules={[{ required: true }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item label="Horário de Início" name="startTime" rules={[{ required: true }]} style={{ flex: 1 }}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Horário de Término" name="endTime" rules={[{ required: true }]} style={{ flex: 1 }}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px' }}>
          <Form.Item label="Cliente" name="clientId" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
            <Select placeholder="Selecione um cliente">
              {clients.map(client => (
                <Select.Option key={client.id} value={client.id}>
                  {client.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="link" onClick={() => setShowQuickClientForm(true)}>
            + Novo
          </Button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px' }}>
          <Form.Item label="Serviço" name="serviceId" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
            <Select placeholder="Selecione um serviço">
              {services.map(service => (
                <Select.Option key={service.id} value={service.id}>
                  {service.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Button type="link" onClick={() => setShowQuickServiceForm(true)}>
            + Novo
          </Button>
        </div>
        
        <Form.Item label="Observações" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" htmlType="submit">Salvar</Button>
        </div>
      </Form>
      
      {/* Modal para criação rápida de cliente */}
      <QuickClientForm 
        visible={showQuickClientForm} 
        onClose={() => setShowQuickClientForm(false)}
        onSave={handleQuickClientSave}
      />
      
      {/* Modal para criação rápida de serviço */}
      <QuickServiceForm 
        visible={showQuickServiceForm} 
        onClose={() => setShowQuickServiceForm(false)}
        onSave={handleQuickServiceSave}
      />
    </Modal>
  );
};

export default NewAppointmentForm; 