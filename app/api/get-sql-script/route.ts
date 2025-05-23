import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Caminho para o arquivo SQL
    const filePath = path.join(process.cwd(), 'scripts', 'create-tables.sql');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Script SQL não encontrado' },
        { status: 404 }
      );
    }
    
    // Ler o conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Retornar o conteúdo como texto
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Erro ao ler o script SQL:', error);
    return NextResponse.json(
      { error: 'Erro ao ler o script SQL' },
      { status: 500 }
    );
  }
} 