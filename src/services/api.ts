
import axios from 'axios';

// CHECKLIST ITEM 3: Configurar a Base da API
// Assim que o Gabriel te passar a URL do API Gateway (AWS), você substitui a string abaixo.
const api = axios.create({
  baseURL: 'A_URL_QUE_O_GABRIEL_VAI_PASSAR'
});

export default api;
