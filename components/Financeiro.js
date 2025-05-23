import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

function Financeiro() {
  const [transacoes, setTransacoes] = useState([]);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'receita',
    descricao: '',
    valor: '',
    data: '',
    categoria: '',
    formaPagamento: '',
    observacoes: ''
  });
  const [editando, setEditando] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Carregar transações do Firebase
  useEffect(() => {
    const carregarTransacoes = async () => {
      const querySnapshot = await getDocs(collection(db, "financeiro"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setTransacoes(lista);
    };
    
    carregarTransacoes();
  }, []);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovaTransacao(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || '' : value
    }));
  };

  // Adicionar nova transação
  const adicionarTransacao = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "financeiro"), novaTransacao);
      setTransacoes([...transacoes, { id: docRef.id, ...novaTransacao }]);
      setNovaTransacao({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: '',
        categoria: '',
        formaPagamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar transação: ", error);
    }
  };

  // Excluir transação
  const excluirTransacao = async (id) => {
    try {
      await deleteDoc(doc(db, "financeiro", id));
      setTransacoes(transacoes.filter(transacao => transacao.id !== id));
    } catch (error) {
      console.error("Erro ao excluir transação: ", error);
    }
  };

  // Preparar edição
  const prepararEdicao = (transacao) => {
    setEditando(transacao.id);
    setNovaTransacao(transacao);
  };

  // Salvar edição
  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "financeiro", editando), novaTransacao);
      setTransacoes(transacoes.map(transacao => 
        transacao.id === editando ? { ...novaTransacao, id: editando } : transacao
      ));
      setEditando(null);
      setNovaTransacao({
        tipo: 'receita',
        descricao: '',
        valor: '',
        data: '',
        categoria: '',
        formaPagamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar transação: ", error);
    }
  };

  // Filtrar transações
  const transacoesFiltradas = filtroTipo === 'todos' 
    ? transacoes 
    : transacoes.filter(t => t.tipo === filtroTipo);

  // Calcular totais
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    
  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + (parseFloat(t.valor) || 0), 0);
    
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="container">
      <h2>Financeiro</h2>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total de Receitas</h5>
              <p className="card-text h4">€ {totalReceitas.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Total de Despesas</h5>
              <p className="card-text h4">€ {totalDespesas.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className={`card ${saldo >= 0 ? 'bg-primary' : 'bg-warning'} text-white`}>
            <div className="card-body">
              <h5 className="card-title">Saldo</h5>
              <p className="card-text h4">€ {saldo.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={editando ? (e) => { e.preventDefault(); salvarEdicao(); } : adicionarTransacao}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Tipo:</label>
            <select 
              className="form-select" 
              name="tipo" 
              value={novaTransacao.tipo} 
              onChange={handleChange} 
              required
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div className="col-md-6">
            <label>Descrição:</label>
            <input 
              type="text" 
              className="form-control" 
              name="descricao" 
              value={novaTransacao.descricao} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Valor (€):</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-control" 
              name="valor" 
              value={novaTransacao.valor} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Data:</label>
            <input 
              type="date" 
              className="form-control" 
              name="data" 
              value={novaTransacao.data} 
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
              value={novaTransacao.categoria} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Forma de Pagamento:</label>
            <input 
              type="text" 
              className="form-control" 
              name="formaPagamento" 
              value={novaTransacao.formaPagamento} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Observações:</label>
            <input 
              type="text" 
              className="form-control" 
              name="observacoes" 
              value={novaTransacao.observacoes} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          {editando ? "Atualizar Transação" : "Adicionar Transação"}
        </button>
        {editando && (
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => {
              setEditando(null);
              setNovaTransacao({
                tipo: 'receita',
                descricao: '',
                valor: '',
                data: '',
                categoria: '',
                formaPagamento: '',
                observacoes: ''
              });
            }}
          >
            Cancelar Edição
          </button>
        )}
      </form>
      
      <hr />
      
      <div className="mb-3">
        <label className="me-2">Filtrar por:</label>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="radio" 
            name="filtroTipo" 
            id="filtroTodos" 
            value="todos" 
            checked={filtroTipo === 'todos'} 
            onChange={() => setFiltroTipo('todos')} 
          />
          <label className="form-check-label" htmlFor="filtroTodos">Todos</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="radio" 
            name="filtroTipo" 
            id="filtroReceitas" 
            value="receita" 
            checked={filtroTipo === 'receita'} 
            onChange={() => setFiltroTipo('receita')} 
          />
          <label className="form-check-label" htmlFor="filtroReceitas">Receitas</label>
        </div>
        <div className="form-check form-check-inline">
          <input 
            className="form-check-input" 
            type="radio" 
            name="filtroTipo" 
            id="filtroDespesas" 
            value="despesa" 
            checked={filtroTipo === 'despesa'} 
            onChange={() => setFiltroTipo('despesa')} 
          />
          <label className="form-check-label" htmlFor="filtroDespesas">Despesas</label>
        </div>
      </div>
      
      <h3>Lista de Transações</h3>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Forma de Pagamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transacoesFiltradas.map((transacao) => (
            <tr key={transacao.id}>
              <td>{transacao.tipo}</td>
              <td>{transacao.descricao}</td>
              <td>{transacao.valor}</td>
              <td>{transacao.data}</td>
              <td>{transacao.categoria}</td>
              <td>{transacao.formaPagamento}</td>
              <td>
                <button 
                  className="btn btn-sm btn-warning me-1" 
                  onClick={() => prepararEdicao(transacao)}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger" 
                  onClick={() => excluirTransacao(transacao.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Financeiro; 