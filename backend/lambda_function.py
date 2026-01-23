import json
import boto3
import os
from decimal import Decimal

# CONFIGURAÇÃO: Nome da tabela via Variável de Ambiente ou padrão
TABLE_NAME = os.environ.get('NOME_DA_TABELA', 'portfolio-metadata')

# Inicializa o recurso fora do handler para performance (Cold Start mitigation)
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

class DecimalEncoder(json.JSONEncoder):
    """ Helper para converter Decimal do DynamoDB para JSON """
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """ Função principal que a AWS vai chamar """
    print(f"Evento recebido: {json.dumps(event)}")
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }

    try:
        # Busca os itens no DynamoDB
        response = table.scan()
        items = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(items, cls=DecimalEncoder)
        }
    except Exception as e:
        print(f"Erro: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"erro": str(e)})
        }