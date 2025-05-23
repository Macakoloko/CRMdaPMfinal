import React from 'react';
import { Button, Form, Modal, Input, InputNumber } from 'antd';

const QuickServiceForm = ({ visible, onClose, onSave }) => {
  const [form] = Form.useForm();
  
  const handleSubmit = (values) => {
    const newService = {
      ...values,
      id: Date.now() // Temporary ID
    };
    
    onSave(newService);
    form.resetFields();
  };
  
  return (
    <Modal
      title="Adicionar Serviço"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        
        <Form.Item label="Duração (minutos)" name="duration" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item label="Preço" name="price" rules={[{ required: true }]}>
          <InputNumber
            formatter={value => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/€\s?|(,*)/g, '')}
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" htmlType="submit">Adicionar</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default QuickServiceForm; 