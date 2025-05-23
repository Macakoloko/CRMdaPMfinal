import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    fornecedor: '',
    codigo: '',
    categoria: ''
  });
  const [editando, setEditando] = useState(null);
  const [pesquisa, setPesquisa] = useState('');

  useEffect(() => {
    const carregarProdutos = async () => {
      const querySnapshot = await getDocs(collection(db, "produtos"));
      const lista = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setProdutos(lista);
    };
    
    carregarProdutos();
  }, []);

  // Manipular mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNovoProduto(prev => ({
      ...prev,
      [name]: name === 'preco' || name === 'estoque' ? parseFloat(value) || '' : value
    }));
  };

  // Adicionar novo produto
  const adicionarProduto = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "produtos"), novoProduto);
      setProdutos([...produtos, { id: docRef.id, ...novoProduto }]);
      setNovoProduto({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        fornecedor: '',
        codigo: '',
        categoria: ''
      });
    } catch (error) {
      console.error("Erro ao adicionar produto: ", error);
    }
  };

  // Excluir produto
  const excluirProduto = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, "produtos", id));
        setProdutos(produtos.filter(produto => produto.id !== id));
      } catch (error) {
        console.error("Erro ao excluir produto: ", error);
      }
    }
  };

  // Preparar edição
  const prepararEdicao = (produto) => {
    setEditando(produto.id);
    setNovoProduto(produto);
  };

  // Salvar edição
  const salvarEdicao = async () => {
    try {
      await updateDoc(doc(db, "produtos", editando), novoProduto);
      setProdutos(produtos.map(produto => 
        produto.id === editando ? { ...novoProduto, id: editando } : produto
      ));
      setEditando(null);
      setNovoProduto({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        fornecedor: '',
        codigo: '',
        categoria: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar produto: ", error);
    }
  };

  // Filtrar produtos baseado na pesquisa
  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    produto.codigo.includes(pesquisa) ||
    produto.categoria.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Cadastro de Produtos</h2>
      
      <form onSubmit={editando ? (e) => { e.preventDefault(); salvarEdicao(); } : adicionarProduto}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Nome do Produto:</label>
            <input 
              type="text" 
              className="form-control" 
              name="nome" 
              value={novoProduto.nome} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Código:</label>
            <input 
              type="text" 
              className="form-control" 
              name="codigo" 
              value={novoProduto.codigo} 
              onChange={handleChange} 
            />
          </div>
          <div className="col-md-3">
            <label>Categoria:</label>
            <input 
              type="text" 
              className="form-control" 
              name="categoria" 
              value={novoProduto.categoria} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-12">
            <label>Descrição:</label>
            <textarea 
              className="form-control" 
              name="descricao" 
              value={novoProduto.descricao} 
              onChange={handleChange} 
              rows="2"
            />
          </div>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Preço (€):</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-control" 
              name="preco" 
              value={novoProduto.preco} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-3">
            <label>Estoque:</label>
            <input 
              type="number" 
              className="form-control" 
              name="estoque" 
              value={novoProduto.estoque} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="col-md-6">
            <label>Fornecedor:</label>
            <input 
              type="text" 
              className="form-control" 
              name="fornecedor" 
              value={novoProduto.fornecedor} 
              onChange={handleChange} 
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary">
          {editando ? "Atualizar Produto" : "Adicionar Produto"}
        </button>
        {editando && (
          <button 
            type="button" 
            className="btn btn-secondary ms-2" 
            onClick={() => {
              setEditando(null);
              setNovoProduto({
                nome: '',
                descricao: '',
                preco: '',
                estoque: '',
                fornecedor: '',
                codigo: '',
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
            placeholder="Pesquisar produto por nome, código ou categoria" 
            value={pesquisa} 
            onChange={e => setPesquisa(e.target.value)} 
          />
        </div>
      </div>
      
      <h3>Lista de Produtos</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Fornecedor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.codigo}</td>
                <td>{produto.nome}</td>
                <td>{produto.categoria}</td>
                <td>€ {parseFloat(produto.preco).toFixed(2)}</td>
                <td>{produto.estoque}</td>
                <td>{produto.fornecedor}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-1" 
                    onClick={() => prepararEdicao(produto)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => excluirProduto(produto.id)}
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

export default Produtos; 