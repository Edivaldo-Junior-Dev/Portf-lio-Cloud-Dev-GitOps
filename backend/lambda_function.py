import json
import boto3
from decimal import Decimal
import os

# --- CONFIGURAÇÃO ---
# Nome da tabela: Usa variável de ambiente se existir, senão usa o padrão do projeto
TABLE_NAME = os.environ.get('TABLE_NAME', 'portfolio-metadata')

# Inicializa o recurso do DynamoDB fora do handler para reaproveitar conexões (Cold Start mitigation)
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    """
    Helper avançado para converter números do DynamoDB (Decimal) para tipos nativos do Python.
    Resolve o erro: "Object of type Decimal is not JSON serializable"
    """
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Se for um número inteiro exato (ex: 5.0), converte para int (5)
            if obj % 1 == 0:
                return int(obj)
            # Caso contrário, converte para float
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Função Lambda para listar todos os projetos do Portfólio Cloud Dev.
    """
    print(f"Evento recebido: {json.dumps(event)}")
    print(f"Acessando tabela: {TABLE_NAME}")

    # Headers Rigorosos para CORS (Permite que o Frontend React acesse a resposta)
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", # Em produção, recomenda-se trocar pelo domínio específico
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
    }

    # Tratamento específico para Pre-flight Request (OPTIONS)
    # Isso evita erros de CORS antes mesmo da Lambda tentar ler o banco
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        # 1. Faz a leitura de todos os itens da tabela (Scan)
        # Nota: Scan é eficiente para poucos itens (< 1MB). Para grandes volumes, usar Query.
        response = table.scan()
        items = response.get('Items', [])
        
        print(f"Sucesso: {len(items)} itens encontrados.")

        # 2. Retorna a lista de projetos com status 200
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(items, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"ERRO CRÍTICO ao acessar DynamoDB: {str(e)}")
        
        # 3. Retorna erro estruturado (500)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                "error": "Erro interno ao buscar dados no banco de dados",
                "details": str(e)
            })
        }
