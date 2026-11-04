// Importa o hook useState do React para guardar e atualizar informacoes na memoria da tela
import { useState } from 'react';

function App() {
  // Estado para armazenar o texto do CEP digitado pelo usuario no campo de input
  const [cep, setCep] = useState('');

  // Estado para armazenar os dados do endereco que chegam do back-end
  const [endereco, setEndereco] = useState(null);

  // Estado que indica se a busca esta em andamento (para desabilitar o botao e evitar cliques repetidos)
  const [loading, setLoading] = useState(false);

  // Estado para guardar mensagens de erro caso o CEP seja invalido ou nao seja encontrado
  const [erro, setErro] = useState('');

  // Funcao principal que e chamada quando o usuario clica no botao BUSCAR ou aperta Enter
  const buscarCep = async () => {
    // Remove qualquer caractere que nao seja numero digitado pelo usuario
    const cleanCep = cep.replace(/\D/g, '');

    // Valida se o CEP contem exatamente 8 numeros antes de fazer a requisicao
    if (cleanCep.length !== 8) {
      setErro('Informe um CEP válido com 8 dígitos.');
      setEndereco(null);
      return;
    }

    // Marca o inicio do carregamento e limpa erros ou enderecos anteriores da tela
    setLoading(true);
    setErro('');
    setEndereco(null);

    try {
      let data = null;
      let ok = false;

      try {
        // Tenta chamada no backend local
        const response = await fetch(`http://localhost:3001/api/cep/${cleanCep}`);
        data = await response.json();
        ok = response.ok;
      } catch {
        // Se o backend local nao estiver disponivel (ex: deploy em producao), consulta o ViaCEP diretamente
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        data = await response.json();
        if (data.erro) {
          data = { error: 'CEP não encontrado.' };
          ok = false;
        } else {
          ok = true;
        }
      }

      if (!ok) {
        setErro(data?.error || 'Erro ao buscar o CEP.');
      } else {
        setEndereco(data);
      }
    } catch (err) {
      setErro('Erro ao consultar o serviço de CEP.');
    } finally {
      // Finaliza o estado de carregamento independente de sucesso ou falha
      setLoading(false);
    }
  };

  // Funcao que escuta as teclas do teclado para permitir buscar ao pressionar a tecla "Enter"
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      buscarCep();
    }
  };

  // Renderiza a interface visual (HTML / JSX) que o usuario ve na tela
  return (
    <div className="container">
      <h1>Consulta de Endereço por CEP</h1>

      <div className="input-group">
        {/* Campo de texto onde o usuario digita o CEP */}
        <input
          type="text"
          placeholder="Digite o CEP (ex: 01001000)"
          value={cep}
          onChange={(e) => setCep(e.target.value)} // Atualiza o estado 'cep' a cada letra ou numero digitado
          onKeyDown={handleKeyDown}
          maxLength={9}
        />
        {/* Botao de acao para disparar a busca do CEP */}
        <button onClick={buscarCep} disabled={loading}>
          {loading ? 'BUSCANDO...' : 'BUSCAR'}
        </button>
      </div>

      {/* Exibe o aviso em vermelho apenas se houver alguma mensagem de erro */}
      {erro && <div className="error-message">{erro}</div>}

      {/* Exibe o cartao com os campos do endereco apenas quando os dados existirem */}
      {endereco && (
        <div className="result-card">
          <h2>Endereço Encontrado:</h2>
          <p><strong>Logradouro:</strong> {endereco.logradouro || 'Não informado'}</p>
          <p><strong>Complemento:</strong> {endereco.complemento || 'Não informado'}</p>
          <p><strong>Bairro:</strong> {endereco.bairro || 'Não informado'}</p>
          <p><strong>Cidade:</strong> {endereco.localidade}</p>
          <p><strong>Estado (UF):</strong> {endereco.uf}</p>
          <p><strong>CEP:</strong> {endereco.cep}</p>
          <p><strong>DDD:</strong> {endereco.ddd}</p>
        </div>
      )}
    </div>
  );
}

export default App;
