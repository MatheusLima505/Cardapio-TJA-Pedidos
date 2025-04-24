import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwqkuzyoxrdjzboieyvb.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3cWt1enlveHJkanpib2lleXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzk0MzEsImV4cCI6MjA2MDUxNTQzMX0.30pCulyrk0qAr9Xqvp0xS0_AP00YIKBGaQJDV4OVQoM';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [pedidos, setPedidos] = useState([]);
  const [resumo, setResumo] = useState({});

  useEffect(() => {
    const fetchPedidos = async () => {
      const agora = new Date();
      const inicioDoDia = new Date(agora.setHours(0, 0, 0, 0)).toISOString();
      const fimDoDia = new Date();
      fimDoDia.setHours(24, 0, 0, 0);

      const { data, error } = await supabase
        .from('Pedidos')
        .select('*')
        .gte('created_at', inicioDoDia)
        .lt('created_at', fimDoDia.toISOString());

      if (error) {
        console.error('Erro ao carregar pedidos:', error);
      } else {
        setPedidos(data);

        // Gerar o resumo total de itens
        const contagem = {};
        data.forEach((pedido) => {
          if (Array.isArray(pedido.item)) {
            pedido.item.forEach(({ nome, quantidade }) => {
              if (!contagem[nome]) contagem[nome] = 0;
              contagem[nome] += quantidade;
            });
          }
        });
        setResumo(contagem);
      }
    };

    fetchPedidos();
  }, []);

  const formatHora = (timestamp) => {
    const hora = new Date(timestamp);
    return hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h1>Pedidos de hoje</h1>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Item</th>
            <th>Turma</th>
            <th>Contato</th>
            <th>Observação</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{formatHora(pedido.created_at)}</td>
              <td>{pedido.cliente}</td>
              <td>
                <ul>
                  {pedido.item?.map((i, idx) => (
                    <li key={idx}>
                      {i.nome} - {i.quantidade}x R${i.preco}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{pedido.turma}</td>
              <td>{pedido.contato}</td>
              <td>{pedido.observacao}</td>
              <td>R${pedido.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Resumo do dia</h2>
      <ul>
        {Object.entries(resumo).map(([nome, total]) => (
          <li key={nome}>
            {nome}: {total} unidades
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
