import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    descricao: '',
    duracao: '',
    preco: '',
    categoria: ''
  });
  const [editando, setEditando] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  // Carregar serviços do Firebase
  useEffect(() => {
    const carregarServicos = async () => {
      const querySnapshot = await getDocs(collection(db, "servicos"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setServicos(lista);
    };
    
    carregarServicos();
  }, []);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoServico(prev => ({
      ...prev,
      [name]: name === 'preco' || name === 'duracao' ? parseFloat(value) || '' : value
    }));
  };

  // Adicionar novo serviço
  const adicionarServico = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "servicos"), novoServico);
      setServicos([...servicos, { id: docRef.id, ...novoServico }]);
      setNovoServico({
        nome: '',
        descricao: '',
        duracao: '',
        preco: '',
        categoria: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar serviço: ", error);
    }
  };

  // Excluir serviço
  const excluirServico = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteDoc(doc(db, "servicos", id));
        setServicos(servicos.filter(servico => servico.id !== id));
      } catch (error) {
        console.error("Erro ao excluir serviço: ", error);
      }
    }
  };

  // Preparar edição
  const prepararEdicao = (servico) => {
    setEditando(servico.id);
    setNovoServico(servico);
  };

  // Salvar edição
  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "servicos", editando), novoServico);
      setServicos(servicos.map(servico => 
        servico.id === editando ? { ...novoServico, id: editando } : servico
      ));
      setEditando(null);
      setNovoServico({
        nome: '',
        descricao: '',
        duracao: '',
        preco: '',
        categoria: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar serviço: ", error);
    }
  };

  // Filtrar serviços baseado na pesquisa
  const servicosFiltrados = servicos.filter(servico => 
    servico.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    servico.categoria.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Cadastro de Serviços</h2>
      
      <form onSubmit={editando ? (e) => { e.preventDefault(); salvarEdicao(); } : adicionarServico}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Nome do Serviço:</label>
            <input 
              type="text" 
              className="form-control" 
              name="nome" 
              value={novoServico.nome} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Duração (minutos):</label>
            <input 
              type="number" 
              className="form-control" 
              name="duracao" 
              value={novoServico.duracao} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Categoria:</label>
            <input 
              type="text" 
              className="form-control" 
              name="categoria" 
              value={novoServico.categoria} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-9">
            <label>Descrição:</label>
            <textarea 
              className="form-control" 
              name="descricao" 
              value={novoServico.descricao} 
              onChange={handleChange} 
              rows="2"
            />
          </div>
          <div className="col-md-3">
            <label>Preço (€):</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-control" 
              name="preco" 
              value={novoServico.preco} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          {editando ? "Atualizar Serviço" : "Adicionar Serviço"}
        </button>
        {editando && (
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => {
              setEditando(null);
              setNovoServico({
                nome: '',
                descricao: '',
                duracao: '',
                preco: '',
                categoria: ''
              });
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>
      
      <hr />
      
      <div className="row mb-3">
        <div className="col">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Pesquisar serviço por nome ou categoria" 
            value={pesquisa} 
            onChange={e => setPesquisa(e.target.value)} 
          />
        </div>
      </div>
      
      <h3>Lista de Serviços</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Duração</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicosFiltrados.map((servico) => (
              <tr key={servico.id}>
                <td>{servico.nome}</td>
                <td>{servico.descricao}</td>
                <td>{servico.duracao} min</td>
                <td>€ {parseFloat(servico.preco).toFixed(2)}</td>
                <td>{servico.categoria}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-1" 
                    onClick={() => prepararEdicao(servico)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => excluirServico(servico.id)}
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

export default Servicos; 