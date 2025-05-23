import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

function Equipe() {
  const [membros, setMembros] = useState([]);
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    funcao: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    dataContratacao: '',
    especialidades
  });

  useEffect(() => {
    const carregarMembros = async () => {
      const querySnapshot = await getDocs(collection(db, "membros"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setMembros(lista);
    };
    
    carregarMembros();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoMembro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarMembro = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "membros"), novoMembro);
      setMembros([...membros, { id: docRef.id, ...novoMembro }]);
      setNovoMembro({
        nome: '',
        funcao: '',
        telefone: '',
        email: '',
        dataNascimento: '',
        dataContratacao: '',
        especialidades: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar membro: ", error);
    }
  };

  const excluirMembro = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este membro?")) {
      try {
        await deleteDoc(doc(db, "membros", id));
        setMembros(membros.filter(membro => membro.id !== id));
      } catch (error) {
        console.error("Erro ao excluir membro: ", error);
      }
    }
  };

  const prepararEdicao = (membro) => {
    setNovoMembro(membro);
  };

  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "membros", novoMembro.id), novoMembro);
      setMembros(membros.map(membro => 
        membro.id === novoMembro.id ? { ...novoMembro, id: novoMembro.id } : membro
      ));
      setNovoMembro({
        nome: '',
        funcao: '',
        telefone: '',
        email: '',
        dataNascimento: '',
        dataContratacao: '',
        especialidades: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar membro: ", error);
    }
  };

  return (
    <div className="container">
      <h2>Cadastro de Membros</h2>
      
      <form onSubmit={adicionarMembro}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Nome:</label>
            <input 
              type="text" 
              className="form-control" 
              name="nome" 
              value={novoMembro.nome} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Função:</label>
            <input 
              type="text" 
              className="form-control" 
              name="funcao" 
              value={novoMembro.funcao} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-3">
            <label>Telefone:</label>
            <input 
              type="text" 
              className="form-control" 
              name="telefone" 
              value={novoMembro.telefone} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Email:</label>
            <input 
              type="email" 
              className="form-control" 
              name="email" 
              value={novoMembro.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Data de Nascimento:</label>
            <input 
              type="date" 
              className="form-control" 
              name="dataNascimento" 
              value={novoMembro.dataNascimento} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-3">
            <label>Data de Contratação:</label>
            <input 
              type="date" 
              className="form-control" 
              name="dataContratacao" 
              value={novoMembro.dataContratacao} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-12">
            <label>Especialidades:</label>
            <textarea 
              className="form-control" 
              name="especialidades" 
              value={novoMembro.especialidades} 
              onChange={handleChange} 
              rows="2"
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          Adicionar Membro
        </button>
      </form>
      
      <hr />
      
      <h3>Lista de Membros</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Data de Nascimento</th>
              <th>Data de Contratação</th>
              <th>Especialidades</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {membros.map((membro) => (
              <tr key={membro.id}>
                <td>{membro.nome}</td>
                <td>{membro.funcao}</td>
                <td>{membro.telefone}</td>
                <td>{membro.email}</td>
                <td>{membro.dataNascimento}</td>
                <td>{membro.dataContratacao}</td>
                <td>{membro.especialidades}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-1" 
                    onClick={() => prepararEdicao(membro)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => excluirMembro(membro.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Equipe; 