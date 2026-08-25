require('dotenv').config();
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const COLUMN_MAP = {
  'Código Loja': 'codigo',
  'Nome Fantasia': 'nome_fantasia',
  'Razão Social': 'razao_social',
  'CNPJ': 'cnpj',
  'Status': 'status',
  'Unidade de Negócio': 'unidade_negocio',
  'Grupo Financeiro': 'grupo_financeiro',
  'Logradouro': 'logradouro',
  'Número': 'numero',
  'Complemento (Endereço Lojas)': 'complemento',
  'Bairro': 'bairro',
  'Cidade': 'cidade',
  'UF': 'uf',
  'CEP': 'cep',
  'Regional': 'regional',
  'Diretor': 'diretor',
  'Telefone Loja': 'telefone',
  'WhatsApp': 'whatsapp',
  'Hora Abertura': 'hora_abertura',
  'Hora Fechamento': 'hora_fechamento',
};

const STRING_FIELDS = new Set(['numero', 'cep', 'telefone', 'whatsapp']);
const TIME_FIELDS = new Set(['hora_abertura', 'hora_fechamento']);

function formatTime(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const totalSeconds = Math.round(value * 86400);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  const str = String(value).trim();
  if (!str) return null;
  const parts = str.split(':');
  if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  if (parts.length === 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
  return null;
}

function cleanValue(value, dbCol) {
  if (value == null || value === '') {
    if (dbCol === 'regional') return 'Não Informado';
    return null;
  }
  if (TIME_FIELDS.has(dbCol)) return formatTime(value);
  if (STRING_FIELDS.has(dbCol)) return String(value).trim();
  if (dbCol === 'regional') {
    const v = typeof value === 'string' ? value.trim() : String(value);
    return v || 'Não Informado';
  }
  return typeof value === 'string' ? value.trim() : value;
}

async function main() {
  const workbook = XLSX.readFile('Lojas_Organizado_v5 (1).xlsx');
  const sheet = workbook.Sheets['CADASTRO LOJAS'];
  if (!sheet) {
    console.error('Aba "CADASTRO LOJAS" não encontrada.');
    process.exit(1);
  }

  const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  const headers = rawData[1];
  if (!headers) {
    console.error('Cabeçalhos não encontrados na linha 2.');
    process.exit(1);
  }

  const colIndex = {};
  for (const [excelCol, dbCol] of Object.entries(COLUMN_MAP)) {
    const idx = headers.findIndex(h => h && String(h).trim() === excelCol);
    if (idx === -1) {
      console.warn(`Coluna "${excelCol}" não encontrada no Excel. Será ignorada.`);
    }
    colIndex[excelCol] = idx;
  }

  const rows = [];
  for (let i = 2; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.every(cell => cell == null || cell === '')) continue;

    const record = {};
    for (const [excelCol, dbCol] of Object.entries(COLUMN_MAP)) {
      const idx = colIndex[excelCol];
      const rawVal = idx >= 0 ? row[idx] : null;
      record[dbCol] = cleanValue(rawVal, dbCol);
    }

    if (record.codigo == null) continue;
    rows.push(record);
  }

  console.log(`Total de lojas lidas do Excel: ${rows.length}`);

  // Limpa a tabela para evitar duplicados
  const { error: deleteError } = await supabase.from('lojas').delete().neq('id', 0);
  if (deleteError) {
    console.error('Erro ao limpar tabela:', deleteError.message);
    process.exit(1);
  }
  console.log('Tabela limpa. Inserindo registros...');

  const BATCH_SIZE = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('lojas').insert(batch).select();

    if (error) {
      console.error(`Erro ao inserir lote ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errors++;
    } else {
      inserted += data.length;
    }
  }

  console.log(`\nResultado:`);
  console.log(`  Lojas inseridas com sucesso: ${inserted}`);
  if (errors > 0) console.log(`  Lotes com erro: ${errors}`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
