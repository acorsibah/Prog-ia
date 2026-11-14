// ====================================================================
// Controlador de Destinacao de Residuos - ViraCorpus
// ====================================================================

import { Request, Response } from 'express';
import { DestinacaoService } from '../services/DestinacaoService';
import { UsuarioAutenticado } from '../models/tiposDominio';

export class DestinacaoController {
  constructor(private destinacaoService: DestinacaoService) {}

  // Extrai usuario autenticado da requisicao
  private extrairUsuario(req: Request): UsuarioAutenticado {
    const usuario = (req as any).usuario;
    if (!usuario) {
      // Perfil padrao gestao para homologacao MVP
      return { id: 'usr-ges', nome: 'Gestor Operacional', perfil: 'GESTAO' };
    }
    return usuario;
  }

  // Confirma a destinacao com evidencias ambientais
  public confirmar = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuario = this.extrairUsuario(req);
      const resultado = await this.destinacaoService.confirmarDestinacao(usuario, req.body);
      res.status(200).json(resultado);
    } catch (erro: any) {
      res.status(400).json({ erro: erro.message || 'Falha ao confirmar destinação.' });
    }
  };
}

