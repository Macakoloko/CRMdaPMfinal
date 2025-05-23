// Script para criar tabelas no Supabase via API REST
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configurações do Supabase
const SUPABASE_URL = 'https://aribaiysmgwwyoemdyxr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyaWJhaXlzbWd3d3lvZW1keXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjczODksImV4cCI6MjA1ODYwMzM4OX0.yoD85sSedTiy254-IFPpGTL2W1AYW5BFsrBPQ7ZqJjU';

// Função para executar SQL no Supabase
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL.replace('https://', ''),
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Status: ${res.statusCode}, Response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify({ sql }));
    req.end();
  });
}

// Função para verificar se uma tabela existe
async function tableExists(tableName) {
  try {
    const sql = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}')`;
    const result = await executeSql(sql);
    console.log(`Verificando tabela ${tableName}:`, result);
    return JSON.parse(result).exists;
  } catch (error) {
    console.error(`Erro ao verificar tabela ${tableName}:`, error);
    return false;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando criação de tabelas no Supabase...');
    
    // Verificar se a tabela clients existe
    const clientsExists = await tableExists('clients');
    console.log(`Tabela clients existe: ${clientsExists}`);
    
    if (!clientsExists) {
      console.log('Criando tabela clients...');
      const clientsSQL = fs.readFileSync(path.join(__dirname, 'create-clients-table.sql'), 'utf8');
      await executeSql(clientsSQL);
      console.log('Tabela clients criada com sucesso!');
    }
    
    // Verificar se a tabela appointments existe
    const appointmentsExists = await tableExists('appointments');
    console.log(`Tabela appointments existe: ${appointmentsExists}`);
    
    if (!appointmentsExists) {
      console.log('Criando tabela appointments...');
      const appointmentsSQL = fs.readFileSync(path.join(__dirname, 'create-supabase-tables.sql'), 'utf8');
      await executeSql(appointmentsSQL);
      console.log('Tabela appointments criada com sucesso!');
    }
    
    console.log('Todas as tabelas foram verificadas/criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
}

// Executar o script
main(); 