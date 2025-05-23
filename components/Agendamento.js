import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';

function Agendamento() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: '',
    servico: '',
    data: '',
    horaInicio: '',
    duracao: '',
    profissional: '',
    observacoes: ''
  });
  const [editando, setEditando] = useState(null);
  // Estado para controlar se estamos no cliente ou não
  const [isClient, setIsClient] = useState(false);
  
  // Configurando localizer apenas no cliente
  const [localizer, setLocalizer] = useState(null);
  
  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
    moment.locale('pt-br');
    setLocalizer(momentLocalizer(moment));
  }, []);

  // Carregar agendamentos do Firebase
  useEffect(() => {
    const carregarAgendamentos = async () => {
      const querySnapshot = await getDocs(collection(db, "agendamentos"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAgendamentos(lista);
    };
    
    carregarAgendamentos();
  }, []);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoAgendamento(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Adicionar novo agendamento
  const adicionarAgendamento = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "agendamentos"), novoAgendamento);
      setAgendamentos([...agendamentos, novoAgendamento]);
      setNovoAgendamento({
        cliente: '',
        servico: '',
        data: '',
        horaInicio: '',
        duracao: '',
        profissional: '',
        observacoes: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar agendamento: ", error);
    }
  };

  // Excluir agendamento
  const excluirAgendamento = async (id) => {
    try {
      await deleteDoc(doc(db, "agendamentos", id));
      setAgendamentos(agendamentos.filter(agenda => agenda.id !== id));
    } catch (error) {
      console.error("Erro ao excluir agendamento: ", error);
    }
  };

  // Preparar edição
  const prepararEdicao = (agendamento) => {
    setEditando(agendamento.id);
    setNovoAgendamento(agendamento);
  };

  // Salvar edição
  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "agendamentos", editando), novoAgendamento);
      setAgendamentos(agendamentos.map(agenda => 
        agenda.id === editando ? { ...novoAgendamento, id: editando } : agenda
      ));
      setEditando(null);
      setNovoAgendamento({
        cliente: '',
        servico: '',
        data: '',
        horaInicio: '',
        duracao: '',
        profissional: '',
        observacoes: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar agendamento: ", error);
    }
  };

  // Converter agendamentos para o formato do calendário
  const eventosCalendario = agendamentos.map(agendamento => {
    const [year, month, day] = agendamento.data.split('-').map(Number);
    const [hours, minutes] = agendamento.horaInicio.split(':').map(Number);
    
    const inicio = new Date(year, month - 1, day, hours, minutes);
    const fim = new Date(inicio);
    fim.setMinutes(fim.getMinutes() + parseInt(agendamento.duracao));
    
    return {
      id: agendamento.id,
      title: `${agendamento.cliente} - ${agendamento.servico}`,
      start: inicio,
      end: fim,
      resource: agendamento.profissional
    };
  });

  return (
    <div className="container">
      <h2>Agendamentos</h2>
      
      <form onSubmit={editando ? (e) => { e.preventDefault(); salvarEdicao(); } : adicionarAgendamento}>
        <div className="row mb-3">
          <div className="col">
            <label>Cliente:</label>
            <input 
              type="text" 
              className="form-control" 
              name="cliente" 
              value={novoAgendamento.cliente} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col">
            <label>Serviço:</label>
            <input 
              type="text" 
              className="form-control" 
              name="servico" 
              value={novoAgendamento.servico} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col">
            <label>Data:</label>
            <input 
              type="date" 
              className="form-control" 
              name="data" 
              value={novoAgendamento.data} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col">
            <label>Hora de Início:</label>
            <input 
              type="time" 
              className="form-control" 
              name="horaInicio" 
              value={novoAgendamento.horaInicio} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col">
            <label>Duração (minutos):</label>
            <input 
              type="number" 
              className="form-control" 
              name="duracao" 
              value={novoAgendamento.duracao} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col">
            <label>Profissional:</label>
            <input 
              type="text" 
              className="form-control" 
              name="profissional" 
              value={novoAgendamento.profissional} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col">
            <label>Observações:</label>
            <textarea 
              className="form-control" 
              name="observacoes" 
              value={novoAgendamento.observacoes} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          {editando ? "Atualizar Agendamento" : "Adicionar Agendamento"}
        </button>
        {editando && (
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => {
              setEditando(null);
              setNovoAgendamento({
                cliente: '',
                servico: '',
                data: '',
                horaInicio: '',
                duracao: '',
                profissional: '',
                observacoes: ''
              });
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>
      
      <hr />
      
      <h3>Lista de Agendamentos</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Serviço</th>
            <th>Data</th>
            <th>Início</th>
            <th>Duração</th>
            <th>Profissional</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {agendamentos.map((agendamento) => (
            <tr key={agendamento.id}>
              <td>{agendamento.cliente}</td>
              <td>{agendamento.servico}</td>
              <td>{agendamento.data}</td>
              <td>{agendamento.horaInicio}</td>
              <td>{agendamento.duracao} min</td>
              <td>{agendamento.profissional}</td>
              <td>
                <button 
                  className="btn btn-sm btn-warning me-1" 
                  onClick={() => prepararEdicao(agendamento)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => excluirAgendamento(agendamento.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Renderizar o calendário apenas no cliente */}
      <h3 className="mt-4">Calendário de Agendamentos</h3>
      <div className="calendar-container mt-3" style={{ height: 600 }}>
        {isClient && localizer ? (
          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Não há agendamentos neste período."
            }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView='week'
          />
        ) : (
          <div>Carregando calendário...</div>
        )}
      </div>
    </div>
  );
}

export default Agendamento; 