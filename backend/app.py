import os
# Importa a biblioteca para trabalhar com expressoes regulares (buscar e substituir padroes de texto)
import re

# Importa o Flask (para criar o servidor web) e o jsonify (para formatar respostas no formato JSON)
from flask import Flask, jsonify, send_from_directory

# Importa o CORS para permitir que o navegador do front-end converse com este back-end sem bloqueios de seguranca
from flask_cors import CORS

# Importa a biblioteca requests para fazer chamadas HTTP para sites e APIs externas
import requests

# Diretorio dos arquivos estaticos gerados pelo build do React
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

# Inicializa a aplicacao Flask (cria o nosso servidor)
app = Flask(__name__, static_folder=static_dir, static_url_path='')

# Habilita o CORS no nosso servidor para liberar o acesso ao front-end
CORS(app)

# Rota para servir o front-end React compilado
@app.route('/', defaults={'path': ''}, methods=['GET'])
@app.route('/<path:path>', methods=['GET'])
def serve_frontend(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Rota de API não encontrada.'}), 404

    target = os.path.join(static_dir, path)
    if path and os.path.exists(target) and os.path.isfile(target):
        return send_from_directory(static_dir, path)

    index_path = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_dir, 'index.html')

    return jsonify({
        'status': 'API Correios Busca CEP Online',
        'endpoint': '/api/cep/<cep>'
    }), 200

# Define uma rota (endereco na web) que aceita o metodo GET e recebe o CEP na propria URL
@app.route('/api/cep/<cep>', methods=['GET'])
def get_cep(cep):
    # Remove qualquer caractere que nao seja numero (ex: traços, pontos ou espacos)
    clean_cep = re.sub(r'\D', '', cep)

    # Verifica se o CEP possui exatamente 8 numeros
    if len(clean_cep) != 8:
        # Retorna uma mensagem de erro com codigo HTTP 400 (requisicao invalida)
        return jsonify({'error': 'CEP inválido. Deve conter 8 dígitos.'}), 400

    try:
        # Faz uma requisicao na internet para a API do ViaCEP enviando o CEP limpo
        response = requests.get(f'https://viacep.com.br/ws/{clean_cep}/json/', timeout=10)
        
        # Converte a resposta recebida da API externa para o formato de dicionario/JSON
        data = response.json()

        # O ViaCEP retorna {'erro': 'true'} quando o CEP nao existe no cadastro dos Correios
        if data.get('erro'):
            # Retorna aviso de que o CEP nao foi encontrado com codigo HTTP 404 (nao encontrado)
            return jsonify({'error': 'CEP não encontrado.'}), 404

        # Se deu tudo certo, devolve os dados do endereco para o front-end com codigo HTTP 200 (sucesso)
        return jsonify(data), 200

    except requests.RequestException:
        # Caso ocorra falha de conexao com a internet ou na API externa, retorna erro 500 (erro interno)
        return jsonify({'error': 'Erro ao consultar o serviço ViaCEP.'}), 500

# Executa o servidor na porta 3001 quando este arquivo e executado diretamente
if __name__ == '__main__':
    # O parametro host='0.0.0.0' torna o servidor acessivel na rede local, na porta 3001
    app.run(host='0.0.0.0', port=3001)
